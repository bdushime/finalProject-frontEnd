import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from "@/utils/api";

export default function NotificationsWidget() {
    const { t } = useTranslation("student");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                // Only show latest 3 for the widget
                setNotifications(res.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            case 'INFO': return <Info className="w-4 h-4 text-blue-400" />;
            default: return <Bell className="w-4 h-4 text-[#126dd5]/50" />;
        }
    };

    return (
        <div className="bg-[#f0f9ff] rounded-[32px] p-6 h-full flex flex-col justify-between relative group hover:shadow-md transition-all shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-[#0b1d3a]">{t("notifications.title")}</h3>
                <div className="relative">
                    <Bell className="w-6 h-6 text-[#126dd5]/50" />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#f0f9ff]" />
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Clock className="w-5 h-5 text-slate-300 animate-spin" />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div key={n._id} className={`flex gap-3 items-start p-2 rounded-2xl transition-colors ${!n.read ? 'bg-white/60' : ''}`}>
                            <div className={`mt-0.5 p-1.5 rounded-lg ${!n.read ? 'bg-white' : 'bg-slate-100/50'}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${!n.read ? 'text-[#0b1d3a]' : 'text-slate-500'}`}>
                                    {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-300 gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        <p className="text-xs font-medium">{t("dashboard.noNewNotifications")}</p>
                    </div>
                )}
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-white/40 rounded-full blur-2xl -z-10"></div>
        </div>
    );
}
