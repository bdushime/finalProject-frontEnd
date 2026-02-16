import React from 'react';
import { Package, Clock, AlertTriangle, Monitor } from 'lucide-react';

import { useTranslation } from "react-i18next";

export default function StatsOverview({ stats }) {
    const { t } = useTranslation(["itstaff"]);

    const items = [
        {
            label: t('dashboard.stats.totalDevices'),
            value: stats?.total || 0,
            icon: Monitor
        },
        {
            label: t('dashboard.stats.activeBorrows'),
            value: stats?.active || 0,
            icon: Package
        },
        {
            label: t('dashboard.stats.lostMaint'),
            value: stats?.lost || 0,
            icon: AlertTriangle
        },
        {
            label: t('dashboard.stats.overdueItems'),
            value: stats?.overdue || 0,
            icon: Clock
        },
    ];

    return (
        <div className="flex items-center justify-end gap-6 md:gap-8 flex-wrap">
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-default">
                    <div className="flex items-center gap-3 mb-1">
                        <item.icon className={`w-5 h-5 ${item.label === t('dashboard.stats.overdueItems') && item.value > 0 ? 'text-red-500' : 'text-slate-400 group-hover:text-[#126dd5]'} transition-colors`} />
                        <span className="text-3xl md:text-4xl font-light text-[#0b1d3a] tracking-tight">{item.value}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide pl-7">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
