import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Info, Trash2, CheckCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { notifications as mockNotifications } from "./data/mockData";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(mockNotifications);

    const getIcon = (type) => {
        switch (type) {
            case 'approved':
                return CheckCircle;
            case 'rejected':
                return XCircle;
            case 'overdue':
            case 'reminder':
                return AlertCircle;
            case 'system':
                return Info;
            default:
                return Bell;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'approved':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'rejected':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            case 'overdue':
            case 'reminder':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            case 'system':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <MainLayout>
            <PageContainer>
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title="Notifications"
                        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
                    />
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <Card className="border-gray-300">
                        <CardContent className="py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No notifications
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You're all caught up! Check back later for updates.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const Icon = getIcon(notification.type);
                            const iconColor = getIconColor(notification.type);
                            const IconComponent = Icon;

                            return (
                                <Card
                                    key={notification.id}
                                    className={`border-gray-300 transition-all ${!notification.read
                                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${iconColor} flex-shrink-0`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTime(notification.timestamp)}</span>
                                                            {!notification.read && (
                                                                <Badge variant="default" className="text-xs">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {notification.actionUrl && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (!notification.read) markAsRead(notification.id);
                                                                navigate(notification.actionUrl);
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                        {!notification.read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => markAsRead(notification.id)}
                                                            >
                                                                Mark as Read
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="flex-shrink-0"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        </MainLayout>
    );
}

