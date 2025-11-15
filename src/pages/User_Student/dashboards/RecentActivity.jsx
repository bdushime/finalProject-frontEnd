import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import PropTypes from "prop-types";

export default function RecentActivity({ notifications = [] }) {
    const recentNotifications = notifications.slice(0, 5);

    const getIcon = (type) => {
        switch (type) {
            case 'approved':
                return CheckCircle;
            case 'rejected':
                return XCircle;
            case 'overdue':
            case 'reminder':
                return AlertCircle;
            default:
                return Clock;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'approved':
                return 'text-green-600 dark:text-green-400';
            case 'rejected':
                return 'text-red-600 dark:text-red-400';
            case 'overdue':
            case 'reminder':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Card className="border-gray-300">
            <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentNotifications.map((notification) => {
                            const Icon = getIcon(notification.type);
                            const iconColor = getIconColor(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <Icon className={`h-5 w-5 mt-0.5 ${iconColor} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

RecentActivity.propTypes = {
    notifications: PropTypes.array,
};

