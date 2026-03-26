import PropTypes from 'prop-types';
import { NotificationItem } from './NotificationItem';

export function NotificationList({
  notifications,
  onMarkAsRead,
  onViewDetails,
  formatTimestamp,
  markReadOnClick = true,
  emptyState,
}) {
  if (!notifications || notifications.length === 0) {
    return emptyState || null;
  }

  return (
    <ul role="list" className="space-y-4">
      {notifications.map((n) => (
        <NotificationItem
          key={n?._id || n?.id}
          notification={n}
          onMarkAsRead={onMarkAsRead}
          onViewDetails={onViewDetails}
          formatTimestamp={formatTimestamp}
          markReadOnClick={markReadOnClick}
        />
      ))}
    </ul>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object),
  onMarkAsRead: PropTypes.func,
  onViewDetails: PropTypes.func,
  formatTimestamp: PropTypes.func,
  markReadOnClick: PropTypes.bool,
  emptyState: PropTypes.node,
};

