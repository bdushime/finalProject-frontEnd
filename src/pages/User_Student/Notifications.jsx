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
const [notifications, setNotifications] = useState([]);

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
{/* Notifications map would go here if we had data, currently empty by default */}
                    </div>
                )}
            </PageContainer>
        </StudentLayout>
    );
}


