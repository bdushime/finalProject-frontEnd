import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import StatsOverview from "./components/Dashboard/StatsOverview";
import Charts from "@/components/dashboard/Charts";
import api from "@/utils/api";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SystemHealth from "./components/Dashboard/SystemHealth";

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: "IT Staff" });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all analytics data in one go
                const res = await api.get('/analytics/dashboard');
                setStats(res.data);

                // Try to fetch profile for name if possible, otherwise default is used
                try {
                    const profileRes = await api.get('/users/profile');
                    if (profileRes.data) {
                        setUser({ name: profileRes.data.fullName || profileRes.data.username || "IT Staff" });
                    }
                } catch (e) {
                    // ignore if profile fetch fails
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    if (loading) {
        return (
            <ITStaffLayout>
                <div className="h-[80vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </ITStaffLayout>
        );
    }

    // Map the API stats to what StatsOverview expects if names differ
    // API returns: { metrics: { total, active, lost, overdue }, charts: ... }
    // StatsOverview expects: { total, active, lost, overdue }
    const overviewStats = stats?.metrics || {};

    return (
        <ITStaffLayout maxWidth="max-w-full">
            <div className="fixed inset-0 bg-gradient-to-br from-white via-white to-[#f0f9ff] -z-10 pointer-events-none" />

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    {/* LEFT SIDE: Greeting, Date, System Health */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl md:text-5xl font-light text-[#0b1d3a] tracking-tight mb-2">
                            {getGreeting()}, <span className="font-medium">{user.name}</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-light">{formattedDate}</p>

                        {/* System Health (Below Date) */}
                        <SystemHealth />
                    </div>

                    {/* RIGHT SIDE: Add Equipment Button & Stats */}
                    <div className="flex flex-col items-end gap-6">
                        {/* Big Add Equipment Button */}


                        {/* Stats Overview */}
                        <StatsOverview stats={overviewStats} />
                    </div>
                </div>

                {/* Main Grid (Charts, etc.) */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Reusing existing Charts component but ensuring it fits the style */}
                    <Charts
                        chartData={stats?.charts}
                        recentActivityData={stats?.recentActivity}
                        metrics={stats?.metrics}
                    />
                </div>
            </div>
        </ITStaffLayout>
    );
}