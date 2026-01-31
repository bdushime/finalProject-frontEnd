import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Info, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api"; // Ensure this imports your axios instance
import { toast } from "sonner";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. FETCH REAL NOTIFICATIONS ---
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications'); // Backend endpoint
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to load notifications", err);
                toast.error("Could not load notifications");
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    // --- 2. ICON LOGIC ---
    const getIcon = (type) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'error': return XCircle;
            case 'warning': return AlertCircle;
            case 'info': return Info;
            default: return Bell;
        }
    };

    // --- 3. TIME FORMATTER ---
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

    // --- 4. ACTIONS ---
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === id ? { ...notif, read: true } : notif
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            toast.success("All marked as read");
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    // Note: If you want 'delete', you need a backend endpoint for it. 
    // For now, we can just hide it locally or remove the button.
    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif._id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </StudentLayout>
        );
    }

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
                            
                            return (
                                <Card
                                    key={notification._id}
                                    className={`border border-slate-200 rounded-2xl bg-white/95 shadow-sm transition-all duration-300 hover:border-sky-200 hover:shadow-md ${!notification.read ? 'ring-1 ring-sky-200 bg-sky-50/30' : ''}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl flex-shrink-0 shadow-inner 
                                                ${notification.type === 'error' ? 'bg-red-50 border-red-100' : 
                                                  notification.type === 'success' ? 'bg-green-50 border-green-100' : 
                                                  'bg-sky-100 border-sky-200'}`}>
                                                <Icon className={`h-6 w-6 
                                                    ${notification.type === 'error' ? 'text-red-600' : 
                                                      notification.type === 'success' ? 'text-green-600' : 
                                                      'text-[#0b1d3a]'}`} />
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
                                                            <span>{formatTime(notification.createdAt)}</span>
                                                            {!notification.read && (
                                                                <Badge variant="outline" className="text-xs rounded-full border-sky-300 text-sky-700 bg-sky-50 px-2 py-0.5">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Action Button (e.g., View Request) */}
                                                {!notification.read && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-sky-700 hover:bg-sky-50 -ml-2"
                                                            onClick={() => markAsRead(notification._id)}
                                                        >
                                                            Mark as Read
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="flex-shrink-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                onClick={() => deleteNotification(notification._id)}
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