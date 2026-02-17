import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, Clock, AlertTriangle, CheckCircle,
    ExternalLink, CheckCheck, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Removed PageHeader import
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ITStaffNotifications() {
    const { t } = useTranslation(["itstaff", "common"]);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    // --- 1. FETCH DATA ---
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to load notifications", err);
            toast.error(t('notifications.messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // --- 2. HELPERS ---

    // Map backend 'type' to UI severity styles
    const getSeverity = (type) => {
        if (type === 'error') return 'critical';
        if (type === 'warning') return 'high';
        return 'normal';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical": return "bg-red-50 text-red-700 border-red-200";
            case "high": return "bg-orange-50 text-orange-700 border-orange-200";
            default: return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    // 👇 ADDED MISSING FUNCTION HERE
    const getIconBgColor = (type) => {
        if (type === 'error') return 'bg-red-100';
        if (type === 'warning') return 'bg-orange-100';
        if (type === 'success') return 'bg-green-100';
        return 'bg-blue-100';
    };

    const getIcon = (type) => {
        if (type === 'error') return <AlertTriangle className="h-5 w-5 text-red-600" />;
        if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-orange-600" />;
        if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-600" />;
        return <Bell className="h-5 w-5 text-blue-600" />;
    };

    // --- 3. ACTIONS ---
    const handleMarkRead = async (e, id, relatedId = null) => {
        if (e) e.stopPropagation();
        try {
            // Optimistic Update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));

            await api.put(`/notifications/${id}/read`);

            if (relatedId) {
                navigate('/it/current-checkouts');
            }
        } catch (err) {
            console.error(err);
            toast.error(t('notifications.messages.updateError'));
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            // Optimistic Update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));

            await api.put('/notifications/mark-all-read');
            toast.success(t('notifications.messages.markAllSuccess'));
        } catch (err) {
            console.error(err);
            toast.error(t('notifications.messages.markAllError'));
            fetchNotifications();
        } finally {
            setMarkingAll(false);
        }
    };

    // Count unread
    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <ITStaffLayout>
                <div className="h-[80vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </ITStaffLayout>
        );
    }

    return (
        <ITStaffLayout>
            <div>
                {/* FIXED HEADER: Replaced PageHeader with standard HTML */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            {t('notifications.title')}
                            {unreadCount > 0 && (
                                <Badge className="bg-red-600 hover:bg-red-700 text-sm">
                                    {t('notifications.unread', { count: unreadCount })}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t('notifications.desc')}</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleMarkAllRead}
                            disabled={markingAll}
                            className="gap-2"
                        >
                            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                            {t('notifications.markAll')}
                        </Button>
                    )}
                </div>

                <div className="mt-4 rounded-2xl shadow-sm bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="font-medium">{t('notifications.noNotifications')}</p>
                            <p className="text-sm mt-1">{t('notifications.noNotificationsDesc')}</p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const severity = getSeverity(n.type);
                            const isCritical = severity === 'critical';

                            return (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-5 flex items-start gap-4 transition-colors hover:bg-gray-50 ${!n.read ? "bg-blue-50/30" : ""}`}
                                >
                                    {/* Icon Box - NOW WORKS because getIconBgColor exists */}
                                    <div className={`mt-1 rounded-xl p-2.5 flex-shrink-0 ${getIconBgColor(n.type)}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                    {n.message}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {n.createdAt ? format(new Date(n.createdAt), "MMM d, h:mm a") : t('notifications.justNow')}
                                                    </span>

                                                    {isCritical && (
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getSeverityColor(severity)}`}>
                                                            {t('notifications.critical')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {n.relatedId && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shrink-0 mt-2 sm:mt-0 text-xs h-8 border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                                    onClick={() => handleMarkRead(n._id, n.relatedId)}
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1.5" />
                                                    {t('notifications.viewDetails')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </ITStaffLayout>
    );
}