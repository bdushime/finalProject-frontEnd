import React, { useState, useEffect } from 'react'
import MainLayout from '@/pages/security/layout/MainLayout'
import StatCard from '@/components/security/StatCard'
import AccessLogsTable from '@/components/security/AccessLogsTable'
import { useTranslation } from 'react-i18next'
import { Package, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import api from '@/utils/api'

function ActiveCheckouts() {
  const { t } = useTranslation(["security", "common"]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBorrowed: 0, totalLost: 0, totalDamaged: 0, totalOverdue: 0 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/transactions/security/access-logs');
        setStats(res.data.stats || { totalBorrowed: 0, totalLost: 0, totalDamaged: 0, totalOverdue: 0 });

        const mappedLogs = (res.data.logs || []).map(log => ({
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
        setLogs(mappedLogs);
      } catch (err) {
        console.error("Failed to load checkout data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const HeroSection = (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('activeCheckouts.title', 'Active Checkouts')}</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
            {t('activeCheckouts.subtitle', 'Monitor all currently checked out equipment')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <StatCard
          title={t('activeCheckouts.stats.totalBorrowed', 'Total Borrowed')}
          value={loading ? '...' : stats.totalBorrowed}
          subtext={t('activeCheckouts.stats.allTime', 'all time')}
          changeType="neutral"
          icon={Package}
          loading={loading}
        />
        <StatCard
          title={t('activeCheckouts.stats.totalLost', 'Total Lost')}
          value={loading ? '...' : stats.totalLost}
          subtext={t('activeCheckouts.stats.requiresAttention', 'requires attention')}
          changeType={stats.totalLost > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          isAlert={stats.totalLost > 0}
          loading={loading}
        />
        <StatCard
          title={t('activeCheckouts.stats.totalDamaged', 'Total Damaged')}
          value={loading ? '...' : stats.totalDamaged}
          subtext={t('activeCheckouts.stats.reported', 'reported')}
          changeType={stats.totalDamaged > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          loading={loading}
        />
        <StatCard
          title={t('activeCheckouts.stats.totalOverdue', 'Total Overdue')}
          value={loading ? '...' : stats.totalOverdue}
          subtext={t('activeCheckouts.stats.needFollowUp', 'need follow up')}
          changeType={stats.totalOverdue > 0 ? "negative" : "positive"}
          icon={Clock}
          isAlert={stats.totalOverdue > 0}
          loading={loading}
        />
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <AccessLogsTable data={logs} loading={loading} />
    </MainLayout>
  )
}

export default ActiveCheckouts