import { useState, useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import StatCard from "@/components/security/StatCard";
import ActionButton from "@/components/security/ActionButton";
import ChartCard from "@/components/security/ChartCard";
import { Activity, ShieldCheck, AlertTriangle, Clock} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AccessLogs from "./Accesslogs";
import api from "@/utils/api";
import Loader from "@/components/common/Loader";
import {
  ComposedChart,
  Bar,
  Line,
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

  const [stats, setStats] = useState({
    activeCount: 0,
    overdueCount: 0,
    trendData: [],
    equipmentTypeData: []
  });
  const [recentLogs, setRecentLogs] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/transactions/security/dashboard-stats'),
          api.get('/transactions/security/access-logs?limit=500')
        ]);
        
        const allLogs = logsRes.data.logs || [];
        const statsData = { ...statsRes.data };
        setStats(statsData);
        setStats(statsData);

        const mappedLogs = allLogs.slice(0, 5).map((log) => {
          let type = "movement";
          if (log.status === "Checked Out") type = "checkout";
          if (log.status === "Returned") type = "return";
          if (log.status === "Overdue") type = "violation";

          return {
            id: log._id,
            timestamp: log.updatedAt || log.createdAt,
            eventType: type,
            status: log.status,
            userName: log.user?.fullName || (log.user?.studentId ? `Student ${log.user.studentId}` : log.user?.username) || "Unknown",
            userId: log.user?.email || "N/A",
            deviceName: log.equipment?.name || "Unknown Item",
            deviceId: log.equipment?.serialNumber || "N/A",
            location: log.destination || "Main Storage",
            notes: log.purpose || "No notes provided",
          };
        });

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
          <Loader />
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

      {/* Desktop: keep original layout (stats + actions in one row) */}
      <div className="hidden lg:grid grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-2 relative z-10">
        <StatCard
          title={t("dashboard.stats.activeCheckouts")}
          value={stats.activeCount}
          subtext={t("dashboard.stats.currentlyOut")}
          changeType="neutral"
          icon={Clock}
        />
        <StatCard
          title={t("dashboard.stats.securityAlerts")}
          value={stats.overdueCount}
          subtext={t("dashboard.stats.overdueItems")}
          changeType={stats.overdueCount > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          isAlert={stats.overdueCount > 0}
        />
        <StatCard
          title={t("dashboard.stats.systemStatus")}
          value={t("dashboard.stats.online")}
          subtext={t("dashboard.stats.allSystemsNormal")}
          changeType="positive"
          icon={ShieldCheck}
        />
        <ActionButton
          label={t("dashboard.actions.browseInventory")}
          icon={Activity}
          variant="primary"
          onClick={() => navigate("/security/devices")}
          className="bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white border-none shadow-lg shadow-[#8D8DC7]/20"
        />
        <ActionButton
          label={t("dashboard.actions.scanVerify")}
          icon={ShieldCheck}
          variant="secondary"
          onClick={() => navigate("/gate-verification")}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
        />
      </div>

      {/* Mobile: use the improved split layout */}
      <div className="lg:hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 relative z-10">
          <StatCard
            title={t("dashboard.stats.activeCheckouts")}
            value={stats.activeCount}
            subtext={t("dashboard.stats.currentlyOut")}
            changeType="neutral"
            icon={Clock}
          />
          <StatCard
            title={t("dashboard.stats.securityAlerts")}
            value={stats.overdueCount}
            subtext={t("dashboard.stats.overdueItems")}
            changeType={stats.overdueCount > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            isAlert={stats.overdueCount > 0}
          />
          <StatCard
            title={t("dashboard.stats.systemStatus")}
            value={t("dashboard.stats.online")}
            subtext={t("dashboard.stats.allSystemsNormal")}
            changeType="positive"
            icon={ShieldCheck}
            className="md:col-span-1 col-span-2"
          />
        </div>

        {/* Actions */}
        <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3 relative z-10">
          <ActionButton
            label={t("dashboard.actions.browseInventory")}
            icon={Activity}
            variant="primary"
            onClick={() => navigate("/security/devices")}
            className="min-h-[120px] sm:min-h-[140px]"
          />
          <ActionButton
            label={t("dashboard.actions.scanVerify")}
            icon={ShieldCheck}
            variant="secondary"
            onClick={() => navigate("/gate-verification")}
            className="min-h-[120px] sm:min-h-[140px]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="space-y-2">
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Access Trends Chart */}
          <ChartCard
            title={t('dashboard.charts.activityTrends')}
            description={t('dashboard.charts.checkoutsVsOverdue')}
            className="lg:col-span-2 border border-gray-100 shadow-sm bg-white rounded-4xl"
          >
            {(() => {
              const rows = stats.trendData.length > 0
                ? stats.trendData.map((r) => ({ ...r, total: (r.checkouts || 0) + (r.failed || 0) }))
                : [{ name: t('dashboard.charts.noData'), checkouts: 0, failed: 0, total: 0 }];
              const totalCheckouts = rows.reduce((s, r) => s + (r.checkouts || 0), 0);
              const totalFailed = rows.reduce((s, r) => s + (r.failed || 0), 0);
              const failureRate = totalCheckouts + totalFailed > 0
                ? Math.round((totalFailed / (totalCheckouts + totalFailed)) * 100)
                : 0;

              return (
                <>
                  {/* KPI strip */}
                  <div className="grid grid-cols-3 gap-3 px-1 mb-4">
                    <div className="rounded-2xl bg-slate-50/70 border border-slate-100 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('dashboard.charts.checkouts')}
                      </p>
                      <p className="text-xl font-black text-[#0b1d3a] leading-tight mt-0.5">
                        {totalCheckouts}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-rose-50/60 border border-rose-100 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                        {t('dashboard.charts.failedOverdue')}
                      </p>
                      <p className="text-xl font-black text-rose-600 leading-tight mt-0.5">
                        {totalFailed}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                        {t('dashboard.charts.failureRate', 'Failure rate')}
                      </p>
                      <p className="text-xl font-black text-[#8D8DC7] leading-tight mt-0.5">
                        {failureRate}%
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="checkoutsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0b1d3a" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#1e293b" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.75} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(141,141,199,0.06)" }}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "0.75rem",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
                          fontSize: 12,
                        }}
                        labelStyle={{ fontWeight: 700, color: "#0b1d3a" }}
                        formatter={(value, name) => {
                          if (name === t('dashboard.charts.checkouts')) return [value, t('dashboard.charts.checkouts')];
                          if (name === t('dashboard.charts.failedOverdue')) return [value, t('dashboard.charts.failedOverdue')];
                          if (name === t('dashboard.charts.total', 'Total')) return [value, t('dashboard.charts.total', 'Total')];
                          return [value, name];
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
                      <Bar
                        dataKey="checkouts"
                        fill="url(#checkoutsGradient)"
                        radius={[8, 8, 0, 0]}
                        name={t('dashboard.charts.checkouts')}
                        barSize={28}
                        animationDuration={650}
                      />
                      <Bar
                        dataKey="failed"
                        fill="url(#failedGradient)"
                        radius={[8, 8, 0, 0]}
                        name={t('dashboard.charts.failedOverdue')}
                        barSize={28}
                        animationDuration={650}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name={t('dashboard.charts.total', 'Total')}
                        stroke="#8D8DC7"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#8D8DC7", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                        animationDuration={800}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              );
            })()}
          </ChartCard>

          {/* Equipment Type Distribution */}
          <ChartCard
            title={t('dashboard.charts.topEquipment')}
            description={t('dashboard.charts.mostAccessedCategories')}
            className="border border-gray-100 shadow-sm bg-white rounded-4xl"
          >
            <DeviceUsageChart data={stats.equipmentTypeData} />
          </ChartCard>
        </div>

        {/* Recent Logs Section */}
        <div className="bg-white p-2 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl sm:text-xl font-bold text-slate-900">{t('dashboard.recentLogs')}</h3>
            <button onClick={() => navigate('/security/logs')} className="text-sm font-semibold text-[#8D8DC7] hover:bg-slate-50 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
              {t('common:actions.viewAll')}
              <Activity className="h-4 w-4" />
            </button>
          </div>
          <AccessLogs showHeader={false} showLayout={false} maxRecords={5} />
        </div>
      </div>
    </MainLayout>
  );
}
