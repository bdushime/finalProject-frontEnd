import React from 'react';

export default function SystemHealth() {
    // User requested 100% and Yellow color
    const health = 100;

    return (
        <div className="mt-4 px-6 py-3 border border-slate-200 text-black rounded-full text-sm font-bold flex items-center gap-3 bg-white/50 backdrop-blur-sm shadow-sm w-fit">
            System Health
            <span className="h-1.5 w-24 bg-yellow-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${health}%` }}></div>
            </span>
            <span className="text-yellow-600 font-bold">{health}%</span>
        </div>
    );
}
