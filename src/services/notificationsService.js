import api from '@/utils/api';

/**
 * Fetch notifications with optional pagination and filters.
 *
 * Note: your current backend returns an array from GET `/notifications` and
 * ignores pagination query params. The hook consuming this service will
 * gracefully fall back to client-side pagination when needed.
 *
 * @param {Object} options
 * @param {number} options.page - 1-indexed page
 * @param {number} options.limit - items per page
 * @param {Object} options.filters
 * @param {boolean} options.filters.unread - only unread notifications
 * @returns {Promise<{ raw: any, notifications: Array, page: number, limit: number, total: number, source: 'server' | 'client' }>}
 */
export async function fetchNotifications({ page = 1, limit = 10, filters = {} } = {}) {
  const params = {
    page,
    limit,
    unread: typeof filters.unread === 'boolean' ? filters.unread : undefined,
    // allow passing through arbitrary filters without breaking the signature
    ...(filters || {}),
  };

  const res = await api.get('/notifications', { params });
  const data = res?.data;

  // Backend today returns `Notification[]`.
  if (Array.isArray(data)) {
    return {
      raw: data,
      notifications: data,
      page,
      limit,
      total: data.length,
      source: 'client',
    };
  }

  // If backend later adds pagination, it might return an object.
  // We normalize to a consistent shape.
  const notifications =
    data?.items ||
    data?.notifications ||
    data?.data ||
    [];

  const total =
    data?.total ??
    data?.totalCount ??
    data?.count ??
    notifications.length;

  const detectedPage = data?.page ?? page;
  const detectedLimit = data?.limit ?? data?.pageSize ?? limit;

  return {
    raw: data,
    notifications,
    page: detectedPage,
    limit: detectedLimit,
    total,
    source: 'server',
  };
}

export async function fetchUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res?.data?.count ?? 0;
}

export async function markNotificationAsRead(id) {
  return api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead() {
  return api.put('/notifications/mark-all-read');
}

