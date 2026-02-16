import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import StatCard from '@/components/security/StatCard'
import AccessLogsTable from '@/components/security/AccessLogsTable'
import { useTranslation } from 'react-i18next'

function ActiveCheckouts() {
  const { t } = useTranslation(["security", "common"]);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 space-y-6">
        <StatCard
          title={t('activeCheckouts.stats.totalBorrowed')}
          value="1,386"
          comparison={`1,245 ${t('activeCheckouts.stats.lastMonth')}`}
          change="+11.3%"
          changeType="negative"
        />
        <StatCard
          title={t('activeCheckouts.stats.totalLost')}
          value="45"
          comparison={`52 ${t('activeCheckouts.stats.lastMonth')}`}
          change="-13.5%"
          changeType="positive"
        />
        <StatCard
          title={t('activeCheckouts.stats.totalDamaged')}
          value="12"
          comparison={`15 ${t('activeCheckouts.stats.lastMonth')}`}
          change="+20%"
          changeType="negative"
        />
        <StatCard
          title={t('activeCheckouts.stats.totalOverdue')}
          value="1.2s"
          comparison={`1.5s ${t('activeCheckouts.stats.lastMonth')}`}
          change="-20%"
          changeType="positive"
        />
      </div>
      <AccessLogsTable />
    </MainLayout>
  )
}

export default ActiveCheckouts