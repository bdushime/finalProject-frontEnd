import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Now accepts 'weeklyData' (array of 7 numbers)
export default function ActivityChart({ count = 0, weeklyData = [0, 0, 0, 0, 0, 0, 0] }) {
    const { t } = useTranslation("student");
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday - Saturday

    // Find the highest number to calculate bar height percentages
    // If max is 0 (no borrowing), use 1 to avoid division by zero
    const maxVal = Math.max(...weeklyData, 1);

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 h-full min-h-[300px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-medium text-[#0b1d3a]">{t("dashboard.weeklyBorrowing")}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-light text-[#0b1d3a]">{count}</span>
                        <span className="text-xs text-slate-500 font-medium">{t("dashboard.itemsThisWeek")}</span>
                    </div>
                </div>
                <button className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            <div className="flex-1 flex items-end justify-between px-2 gap-2 mt-4 pb-2">
                {weeklyData.map((val, idx) => {
                    // Calculate height: (Value / MaxValue) * 100
                    // Example: If val is 2 and max is 4, height is 50%
                    const heightPercent = (val / maxVal) * 100;

                    return (
                        <div key={idx} className="flex flex-col items-center gap-3 w-full group relative">
                            {/* Show Tooltip only if this is the Peak day AND value > 0 */}
                            {val === maxVal && val > 0 && (
                                <div className="absolute -top-[140%] bg-[#126dd5] text-white text-xs font-bold py-1.5 px-3 rounded-xl mb-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    {t("dashboard.peak")}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#126dd5] rotate-45"></div>
                                </div>
                            )}

                            <div className="w-2.5 h-[140px] bg-[#f0f9ff] rounded-full relative overflow-hidden">
                                <div
                                    className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${val === 0 ? '' : 'bg-[#126dd5]'}`}
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">{days[idx]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
