import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TimeTracker({ activeLoan }) {
    const { t } = useTranslation("student");
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [statusText, setStatusText] = useState(t("dashboard.noActiveTimer"));
    const [progressOffset, setProgressOffset] = useState(351); // Full circle (empty)

    // Circle config
    const radius = 56;
    const circumference = 2 * Math.PI * radius; // approx 351

    useEffect(() => {
        if (!activeLoan) {
            setTimeLeft("00:00");
            setStatusText(t("dashboard.noItemsBorrowed"));
            setProgressOffset(circumference);
            return;
        }

        const calculateTime = () => {
            const now = new Date();
            const due = new Date(activeLoan.expectedReturnTime);
            const diff = due - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                setStatusText(t("dashboard.returnOverdue"));
                setProgressOffset(0); // Full circle (full warning)
                return;
            }

            // Convert to HH:MM
            const hours = Math.floor((diff / (1000 * 60 * 60)));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            // Format with leading zeros
            const hDisplay = hours < 10 ? `0${hours}` : hours;
            const mDisplay = minutes < 10 ? `0${minutes}` : minutes;

            setTimeLeft(`${hDisplay}:${mDisplay}`);
            setStatusText(t("dashboard.timeLeft"));

            // Calculate Progress Bar (Assumes max loan is 24 hours for visual scale)
            // If you have 24h left, circle is full. 12h left, half full.
            const totalLoanDuration = 24 * 60 * 60 * 1000;
            const percentageLeft = Math.min(Math.max(diff / totalLoanDuration, 0), 1);
            const offset = circumference - (percentageLeft * circumference);
            setProgressOffset(offset);
        };

        // Run immediately and then every minute
        calculateTime();
        const timer = setInterval(calculateTime, 60000);

        return () => clearInterval(timer);
    }, [activeLoan, circumference, t]);

    return (
        <div className="bg-[#f0f9ff] rounded-[32px] p-6 h-full min-h-[200px] flex flex-col relative overflow-hidden shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-medium text-[#0b1d3a]">{t("dashboard.timer")}</h3>
                    {/* Dynamic Item Name */}
                    <span className="text-xs text-[#0b1d3a]/60 truncate max-w-[150px] block">
                        {activeLoan ? activeLoan.equipment.name : t("dashboard.noActiveItems")}
                    </span>
                </div>
                <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                    {activeLoan ? <ArrowUpRight className="w-4 h-4 text-slate-400" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative -mt-2">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="64" cy="64" r="56" stroke="white" strokeWidth="10" fill="transparent" />
                        {/* Progress Circle */}
                        <circle
                            cx="64" cy="64" r="56"
                            stroke={activeLoan ? "#0b1d3a" : "#cbd5e1"}
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={progressOffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-light text-[#0b1d3a] tabular-nums">
                            {timeLeft}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${statusText === t("dashboard.returnOverdue") ? 'text-red-500' : 'text-slate-400'}`}>
                            {statusText}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-1 text-center">
                <span className="text-xs font-medium text-[#0b1d3a]/40 block">
                    {activeLoan ? t("dashboard.autoTracking") : t("dashboard.allClear")}
                </span>
            </div>
        </div>
    );
}
