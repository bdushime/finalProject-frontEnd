import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Bell, Check, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'alert', title: 'Low Stock Alert', message: 'Projector (P-102) stock has fallen below 10%.', time: '2 mins ago', read: false },
        { id: 2, type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance completed successfully.', time: '1 hour ago', read: false },
        { id: 3, type: 'warning', title: 'Overdue Item', message: 'Student John Doe (25000) is 2 days late returning "Canon DSLR".', time: '3 hours ago', read: true },
        { id: 4, type: 'success', title: 'New User Registered', message: 'New staff member "Alice Smith" requested access.', time: 'Yesterday', read: true },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const HeroSection = (
        <div className="flex justify-between items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-gray-400">Stay updated with system alerts and activities.</p>
            </div>
            <button
                onClick={markAllRead}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
            >
                <CheckCircle2 className="w-4 h-4" /> Mark all read
            </button>
        </div>
    );

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
            case 'warning': return <Clock className="w-5 h-5 text-orange-500" />;
            case 'success': return <Check className="w-5 h-5 text-emerald-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'alert': return 'bg-rose-50 border-rose-100';
            case 'warning': return 'bg-orange-50 border-orange-100';
            case 'success': return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="mx-auto space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map((note) => (
                        <div
                            key={note.id}
                            className={`p-5 rounded-2xl border transition-all ${note.read ? 'bg-white border-slate-100 opacity-70' : 'bg-white border-l-4 border-l-[#8D8DC7] border-y-slate-100 border-r-slate-100 shadow-sm'}`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getColor(note.type)}`}>
                                    {getIcon(note.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold ${note.read ? 'text-slate-600' : 'text-slate-900'}`}>{note.title}</h3>
                                        <span className="text-xs font-bold text-slate-400">{note.time}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1">{note.message}</p>
                                </div>
                                {!note.read && (
                                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
