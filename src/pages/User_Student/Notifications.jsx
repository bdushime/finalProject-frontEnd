import { useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Info, Trash2, CheckCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
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
        <StudentLayout>
            <PageContainer>
                <BackButton to="/student/dashboard" />
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title="Notifications"
                        subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
                    />
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)]">
                        <CardContent className="py-12 text-center">
                            <div className="p-4 rounded-full bg-sky-50 w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-sky-100">
                                <Bell className="h-10 w-10 text-sky-700" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">
                                No notifications
                            </h3>
                            <p className="text-black">
                                You're all caught up! Check back later for updates.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const Icon = getIcon(notification.type);
                            const IconComponent = Icon;

                            return (
                                <Card
                                    key={notification.id}
                                    className={`border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.3)] transition-all duration-300 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] ${!notification.read ? 'ring-1 ring-sky-200' : ''}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-sky-100 border border-sky-200 flex-shrink-0 shadow-inner shadow-sky-900/10">
                                                <IconComponent className="h-6 w-6 text-[#0b1d3a]" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-[#0b1d3a] mb-1">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-slate-700 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-600">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTime(notification.timestamp)}</span>
                                                            {!notification.read && (
                                                                <Badge variant="outline" className="text-xs rounded-full border-sky-300 text-sky-700 bg-sky-50 px-2 py-0.5">
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
                                                            className="rounded-lg border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
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
                                                                className="text-sky-700 hover:bg-sky-50"
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
                                                className="flex-shrink-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        </StudentLayout>
    );
}


