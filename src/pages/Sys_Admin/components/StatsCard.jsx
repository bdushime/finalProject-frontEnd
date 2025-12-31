
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, change, trend = "positive", subtext, dark = false, icon: Icon, isAlert = false, onClick }) => {
    const isPositive = trend === "positive";

    // Alert Styles (Red emphasis for negative trends if isAlert is true)
    const alertBg = isAlert && !isPositive ? 'bg-red-50' : dark ? 'bg-white' : 'bg-white'; // Keep card white, but maybe icon changes

    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
        >

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-bold text-gray-700">{title}</p>
                    {/* Icon Support */}
                    {Icon && (
                        <div className={`p-2 rounded-xl ${isAlert ? 'bg-red-50' : 'bg-[#8D8DC7]/10'}`}>
                            <Icon className={`w-5 h-5 ${isAlert ? 'text-red-500' : 'text-[#8D8DC7]'}`} />
                        </div>
                    )}
                </div>

                <div className="flex items-end space-x-3">
                    <h3 className="text-4xl font-extrabold text-slate-900">{value}</h3>
                    {change && (
                        <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-1 ${isPositive ? 'bg-green-100 text-green-700' :
                            isAlert ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {change}
                        </div>
                    )}
                </div>

                {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
            </div>

            {/* Decorative gradient blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full transition-colors duration-300 ${isAlert ? 'bg-red-50 group-hover:bg-red-100' : 'bg-gray-50 group-hover:bg-[#8D8DC7]/10'
                }`}></div>
        </div>
    );
};

export default StatsCard;
