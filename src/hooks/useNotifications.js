import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  fetchUnreadCount,
} from '@/services/notificationsService';

function safeJsonStringify(obj) {
  // Stable-ish string for simple POJOs. Good enough for caching query filters.
  try {
    return JSON.stringify(obj, Object.keys(obj || {}).sort());
  } catch {
    return String(obj);
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Reusable notifications hook with:
 * - fetching + error/loading/empty state
 * - caching (avoid unnecessary re-fetch on page changes)
 * - client-side fallback pagination if backend ignores page/limit
 */
export function useNotifications({
  initialPage = 1,
  limit = 10,
  filters = {},
  pollIntervalMs = 0,
  enabled = true,
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]); // for client-side fallback pagination
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState(null); // 'client' | 'server' | null
  const [unreadCount, setUnreadCount] = useState(0);

  const cacheRef = useRef(new Map());
  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const queryKey = useMemo(
    () => safeJsonStringify({ filters: filters || {}, limit }),
    [filters, limit],
  );

  const recomputeClientPagination = useCallback(
    (all, currentPage) => {
      const safeAll = Array.isArray(all) ? all : [];
      const safeLimit = Math.max(1, limit);
      const safeTotal = safeAll.length;
      const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
      const safePage = clamp(currentPage, 1, totalPages);
      const startIndex = (safePage - 1) * safeLimit;
      const endIndex = startIndex + safeLimit;
      const pageItems = safeAll.slice(startIndex, endIndex);
      return {
        pageItems,
        total: safeTotal,
        totalPages,
        safePage,
        startIndex,
        endIndex,
      };
    },
    [limit],
  );

  const applyFiltersForPagination = useCallback(
    (list) => {
      const safeList = Array.isArray(list) ? list : [];
      const unreadOnly = !!filters?.unread;
      if (unreadOnly) return safeList.filter((n) => !n?.read);
      return safeList;
    },
    [filters],
  );

  const filteredAllNotifications = useMemo(() => {
    const safeAll = Array.isArray(allNotifications) ? allNotifications : [];
    return applyFiltersForPagination(safeAll);
  }, [allNotifications, filters]);

  const derivedTotalPages = useMemo(() => {
    const safeTotal = filteredAllNotifications.length;
    return Math.max(1, Math.ceil(safeTotal / Math.max(1, limit)));
  }, [filteredAllNotifications, limit]);

  // Keep `page` in range when filtering changes.
  useEffect(() => {
    setPage((p) => clamp(p, 1, derivedTotalPages));
  }, [derivedTotalPages]);

  const load = useCallback(
    async ({ nextPage = page, force = false } = {}) => {
      if (!enabled) return;

      setLoading(true);
      setError(null);

      // If we already have a cached client-side dataset, avoid re-fetching.
      const cached = cacheRef.current.get(queryKey);
      if (cached?.source === 'client' && !force) {
        setSource('client');
        setAllNotifications(cached.all);
        const filtered = applyFiltersForPagination(cached.all);
        const { pageItems, total, safePage } = recomputeClientPagination(
          filtered,
          nextPage,
        );
        setTotal(total);
        setPage(safePage);
        setNotifications(pageItems);
        // Unread count can be computed from the filtered dataset,
        // but we also have an unread-count endpoint for accuracy.
        setUnreadCount(
          Array.isArray(cached.all) ? cached.all.filter((n) => !n?.read).length : 0,
        );
        return;
      }

      try {
        const res = await fetchNotifications({
          page: nextPage,
          limit,
          filters,
        });

        setSource(res?.source || null);

        if (res?.source === 'client') {
          // res.notifications is the full array (backend ignores pagination).
          setAllNotifications(res.notifications);
          const filtered = applyFiltersForPagination(res.notifications);
          const { pageItems, total } = recomputeClientPagination(filtered, nextPage);
          setTotal(total);
          setNotifications(pageItems);
          cacheRef.current.set(queryKey, { source: 'client', all: res.notifications });
          setUnreadCount(res.notifications.filter((n) => !n?.read).length);
        } else {
          // Server-side pagination shape (best-effort normalization).
          setAllNotifications([]); // don't keep potentially large lists
          setTotal(res?.total ?? res?.notifications?.length ?? 0);
          setNotifications(Array.isArray(res?.notifications) ? res.notifications : []);
          setUnreadCount(await fetchUnreadCount());
          cacheRef.current.set(queryKey, {
            source: 'server',
            // store only page items for this page (can be expanded later)
            pageCache: new Map([[nextPage, res?.notifications || []]]),
          });
        }
      } catch (e) {
        console.error('Failed to load notifications:', e);
        setError(e);
        setNotifications([]);
        setAllNotifications([]);
        setTotal(0);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    },
    [enabled, filters, limit, page, queryKey, recomputeClientPagination],
  );

  // Initial load + re-load on query changes.
  useEffect(() => {
    load({ nextPage: initialPage, force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, initialPage]);

  // Server-side mode: refetch when page changes.
  useEffect(() => {
    if (!enabled) return;
    if (source === 'server') {
      load({ nextPage: page, force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, source]);

  // Client-pagination fallback: re-slice cached notifications when `page` changes.
  useEffect(() => {
    if (!enabled) return;
    if (source !== 'client') return;

    const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
      filteredAllNotifications,
      page,
    );

    if (safePage !== page) setPage(safePage);
    setTotal(safeTotal);
    setNotifications(pageItems);
  }, [enabled, filteredAllNotifications, page, recomputeClientPagination, source]);

  // Optional polling for near real-time updates.
  useEffect(() => {
    if (!enabled) return;
    if (!pollIntervalMs) return;

    const interval = setInterval(() => {
      // In client-pagination fallback mode, this will re-fetch the full list.
      // That still avoids any re-fetch during page navigation.
      load({ nextPage: pageRef.current, force: true });
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, load, pollIntervalMs]);

  const pageTotalPages = source === 'server' ? Math.max(1, Math.ceil(total / Math.max(1, limit))) : derivedTotalPages;

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;

      // Optimistic update (works well for client-pagination and unread filtering).
      setNotifications((prev) =>
        prev.map((n) => (n?._id === id || n?.id === id ? { ...n, read: true } : n)),
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n?._id === id || n?.id === id ? { ...n, read: true } : n)),
      );

      try {
        await markNotificationAsRead(id);

        // Recompute client view with the optimistic cache update.
        if (source === 'client') {
          const updatedAll = allNotifications.map((n) =>
            n?._id === id || n?.id === id ? { ...n, read: true } : n,
          );
          const filtered = applyFiltersForPagination(updatedAll);
          const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
            filtered,
            page,
          );
          setTotal(safeTotal);
          setPage(safePage);
          setNotifications(pageItems);
          setUnreadCount(updatedAll.filter((n) => !n?.read).length);
        } else {
          // In server mode, re-fetch current page to keep ordering consistent.
          await load({ nextPage: page, force: true });
        }
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
        setError(e);
        // fall back to re-fetch to restore consistency
        await load({ nextPage: page, force: true });
      }
    },
    [allNotifications, load, page, recomputeClientPagination, source],
  );

  const markAllAsRead = useCallback(
    async () => {
      try {
        // Optimistic update
        if (Array.isArray(allNotifications)) {
          const updated = allNotifications.map((n) => ({ ...n, read: true }));
          setAllNotifications(updated);
          const filtered = applyFiltersForPagination(updated);
          const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
            filtered,
            1,
          );
          setTotal(safeTotal);
          setPage(safePage);
          setNotifications(pageItems);
        } else {
          setNotifications([]);
        }
        await markAllNotificationsAsRead();

        if (source === 'server') {
          await load({ nextPage: page, force: true });
        } else {
          setUnreadCount(0);
        }
      } catch (e) {
        console.error('Failed to mark all notifications as read:', e);
        setError(e);
        await load({ nextPage: page, force: true });
      }
    },
    [allNotifications, load, page, recomputeClientPagination, source],
  );

  const refetch = useCallback(() => load({ nextPage: page, force: true }), [load, page]);

  return {
    notifications,
    loading,
    error,
    page,
    limit,
    total,
    totalPages: pageTotalPages,
    unreadCount,
    source, // 'client' | 'server' | null
    setPage: (p) => setPage((prev) => clamp(p, 1, pageTotalPages)),
    refetch,
    markAsRead,
    markAllAsRead,
  };
}

