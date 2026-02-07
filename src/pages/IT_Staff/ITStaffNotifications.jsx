import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { Bell, Clock, AlertTriangle, MapPin, ExternalLink, CheckCircle, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/Page";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ITStaffNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const getIcon = (type) => {
        if (type === 'error') return <AlertTriangle className="h-4 w-4 text-red-600" />;
        if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-orange-600" />;
        if (type === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
        return <Bell className="h-4 w-4 text-blue-600" />;
    };

    const getIconBgColor = (type) => {
        if (type === 'error') return "bg-red-50 border border-red-100";
        if (type === 'warning') return "bg-orange-50 border border-orange-100";
        if (type === 'success') return "bg-green-50 border border-green-100";
        return "bg-blue-50 border border-blue-100";
    };

    // --- 3. ACTIONS ---
    const handleMarkRead = async (id, relatedId) => {
        try {
            await api.put(`/notifications/${id}/read`);

            // If there is a related item (e.g., Transaction/Equipment ID), go there
            if (relatedId) {
                // Determine where to go based on ID format or context (Optional logic)
                // For now, assume relatedId is a Transaction ID and go to checkouts
                navigate('/it/current-checkouts');
            } else {
                // Just refresh list locally
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                <PageHeader
                    title={
                        <span className="flex items-center gap-3">
                            Notifications
                            {notifications.filter(n => !n.read).length > 0 && (
                                <Badge className="bg-red-600 hover:bg-red-700 text-sm">
                                    {notifications.filter(n => !n.read).length} Unread
                                </Badge>
                            )}
                        </span>
                    }
                />

                <div className="mt-4 rounded-2xl shadow-sm bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="font-medium">No notifications yet</p>
                            <p className="text-sm mt-1">We'll alert you when important events happen.</p>
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
                                    className={`p-5 flex items-start gap-4 transition-colors hover:bg-gray-50 ${!n.read ? "bg-blue-50/30" : ""
                                        }`}
                                >
                                    {/* Icon Box */}
                                    <div className={`mt-1 rounded-xl p-2.5 flex-shrink-0 ${getIconBgColor(n.type)}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-semibold text-sm ${isCritical ? "text-red-900" : "text-gray-900"}`}>
                                                        {n.title}
                                                    </h4>
                                                    {!n.read && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {n.message}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {n.createdAt ? format(new Date(n.createdAt), "MMM d, h:mm a") : 'Just now'}
                                                    </div>

                                                    {isCritical && (
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getSeverityColor(severity)}`}>
                                                            CRITICAL
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
                                                    View Details
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