import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import PropTypes from "prop-types";

export default function RecentActivity({ notifications = [] }) {
    const recentNotifications = notifications.slice(0, 5);

    const getIcon = (type) => {
        switch (type) {
            case 'approved':
                return CheckCircle;
            case 'rejected':
                return XCircle;
            case 'overdue':
            case 'reminder':
                return AlertCircle;
            default:
                return Clock;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Card className="border border-slate-100/80 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.4)] bg-white/95 backdrop-blur-sm text-[#0b1d3a]">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0b1d3a] tracking-tight">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                        <div className="p-4 rounded-full bg-sky-50 w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-sky-100">
                            <Clock className="h-10 w-10 text-sky-600" />
                        </div>
                        <p className="font-medium">No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentNotifications.map((notification) => {
                            const Icon = getIcon(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 hover:bg-sky-50 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_28px_-22px_rgba(8,47,73,0.35)] border border-slate-100"
                                >
                                    <div className="p-2 rounded-lg bg-sky-100 flex-shrink-0 border border-sky-200">
                                        <Icon className="h-5 w-5 text-sky-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-[#0b1d3a] mb-1">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

RecentActivity.propTypes = {
    notifications: PropTypes.array,
};


