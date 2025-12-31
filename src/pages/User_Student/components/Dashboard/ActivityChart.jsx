import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ActivityChart() {
    // Mock data for the chart - Saturday (last element) is 0 as requested
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const values = [20, 45, 60, 80, 50, 90, 0]; // Percentages for weekly borrowing

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 h-full min-h-[300px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-medium text-[#0b1d3a]">Weekly Borrowing</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-light text-[#0b1d3a]">12</span>
                        <span className="text-xs text-slate-500 font-medium">Items<br />this week</span>
                    </div>
                </div>
                <button className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Added padding-bottom to ensure labels are visible */}
            <div className="flex-1 flex items-end justify-between px-2 gap-2 mt-4 pb-2">
                {values.map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 w-full group relative">
                        {/* Tooltip for Peak */}
                        {idx === 5 && (
                            <div className="absolute -top-[140%] bg-[#126dd5] text-white text-xs font-bold py-1.5 px-3 rounded-xl mb-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                Peak
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#126dd5] rotate-45"></div>
                            </div>
                        )}

                        {/* Bar background */}
                        <div className="w-2.5 h-[140px] bg-[#f0f9ff] rounded-full relative overflow-hidden">
                            {/* Bar Fill - Reverted to Light Blue (#126dd5) as requested */}
                            <div
                                className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${val === 0 ? '' : 'bg-[#126dd5]'}`}
                                style={{ height: `${val}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{days[idx]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
