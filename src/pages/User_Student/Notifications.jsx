import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, AlertCircle, Clock, Info, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation("student");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

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

        if (diffMins < 60) return t("notifications.minutesAgo", { count: diffMins });
        if (diffHours < 24) return t("notifications.hoursAgo", { count: diffHours });
        if (diffDays < 7) return t("notifications.daysAgo", { count: diffDays });
        return date.toLocaleDateString();
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
            toast.success(t("notifications.allMarkedRead"));
        } catch (err) {
            toast.error(t("notifications.failedToUpdate"));
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
                <div className="flex items-center justify-between mb-2">
                    <BackButton to="/student/dashboard" />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title={t("notifications.title")}
                        subtitle={t("notifications.subtitle", { count: unreadCount })}
                        showBack={false}
                    />
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            {t("notifications.markAllRead")}
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
                                {t("notifications.noNotifications")}
                            </h3>
                            <p className="text-black">
                                {t("notifications.allCaughtUp")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const Icon = getIcon(notification.type);
                            return (
                                <div
                                    key={notification._id}
                                    className={`p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer
                                        ${notification.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}
                                    onClick={() => markAsRead(notification._id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-full shrink-0 
                                            ${notification.type === 'success' ? 'bg-emerald-100/50 text-emerald-600' :
                                                notification.type === 'warning' ? 'bg-amber-100/50 text-amber-600' :
                                                    notification.type === 'error' ? 'bg-rose-100/50 text-rose-600' :
                                                        'bg-sky-100/50 text-sky-600'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={`text-base font-semibold ${notification.read ? 'text-slate-700' : 'text-[#0b1d3a]'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {/* Optional Delete Button */}
                                        {/* <button 
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        </StudentLayout>
    );
}