import React from 'react';

export default function OnboardingProgress() {
    return (
        <div className="bg-[#fff9e6] rounded-[32px] p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-[#0b1d3a]">Onboarding</h3>
                <span className="text-4xl font-light text-[#0b1d3a]">18%</span>
            </div>

            <div className="relative h-12 w-full mt-4">
                {/* Progress Bars Stack */}
                <div className="absolute top-0 left-0 w-[40%] h-12 bg-[#FFD028] rounded-2xl z-20 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-[#0b1d3a]">Task</span>
                </div>
                <div className="absolute top-0 left-[35%] w-[35%] h-12 bg-[#1e1e1e] rounded-2xl z-10"></div>
                <div className="absolute top-0 left-[65%] w-[35%] h-12 bg-gray-400 rounded-2xl z-0"></div>

                {/* Labels */}
                <div className="absolute -top-6 left-0 text-[10px] font-bold text-slate-400">30%</div>
                <div className="absolute -top-6 left-[40%] text-[10px] font-bold text-slate-400">25%</div>
                <div className="absolute -top-6 left-[70%] text-[10px] font-bold text-slate-400">0%</div>
            </div>
        </div>
    );
}
