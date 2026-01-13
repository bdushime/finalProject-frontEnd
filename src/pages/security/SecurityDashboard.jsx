import { useState, useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import StatCard from "@/components/security/StatCard";
import ActionButton from "@/components/security/ActionButton";
import ChartCard from "@/components/security/ChartCard";
import AccessLogsTable from "@/components/security/AccessLogsTable";
import { Activity, FileText, ShieldCheck, AlertTriangle, Users, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api"; // Import your API helper
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DeviceUsageChart from "./DeviceUsage";

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [stats, setStats] = useState({
    activeCount: 0,
    overdueCount: 0,
    trendData: [],
    equipmentTypeData: []
  });

  // Fetch Data on Load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/transactions/security/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load security stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = {
    navy: "#1A2240",
    purple: "#BEBEE0",
    red: "#ef4444",
  };

  if (loading) {
      return (
          <MainLayout>
              <div className="h-screen flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1A2240]" />
              </div>
          </MainLayout>
      );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-[#1A2240]">Security Overview</h1>

        {/* Top Section: Action Buttons + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Action Buttons */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionButton
              label="Browse Inventory"
              icon={Activity}
              variant="primary"
              onClick={() => navigate("/security/devices")}
            />
            <ActionButton
              label="Scan/Verify"
              icon={ShieldCheck} // Changed icon to represent checking
              variant="secondary"
              onClick={() => navigate("/security/verify")} // Future Gatekeeper link
            />
          </div>

          {/* Right: Summary Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Active Checkouts"
              value={stats.activeCount}
              comparison="Currently out"
              changeType="neutral"
              icon={Clock}
            />
            <StatCard
              title="Security Alerts"
              value={stats.overdueCount}
              comparison="Overdue Items"
              changeType={stats.overdueCount > 0 ? "negative" : "positive"}
              icon={AlertTriangle}
            />
            <StatCard
              title="System Status"
              value="Online"
              comparison="All systems normal"
              changeType="positive"
              icon={ShieldCheck}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Access Trends Chart */}
          <ChartCard
            title="Activity Trends"
            description="Checkouts vs Overdue incidents"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.trendData.length > 0 ? stats.trendData : [{name: 'No Data', checkouts: 0}]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "#6b7280" }} />
                <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "0.5rem" }}
                />
                <Legend />
                <Bar dataKey="checkouts" fill={COLORS.navy} radius={[4, 4, 0, 0]} name="Checkouts" />
                <Bar dataKey="failed" fill={COLORS.red} radius={[4, 4, 0, 0]} name="Overdue/Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Equipment Type Distribution */}
          <ChartCard
            title="Top Equipment"
            description="Most accessed categories"
          >
             {/* Pass real data to your existing component if it accepts props, 
                 otherwise we render a simple list here or update DeviceUsage.jsx later */}
             <DeviceUsageChart data={stats.equipmentTypeData} /> 
          </ChartCard>
        </div>

        {/* We can reuse the Reports Table logic here if you want recent logs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
             <h3 className="text-lg font-bold text-[#1A2240] mb-4">Recent Activity Logs</h3>
             <AccessLogsTable />
        </div>
      </div>
    </MainLayout>
  );
}