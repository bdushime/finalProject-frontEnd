import React from 'react';
import AdminLayout from './components/AdminLayout';
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

const AdminNotifications = () => {
    // Mock Notifications Data
    const notifications = [
        {
            id: 1,
            title: "New Equipment Request",
            message: "Student John Doe requested 3 items for checkout.",
            type: "info",
            time: "2 mins ago",
            read: false
        },
        {
            id: 2,
            title: "Overdue Item Alert",
            message: "Projector X1 is 2 hours overdue (Borrowed by Jane Smith).",
            type: "warning",
            time: "1 hour ago",
            read: false
        },
        {
            id: 3,
            title: "System Maintenance",
            message: "Scheduled maintenance completed successfully.",
            type: "success",
            time: "1 day ago",
            read: true
        }
    ];

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
            case 'info':
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Recent Alerts</h3>
                    <button className="text-sm font-semibold text-[#8D8DC7] hover:text-[#7b7bb5]">Mark all as read</button>
                </div>

                <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/10' : ''}`}>
                            <div className={`mt-1 p-2 rounded-full ${!notif.read ? 'bg-white shadow-sm border border-slate-100' : 'bg-slate-100'}`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1 h-full">
                                    <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                                    <div className="flex items-center text-xs text-slate-400 gap-1 whitespace-nowrap ml-4">
                                        <Clock className="w-3 h-3" />
                                        <span>{notif.time}</span>
                                    </div>
                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-rose-500 ml-2 mt-1.5" />}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No new notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
