import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout'; // Ensure this path matches your folder structure
import api from '@/utils/api';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from "react-i18next";

const AdminNotifications = () => {
    const { t } = useTranslation(["admin", "common"]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. FETCH NOTIFICATIONS
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            // Optional: toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Optional: Poll for new notifications every 10 seconds (synced)
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    // 2. MARK AS READ (Single)
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            // Optimistic Update (Update UI immediately without waiting for re-fetch)
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    // 3. MARK ALL AS READ
    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success(t('notifications.success'));
        } catch (err) {
            toast.error(t('notifications.error'));
        }
    };

    // Helper: Format Time "Ago"
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return t('notifications.time.years', { count: Math.floor(interval) });
        interval = seconds / 2592000;
        if (interval > 1) return t('notifications.time.months', { count: Math.floor(interval) });
        interval = seconds / 86400;
        if (interval > 1) return t('notifications.time.days', { count: Math.floor(interval) });
        interval = seconds / 3600;
        if (interval > 1) return t('notifications.time.hours', { count: Math.floor(interval) });
        interval = seconds / 60;
        if (interval > 1) return t('notifications.time.minutes', { count: Math.floor(interval) });
        return t('notifications.time.seconds', { count: Math.floor(seconds) });
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('notifications.title')}</h1>
                <p className="text-gray-400">{t('notifications.subtitle')}</p>
            </div>
        </div>
    );

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'info':
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#8D8DC7]/10 p-2 rounded-xl">
                            <Bell className="w-5 h-5 text-[#8D8DC7]" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight">
                            {t('notifications.recent')}
                            {unreadCount > 0 && <span className="ml-2 text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}
                        </h3>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#8D8DC7] hover:bg-[#8D8DC7] hover:text-white transition-all bg-[#8D8DC7]/10 px-6 py-3 rounded-xl active:scale-95"
                        >
                            <Check className="w-4 h-4" /> {t('notifications.markAll')}
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center flex justify-center border border-gray-100">
                            <Loader2 className="w-8 h-8 animate-spin text-[#8D8DC7]" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center text-slate-400 border border-gray-100 shadow-sm">
                            <Bell className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="font-medium">{t('notifications.empty')}</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`p-6 rounded-[2rem] flex items-start gap-6 transition-all cursor-pointer border shadow-sm group hover:shadow-md active:scale-[0.99]
                                    ${!notif.read ? 'bg-white border-[#8D8DC7]/30 ring-1 ring-[#8D8DC7]/5' : 'bg-white/80 border-gray-100 grayscale-[0.5] opacity-80'}`}
                            >
                                <div className={`p-3.5 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 
                                    ${!notif.read ? 'bg-[#8D8DC7]/10 shadow-inner' : 'bg-gray-50'}`}>
                                    {getIcon(notif.type || 'info')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base font-bold tracking-tight truncate ${!notif.read ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {notif.title}
                                        </h4>
                                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 gap-1.5 whitespace-nowrap ml-4">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatTimeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!notif.read ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 self-center ml-4 shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;