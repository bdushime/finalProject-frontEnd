import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  fetchUnreadCount,
} from '@/services/notificationsService';

function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj, Object.keys(obj || {}).sort());
  } catch {
    return String(obj);
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function useNotifications({
  initialPage = 1,
  limit = 10,
  filters = {},
  pollIntervalMs = 0,
  enabled = true,
  sortFn = null,
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState(null); // 'client' | 'server' | null
  const [unreadCount, setUnreadCount] = useState(0);

  const cacheRef = useRef(new Map());
  // pageRef lets polling and callbacks always read the latest page
  // without needing `page` as a dep (which would cause rebuild loops).
  const pageRef = useRef(page);
  // Tracks in-flight fetch so we can cancel stale responses.
  const abortRef = useRef(null);

  const sortFnRef = useRef(sortFn);

  // Keep latest sort function without using its identity in memo deps.
  // Updating a ref does not trigger re-renders.
  useEffect(() => {
    sortFnRef.current = sortFn;
  }, [sortFn]);

  const unreadOnly = !!filters?.unread;

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // IMPORTANT: `sortFn` is often passed inline, so keying on its identity would
  // change `queryKey` every render → infinite reload loop.
  // We only care whether sorting is enabled at all.
  const sortMode = typeof sortFn === 'function' ? 'custom' : 'none';

  const queryKey = useMemo(
    () => safeJsonStringify({ filters: filters || {}, limit, sort: sortMode }),
    [filters, limit, sortMode],
  );

  // FIX: Evict the old cache entry when the query changes so stale data isn't
  // served after a filter/limit update.
  const prevQueryKeyRef = useRef(queryKey);
  useEffect(() => {
    if (prevQueryKeyRef.current !== queryKey) {
      cacheRef.current.delete(prevQueryKeyRef.current);
      prevQueryKeyRef.current = queryKey;
    }
  }, [queryKey]);

  // ─── Pure helpers ──────────────────────────────────────────────────────────

  const recomputeClientPagination = useCallback(
    (all, currentPage) => {
      const safeAll = Array.isArray(all) ? all : [];
      const safeLimit = Math.max(1, limit);
      const safeTotal = safeAll.length;
      const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
      const safePage = clamp(currentPage, 1, totalPages);
      const startIndex = (safePage - 1) * safeLimit;
      const pageItems = safeAll.slice(startIndex, startIndex + safeLimit);
      return { pageItems, total: safeTotal, totalPages, safePage };
    },
    [limit],
  );

  const applyFiltersForPagination = useCallback(
    (list) => {
      const safeList = Array.isArray(list) ? list : [];
      return unreadOnly ? safeList.filter((n) => !n?.read) : safeList;
    },
    [unreadOnly],
  );

  const applySortForPagination = useCallback(
    (list) => {
      const safeList = Array.isArray(list) ? list : [];
      const fn = sortFnRef.current;
      return typeof fn === 'function' ? [...safeList].sort(fn) : safeList;
    },
    [],
  );

  const applyFiltersAndSort = useCallback(
    (list) => applySortForPagination(applyFiltersForPagination(list)),
    [applyFiltersForPagination, applySortForPagination],
  );

  // FIX: was missing `applyFiltersAndSort` from the dep array; `filters` was
  // listed but the real dep is the composed callback.
  const filteredAllNotifications = useMemo(
    () => applyFiltersAndSort(allNotifications),
    [allNotifications, applyFiltersAndSort],
  );

  const derivedTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAllNotifications.length / Math.max(1, limit))),
    [filteredAllNotifications, limit],
  );

  // Keep `page` in range when filters change the total page count.
  useEffect(() => {
    setPage((p) => clamp(p, 1, derivedTotalPages));
  }, [derivedTotalPages]);

  // ─── Core fetch ────────────────────────────────────────────────────────────

  // FIX: `page` removed from deps. Adding it caused `load` to be rebuilt on
  // every page turn, which restarted the polling interval and could trigger
  // double-fetches. Callers must always pass `nextPage` explicitly; internal
  // access to the latest page goes through `pageRef`.
  const load = useCallback(
    async ({ nextPage = pageRef.current, force = false } = {}) => {
      if (!enabled) return;

      // FIX: Cancel any in-flight request before starting a new one.
      // This prevents a slow earlier response from overwriting a newer one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const cached = cacheRef.current.get(queryKey);
      if (cached?.source === 'client' && !force) {
        const filtered = applyFiltersAndSort(cached.all);
        const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
          filtered,
          nextPage,
        );
        setSource('client');
        setAllNotifications(cached.all);
        setTotal(safeTotal);
        setPage(safePage);
        setNotifications(pageItems);
        setUnreadCount(cached.all.filter((n) => !n?.read).length);
        // FIX: was missing — `finally` is never reached on this early-return path.
        setLoading(false);
        return;
      }

      try {
        const res = await fetchNotifications({ page: nextPage, limit, filters });

        // FIX: Discard the response if a newer request has already taken over.
        if (controller.signal.aborted) return;

        setSource(res?.source || null);

        if (res?.source === 'client') {
          const all = Array.isArray(res.notifications) ? res.notifications : [];
          const filtered = applyFiltersAndSort(all);
          const { pageItems, total: safeTotal } = recomputeClientPagination(filtered, nextPage);

          setAllNotifications(all);
          setTotal(safeTotal);
          setNotifications(pageItems);
          setUnreadCount(all.filter((n) => !n?.read).length);
          cacheRef.current.set(queryKey, { source: 'client', all });
        } else {
          // Server-side pagination — don't hold the full list in memory.
          const serverItems = Array.isArray(res?.notifications) ? res.notifications : [];

          setAllNotifications([]);
          setTotal(res?.total ?? serverItems.length);
          setNotifications(applyFiltersAndSort(serverItems));
          cacheRef.current.set(queryKey, {
            source: 'server',
            pageCache: new Map([[nextPage, serverItems]]),
          });

          // FIX: Guard the secondary request as well — component may have
          // unmounted or a newer fetch may have started.
          const count = await fetchUnreadCount();
          if (!controller.signal.aborted) setUnreadCount(count);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error('Failed to load notifications:', e);
        setError(e);
        setNotifications([]);
        setAllNotifications([]);
        setTotal(0);
        setUnreadCount(0);
      } finally {
        // FIX: Only clear loading if this request wasn't superseded.
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    // NOTE: `page` intentionally excluded — see comment above.
    [enabled, filters, limit, queryKey, applyFiltersAndSort, recomputeClientPagination],
  );

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Initial load + re-load when query parameters change.
  // FIX: `load` excluded from deps. Including it would create a loop because
  // `load` depends on `queryKey`, so every queryKey change would fire this
  // effect twice. `queryKey` alone is the right trigger.
  useEffect(() => {
    load({ nextPage: initialPage, force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, initialPage]);

  // Server-side mode: re-fetch from the API when the user changes pages.
  // FIX: `load` excluded — its identity changes when `queryKey` changes, which
  // is already handled above. Including it here would cause a double-fetch on
  // every query change.
  useEffect(() => {
    if (!enabled || source !== 'server') return;
    load({ nextPage: page, force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, source, enabled]);

  // Client-side mode: re-slice the local array when the user changes pages.
  // No network request needed.
  useEffect(() => {
    if (!enabled || source !== 'client') return;
    const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
      filteredAllNotifications,
      page,
    );
    if (safePage !== page) setPage(safePage);
    setTotal(safeTotal);
    setNotifications(pageItems);
  }, [enabled, filteredAllNotifications, page, recomputeClientPagination, source]);

  // Polling for near-real-time updates.
  // FIX: `load` excluded — including it would restart the interval every time
  // `load` is rebuilt (e.g. on a queryKey change). `pageRef.current` is used
  // inside the callback so we always poll the current page without it being
  // a dep.
  useEffect(() => {
    if (!enabled || !pollIntervalMs) return;
    const interval = setInterval(() => {
      load({ nextPage: pageRef.current, force: true });
    }, pollIntervalMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pollIntervalMs]);

  // Abort any in-flight request on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;

      // FIX: Derive `updatedAll` BEFORE calling any setState. The original code
      // called setAllNotifications first, then read `allNotifications` from the
      // closure — which is still the pre-update snapshot, making the downstream
      // recomputation operate on stale data.
      const updatedAll = allNotifications.map((n) =>
        n?._id === id || n?.id === id ? { ...n, read: true } : n,
      );

      setAllNotifications(updatedAll);
      setNotifications((prev) =>
        prev.map((n) => (n?._id === id || n?.id === id ? { ...n, read: true } : n)),
      );

      try {
        await markNotificationAsRead(id);

        if (source === 'client') {
          const filtered = applyFiltersAndSort(updatedAll);
          const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
            filtered,
            pageRef.current,
          );
          setTotal(safeTotal);
          setPage(safePage);
          setNotifications(pageItems);
          setUnreadCount(updatedAll.filter((n) => !n?.read).length);
        } else {
          await load({ nextPage: pageRef.current, force: true });
        }
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
        setError(e);
        await load({ nextPage: pageRef.current, force: true });
      }
    },
    [allNotifications, applyFiltersAndSort, load, recomputeClientPagination, source],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      if (source === 'client' && Array.isArray(allNotifications)) {
        // Optimistic update: mark everything read, then re-slice.
        const updatedAll = allNotifications.map((n) => ({ ...n, read: true }));
        setAllNotifications(updatedAll);

        const filtered = applyFiltersAndSort(updatedAll);
        const { pageItems, total: safeTotal, safePage } = recomputeClientPagination(
          filtered,
          1,
        );
        setTotal(safeTotal);
        setPage(safePage);
        setNotifications(pageItems);
      } else {
        // Server mode: optimistically update the visible slice only.
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }

      await markAllNotificationsAsRead();

      if (source === 'server') {
        await load({ nextPage: pageRef.current, force: true });
      } else {
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
      setError(e);
      await load({ nextPage: pageRef.current, force: true });
    }
  }, [allNotifications, applyFiltersAndSort, load, recomputeClientPagination, source]);

  // ─── Derived values ────────────────────────────────────────────────────────

  const pageTotalPages =
    source === 'server'
      ? Math.max(1, Math.ceil(total / Math.max(1, limit)))
      : derivedTotalPages;

  const refetch = useCallback(
    () => load({ nextPage: pageRef.current, force: true }),
    [load],
  );

  const setPageSafe = useCallback(
    (p) => setPage(clamp(p, 1, pageTotalPages)),
    [pageTotalPages],
  );

  return {
    notifications,
    loading,
    error,
    page,
    limit,
    total,
    totalPages: pageTotalPages,
    unreadCount,
    source,
    setPage: setPageSafe,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}