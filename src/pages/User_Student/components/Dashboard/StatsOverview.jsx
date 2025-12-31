import React from 'react';
import { Package, Clock, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ stats }) {
    // Map existing stats to the design - Customized for student borrowing
    const items = [
        { label: 'Active Loans', value: 3, icon: Package },
        { label: 'Pending', value: 1, icon: Clock },
        { label: 'Overdue', value: 0, icon: AlertTriangle },
    ];

    return (
        <div className="flex items-center justify-end gap-8 md:gap-12">
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-default">
                    <div className="flex items-center gap-3 mb-1">
                        <item.icon className={`w-5 h-5 ${item.label === 'Overdue' && item.value > 0 ? 'text-red-500' : 'text-slate-400 group-hover:text-[#126dd5]'} transition-colors`} />
                        <span className="text-4xl md:text-5xl font-light text-[#0b1d3a] tracking-tight">{item.value}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide pl-7">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
