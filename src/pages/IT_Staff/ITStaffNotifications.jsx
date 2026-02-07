import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, Clock, AlertTriangle, CheckCircle, 
    ExternalLink, Check, CheckCheck, Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ITStaffNotifications() {
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
            toast.error("Could not load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // --- 2. HELPERS ---
    const getIcon = (type) => {
        if (type === 'error') return <AlertTriangle className="h-5 w-5 text-red-600" />;
        if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-orange-600" />;
        if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-600" />;
        return <Bell className="h-5 w-5 text-blue-600" />;
    };

    const getStyles = (type, read) => {
        const base = "border rounded-xl p-4 transition-all duration-200 flex gap-4";
        if (read) return `${base} bg-white border-gray-100 opacity-60 hover:opacity-100`;
        
        // Unread Styles
        if (type === 'error') return `${base} bg-red-50/50 border-red-100 shadow-sm`;
        if (type === 'warning') return `${base} bg-orange-50/50 border-orange-100 shadow-sm`;
        if (type === 'success') return `${base} bg-green-50/50 border-green-100 shadow-sm`;
        return `${base} bg-blue-50/50 border-blue-100 shadow-sm`;
    };

    // --- 3. ACTIONS ---
    const handleMarkRead = async (e, id, relatedId = null) => {
        if (e) e.stopPropagation();
        try {
            // Optimistic Update (Update UI immediately)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            
            await api.put(`/notifications/${id}/read`);
            
            if (relatedId) {
                // Determine where to redirect based on context
                // For now, we default to current checkouts, but you can make this dynamic
                navigate('/it/current-checkouts'); 
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            // Optimistic Update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            
            await api.put('/notifications/mark-all-read');
            toast.success("All notifications marked as read");
        } catch (err) {
            console.error(err);
            toast.error("Failed to mark all as read");
            fetchNotifications(); // Revert on failure
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
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none h-6 px-2">
                                    {unreadCount} New
                                </Badge>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your alerts and system updates</p>
                    </div>

                    {/* 👇 THIS IS THE BUTTON YOU ARE MISSING */}
                    {unreadCount > 0 && (
                        <Button 
                            variant="outline" 
                            onClick={handleMarkAllRead}
                            disabled={markingAll}
                            className="shrink-0 gap-2 border-gray-300 hover:bg-gray-50 bg-white"
                        >
                            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Notification List */}
                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {notifications.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed"
                            >
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 mt-1">You have no new notifications.</p>
                            </motion.div>
                        ) : (
                            notifications.map((n) => (
                                <motion.div
                                    key={n._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={getStyles(n.type, n.read)}
                                >
                                    {/* Icon Column */}
                                    <div className="shrink-0 pt-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                            {getIcon(n.type)}
                                        </div>
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
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {n.createdAt ? format(new Date(n.createdAt), "MMM d, h:mm a") : 'Just now'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 shrink-0">
                                                {/* 1. Quick Mark Read Button (Checkmark) */}
                                                {!n.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                        title="Mark as read"
                                                        onClick={(e) => handleMarkRead(e, n._id)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                {/* 2. View Details Button */}
                                                {n.relatedId && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1.5 border-gray-200 bg-white"
                                                        onClick={(e) => handleMarkRead(e, n._id, n.relatedId)}
                                                    >
                                                        Details
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ITStaffLayout>
    );
}