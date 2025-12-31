import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function TimeTracker() {
    return (
        <div className="bg-[#f0f9ff] rounded-[32px] p-6 h-full min-h-[200px] flex flex-col relative overflow-hidden shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-medium text-[#0b1d3a]">Timer</h3>
                    <span className="text-xs text-[#0b1d3a]/60">Canon Projector X5</span>
                </div>
                <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative -mt-2">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="white" strokeWidth="10" fill="transparent" />
                        <circle cx="64" cy="64" r="56" stroke="#0b1d3a" strokeWidth="10" fill="transparent" strokeDasharray="351" strokeDashoffset="88" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-light text-[#0b1d3a] tabular-nums">03:45</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">Time Left</span>
                    </div>
                </div>
            </div>

            <div className="mt-1 text-center">
                <span className="text-xs font-medium text-[#0b1d3a]/40 block">Auto-tracking active</span>
            </div>
        </div>
    );
}
