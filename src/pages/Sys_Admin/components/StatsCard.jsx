import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({
    title,
    value,
    change,
    trend = "positive",
    subtext,
    icon: Icon,
    isAlert = false,
    onClick,
    loading = false // 👈 New Prop for Dynamic Loading
}) => {
    const isPositive = trend === "positive";

    return (
        <div
            onClick={!loading ? onClick : undefined}
            className={`bg-white p-6 rounded-3xl shadow-lg relative overflow-hidden group transition-all duration-300 
            ${onClick && !loading ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''}`}
        >
            <div className="relative z-10">

                {/* Header: Title & Icon */}
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-bold text-gray-600 tracking-wide">{title}</p>

                </div>

                {/* Body: Value & Badge */}
                <div className="flex items-end space-x-3 min-h-[40px]">
                    {loading ? (
                        // 🌀 SKELETON LOADER (Shows while fetching)
                        <div className="space-y-2 w-full animate-pulse">
                            <div className="h-8 bg-slate-200 rounded-md w-1/2"></div>
                            <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                        </div>
                    ) : (
                        // ✅ REAL DATA
                        <>
                            <h3 className="text-4xl font-extrabold text-slate-900">{value}</h3>

                            {change && (
                                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-1 border ${isPositive
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : isAlert
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                    {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {change}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer: Subtext */}
                {!loading && subtext && (
                    <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>
                )}
            </div>

            {/* Decorative Background Blob */}
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full transition-colors duration-500 opacity-20 pointer-events-none ${isAlert ? 'bg-red-200' : 'bg-[#8D8DC7]'
                }`}></div>
        </div>
    );
};

export default StatsCard;