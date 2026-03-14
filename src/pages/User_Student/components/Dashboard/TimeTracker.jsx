import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TimeTracker({ activeBorrow: activeLoan }) {
    const { t } = useTranslation("student");
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [statusText, setStatusText] = useState(t("dashboard.noActiveTimer"));
    const [progressOffset, setProgressOffset] = useState(351); // Full circle (empty)

    // Circle config
    const radius = 56;
    const circumference = 2 * Math.PI * radius; // approx 351

    useEffect(() => {
        const currentStatus = activeLoan?.status?.toLowerCase();
        if (!activeLoan || currentStatus === 'returned') {
            setTimeLeft("00:00");
            setStatusText(t("dashboard.noActiveItems"));
            setProgressOffset(circumference);
            return;
        }

        const calculateTime = () => {
            const now = new Date();
            const due = new Date(activeLoan.expectedReturnTime);
            const diff = due - now;

            if (!activeLoan?.expectedReturnTime || diff <= 0) {
                setTimeLeft("00:00");
                setStatusText(t("dashboard.returnOverdue"));
                setProgressOffset(0); // Full circle (full warning)
                return;
            }

            // Convert to HH:MM:SS
            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Format for display
            const hDisplay = hours < 10 ? `0${hours}` : hours;
            const mDisplay = minutes < 10 ? `0${minutes}` : minutes;
            const sDisplay = seconds < 10 ? `0${seconds}` : seconds;

            if (hours > 0) {
                // More than an hour: Show HH:MM
                setTimeLeft(`${hDisplay}:${mDisplay}`);
                setStatusText(t("dashboard.timeLeft"));
            } else {
                // Less than an hour: Show MM:SS
                setTimeLeft(`${mDisplay}:${sDisplay}`);
                setStatusText("Minutes Remaining");
            }

            // Calculate Progress Bar (Dynamic)
            const createdAt = activeLoan?.createdAt || activeLoan?.startTime || new Date();
            const start = new Date(createdAt);
            const totalDuration = due - start;
            const elapsed = now - start;

            // If we don't have createdAt or it's invalid, fallback to 5H limit
            const validTotal = (totalDuration > 0) ? totalDuration : (5 * 60 * 60 * 1000);
            const percentageUsed = Math.min(Math.max(elapsed / validTotal, 0), 1);

            // Offset for the circle (351 - usage)
            const offset = circumference * (1 - percentageUsed);
            setProgressOffset(offset);
        };

        // Run immediately
        calculateTime();

        // Initial setup: Determine interval
        const now = new Date();
        const due = new Date(activeLoan.expectedReturnTime);
        const diff = due - now;

        // If less than an hour, update every second. Otherwise every minute.
        const intervalTime = (diff > 0 && diff < 3600000) ? 1000 : 60000;
        const timer = setInterval(calculateTime, intervalTime);

        // Optional: Re-eval interval if it crosses the 1-hour threshold
        // (Simple interval above is fine for most UX, but we can also just use 1s always for simplicity 
        // if we want it most accurate, or stick to this as it's more efficient)

        return () => clearInterval(timer);
    }, [activeLoan, circumference, t]);

    return (
        <div className="bg-[#0b1d3a] rounded-[32px] p-6 h-full flex flex-col relative overflow-hidden group">
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-700" />

            <div className="flex justify-between items-start mb-6 z-10">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-white">{t("dashboard.timer")}</h3>
                    <span className="text-sm font-medium text-white/50 block leading-tight">
                        {activeLoan?.equipment?.name || (activeLoan ? "Unknown Item" : "System Idle")}
                    </span>
                    {activeLoan && activeLoan.status?.toLowerCase() !== 'returned' && (
                        <div className="flex items-center gap-2 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 w-fit mt-1">
                            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-tight">
                                {activeLoan.status?.toLowerCase() === 'pending return' ? 'Returning' : 'Active'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="opacity-50">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative -mt-4 z-10">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                        <circle
                            cx="64" cy="64" r="50"
                            stroke={activeLoan ? (statusText === t("dashboard.returnOverdue") ? "#ef4444" : "#3b82f6") : "rgba(255,255,255,0.05)"}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={314} // 2 * PI * 50
                            strokeDashoffset={activeLoan ? (314 * (1 - (progressOffset / circumference))) : 314}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white tabular-nums tracking-tighter">
                            {timeLeft}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${statusText === t("dashboard.returnOverdue") ? 'text-red-400 animate-pulse' : 'text-blue-400/50'}`}>
                            {timeLeft === "00:00" && !activeLoan ? "READY" : statusText}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-center z-10">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] font-medium text-white/40">
                        {activeLoan ? `Due at ${new Date(activeLoan.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No Active Sessions"}
                    </span>
                </div>
            </div>
        </div>
    );
}
