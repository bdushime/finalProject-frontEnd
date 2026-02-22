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
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            // Optional: toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Optional: Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
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
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-slate-900 text-xl tracking-tight">{t('notifications.recent')}</h3>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#8D8DC7] hover:text-[#7b7bb5] transition-all bg-[#8D8DC7]/10 px-4 py-2 rounded-xl active:scale-95"
                        >
                            <Check className="w-4 h-4" /> {t('notifications.markAll')}
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-12 text-center flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#8D8DC7]" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('notifications.empty')}</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`p-8 flex items-start gap-6 transition-all cursor-pointer group border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-[#8D8DC7]/5 hover:bg-[#8D8DC7]/10' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`mt-1 p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${!notif.read ? 'bg-white shadow-sm border border-[#8D8DC7]/20 border-gray-100' : 'bg-gray-100'}`}>
                                    {getIcon(notif.type || 'info')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-base font-bold tracking-tight ${!notif.read ? 'text-slate-900' : 'text-slate-500'}`}>{notif.title}</h4>
                                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 gap-1.5 whitespace-nowrap ml-4">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatTimeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${!notif.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{notif.message}</p>
                                </div>
                                {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-[#8D8DC7] self-center ml-4 ring-4 ring-[#8D8DC7]/10 shadow-[0_0_15px_rgba(141,141,199,0.4)]" />}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;