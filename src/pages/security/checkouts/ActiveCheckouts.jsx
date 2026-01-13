import React from 'react'
import MainLayout from '../layout/MainLayout'
import StatCard from '@/components/security/StatCard'
import AccessLogsTable from '@/components/security/AccessLogsTable'

function Accesslogs() {
  return (
    
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 space-y-6">
          <StatCard
            title="Total Borrowed Items"
            value="1,386"
            comparison="1,245 last month"
            change="+11.3%"
            changeType="negative"
          />
          <StatCard
            title="Total Lost Items"
            value="45"
            comparison="52 last month"
            change="-13.5%"
            changeType="positive"
          />
          <StatCard
            title="Total Damaged Items"
            value="12"
            comparison="15 last month"
            change="+20%"
            changeType="negative"
          />
          <StatCard
            title="Total Overdue Items"
            value="1.2s"
            comparison="1.5s last month"
            change="-20%"
            changeType="positive"
          />
        </div>
        <AccessLogsTable />
    </MainLayout>
  )
}

export default Accesslogs