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

import { useTranslation } from "react-i18next";

export default function SecurityDashboard() {
  const { t } = useTranslation(["security", "common"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [stats, setStats] = useState({
    activeCount: 0,
    overdueCount: 0,
    trendData: [],
    equipmentTypeData: []
  });
  const [recentLogs, setRecentLogs] = useState([]);

  // Fetch Data on Load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/transactions/security/dashboard-stats'),
          api.get('/transactions/security/access-logs')
        ]);
        setStats(statsRes.data);

        // Map logs for the AccessLogsTable format
        const mappedLogs = (logsRes.data.logs || []).slice(0, 5).map(log => ({
          id: log._id,
          timestamp: log.updatedAt || log.createdAt,
          user: log.user?.username || log.user?.fullName || "Unknown",
          userId: log.user?.studentId || log.user?._id || "N/A",
          email: log.user?.email || "N/A",
          action: log.status === 'Checked Out' ? 'Checkout' : log.status === 'Returned' ? 'Return' : log.status === 'Overdue' ? 'Overdue' : 'Checkout',
          equipment: log.equipment?.name || "Unknown Item",
          equipmentId: log.equipment?.serialNumber || "N/A",
          location: log.destination || "Main Storage",
          status: log.status === 'Overdue' ? 'failed' : 'success',
          ipAddress: "—"
        }));
        setRecentLogs(mappedLogs);
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

  const HeroSection = (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short", month: "short", day: "numeric", year: "numeric"
            }).format(new Date())} • {t('dashboard.stats.systemStatus')}: {t('dashboard.stats.online')}
          </p>
        </div>
      </div>

      {/* Stats Cards + Action Buttons in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
        <StatCard
          title={t('dashboard.stats.activeCheckouts')}
          value={stats.activeCount}
          subtext={t('dashboard.stats.currentlyOut')}
          changeType="neutral"
          icon={Clock}
        />
        <StatCard
          title={t('dashboard.stats.securityAlerts')}
          value={stats.overdueCount}
          subtext={t('dashboard.stats.overdueItems')}
          changeType={stats.overdueCount > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          isAlert={stats.overdueCount > 0}
        />
        <StatCard
          title={t('dashboard.stats.systemStatus')}
          value={t('dashboard.stats.online')}
          subtext={t('dashboard.stats.allSystemsNormal')}
          changeType="positive"
          icon={ShieldCheck}
        />
        <ActionButton
          label={t('dashboard.actions.browseInventory')}
          icon={Activity}
          variant="primary"
          onClick={() => navigate("/security/devices")}
          className="bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white border-none shadow-lg shadow-[#8D8DC7]/20"
        />
        <ActionButton
          label={t('dashboard.actions.scanVerify')}
          icon={ShieldCheck}
          variant="secondary"
          onClick={() => navigate("/security/verify")}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
        />
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="space-y-8 mt-4">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Access Trends Chart */}
          <ChartCard
            title={t('dashboard.charts.activityTrends')}
            description={t('dashboard.charts.checkoutsVsOverdue')}
            className="lg:col-span-2 border border-gray-100 shadow-sm bg-white rounded-[2rem]"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.trendData.length > 0 ? stats.trendData : [{ name: t('dashboard.charts.noData'), checkouts: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(value, name) => [value, name === 'checkouts' ? t('dashboard.charts.checkouts') : t('dashboard.charts.failedOverdue')]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="checkouts" fill="#1e293b" radius={[6, 6, 0, 0]} name={t('dashboard.charts.checkouts')} barSize={32} />
                <Bar dataKey="failed" fill="#ef4444" radius={[6, 6, 0, 0]} name={t('dashboard.charts.failedOverdue')} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Equipment Type Distribution */}
          <ChartCard
            title={t('dashboard.charts.topEquipment')}
            description={t('dashboard.charts.mostAccessedCategories')}
            className="border border-gray-100 shadow-sm bg-white rounded-[2rem]"
          >
            <DeviceUsageChart data={stats.equipmentTypeData} />
          </ChartCard>
        </div>

        {/* Recent Logs Section */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">{t('dashboard.recentLogs')}</h3>
            <button onClick={() => navigate('/security/logs')} className="text-sm font-semibold text-[#8D8DC7] hover:bg-slate-50 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
              {t('common:actions.viewAll')}
              <Activity className="h-4 w-4" />
            </button>
          </div>
          <AccessLogsTable data={recentLogs} loading={loading} />
        </div>
      </div>
    </MainLayout>
  );
}
