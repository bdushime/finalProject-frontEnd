import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import DashboardCards from "@/components/dashboard/DashboardCards";
import Charts from "@/components/dashboard/Charts";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all analytics data in one go
                const res = await api.get('/analytics/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
            <div className="space-y-4 sm:space-y-6">
                {/* 1. Summary Cards (Top Row) */}
                <DashboardCards metricsData={stats?.metrics} />

                {/* 2. Main Grid (Charts, Profile, Activity, Map) */}
                {/* UPDATE: We now pass 'metrics' here so the usage bar knows the total device count */}
                <Charts 
                    chartData={stats?.charts} 
                    recentActivityData={stats?.recentActivity}
                    metrics={stats?.metrics} 
                />
            </div>
        </ITStaffLayout>
    );
}