import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout'; // Ensure this path matches your folder structure
import api from '@/utils/api';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const AdminNotifications = () => {
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
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to update notifications");
        }
    };

    // Helper: Format Time "Ago"
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-gray-400">Stay updated with system alerts and activities.</p>
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Recent Alerts</h3>
                    {notifications.some(n => !n.read) && (
                        <button 
                            onClick={markAllAsRead} 
                            className="flex items-center gap-2 text-sm font-bold text-[#8D8DC7] hover:text-[#7b7bb5] transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                        >
                            <Check className="w-4 h-4" /> Mark all as read
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
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                onClick={() => !notif.read && markAsRead(notif._id)}
                                className={`p-6 flex items-start gap-4 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50'}`}
                            >
                                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-white shadow-sm border border-slate-100' : 'bg-slate-100'}`}>
                                    {getIcon(notif.type || 'info')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1 h-full">
                                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                                        <div className="flex items-center text-xs text-slate-400 gap-1 whitespace-nowrap ml-4">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTimeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                                </div>
                                {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 self-center ml-2" />}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;