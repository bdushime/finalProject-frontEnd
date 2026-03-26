import PropTypes from 'prop-types';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';

function getTypeIcon(type) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    case 'error':
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
}

function getIconBg(type) {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700';
    case 'warning':
      return 'bg-amber-50 text-amber-700';
    case 'error':
      return 'bg-rose-50 text-rose-700';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-700';
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onViewDetails,
  formatTimestamp,
  markReadOnClick = true,
}) {
  const { _id, id, title, message, type, createdAt, read, relatedId } = notification || {};
  const notifId = _id || id;

  const isUnread = !read;
  const isClickable =
    !!markReadOnClick && isUnread && typeof onMarkAsRead === 'function' && !!notifId;
  const handleMainClick = () => {
    if (!isClickable) return;
    onMarkAsRead(notifId);
  };

  const handleMainKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMainClick();
    }
  };

  return (
    <li role="listitem" className="w-full">
      <div
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : -1}
        onClick={isClickable ? handleMainClick : undefined}
        onKeyDown={isClickable ? handleMainKeyDown : undefined}
        aria-label={title ? `Notification: ${title}` : 'Notification'}
        className={`w-full rounded-2xl border p-4 transition-all text-left ${
          isClickable ? 'cursor-pointer hover:shadow-sm active:scale-[0.99]' : ''
        } ${isUnread ? 'bg-rose-50 border-slate-200' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 rounded-xl p-2.5 transition-colors ${getIconBg(type)}`}
          >
            {getTypeIcon(type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4
                  className="font-semibold truncate text-slate-900"
                >
                  {title || 'Notification'}
                </h4>
                <p
                  className="mt-1 text-sm leading-relaxed text-slate-700"
                >
                  {message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {type && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    {type}
                  </span>
                )}
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatTimestamp
                    ? formatTimestamp(createdAt)
                    : createdAt
                      ? new Date(createdAt).toLocaleString()
                      : ''}
                </span>
              </div>
            </div>

            {typeof onViewDetails === 'function' && relatedId && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(notification);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  <Bell className="h-3.5 w-3.5 text-[#126dd5]" />
                  View details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    read: PropTypes.bool,
    relatedId: PropTypes.string,
  }).isRequired,
  onMarkAsRead: PropTypes.func,
  onViewDetails: PropTypes.func,
  formatTimestamp: PropTypes.func,
  markReadOnClick: PropTypes.bool,
};

