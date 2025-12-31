import {
    Laptop2,
    ClipboardList,
    AlertCircle,
    Undo2,
    ShieldCheck,
} from "lucide-react";
import PropTypes from "prop-types";

const stats = [
    { 
        label: "Active Borrows", 
        key: "activeBorrows",
        icon: Laptop2,
        bg: "bg-[#0b1d3a]",
    },
    { 
        label: "Pending Requests", 
        key: "pendingRequests",
        icon: ClipboardList,
        bg: "bg-[#1e3a5f]",
    },
    { 
        label: "Overdue Items", 
        key: "overdueItems",
        icon: AlertCircle,
        bg: "bg-[#0b69d4]",
    },
    { 
        label: "Returned Items", 
        key: "returnedItems",
        icon: Undo2,
        bg: "bg-[#334155]",
    },
    { 
        label: "Score", 
        key: "score",
        icon: ShieldCheck, 
        suffix: "/100",
        bg: "bg-[#0ea5e9]",
    },
];

export default function DashboardStats({ statsData = {} }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const value = statsData?.[stat.key];
                
                return (
                    <div
                        key={stat.label}
                        className={`${stat.bg} rounded-2xl p-5 flex items-center justify-between`}
                    >
                        {/* Left: Label + Number */}
                        <div>
                            <p className="text-sm text-white/70 font-medium mb-1">
                                {stat.label}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">
                                    {value ?? "—"}
                                </span>
                                {stat.suffix && (
                                    <span className="text-lg text-white/60 font-semibold">
                                        {stat.suffix}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Right: Icon */}
                        <div className="p-3 rounded-xl bg-white/10">
                            <Icon className="h-6 w-6 text-white/80" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

DashboardStats.propTypes = {
    statsData: PropTypes.object,
};