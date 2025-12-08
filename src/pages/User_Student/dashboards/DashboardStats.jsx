import { Card, CardContent } from "@/components/ui/card";
import {
    Laptop2,
    ClipboardList,
    AlertOctagon,
    Undo2,
    ShieldCheck,
} from "lucide-react";
import PropTypes from "prop-types";

const stats = [
    { label: "Active Borrows", icon: Laptop2 },
    { label: "Pending Requests", icon: ClipboardList },
    { label: "Overdue Items", icon: AlertOctagon },
    { label: "Returned Items", icon: Undo2 },
    { label: "Score", icon: ShieldCheck, suffix: "/100" },
];

export default function DashboardStats({ statsData = {} }) {
    const toCamel = (s) => s
        .split(/\s+/)
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
        .join("");

    // Map provided statsData to the UI items. Do NOT fall back to hardcoded numbers
    // — show an explicit placeholder when a value isn't provided so the user
    // can supply their own data/UI.
    const displayStats = stats.map((stat) => {
        const keyCamel = toCamel(stat.label);
        const keyNoSpace = stat.label.toLowerCase().replace(/\s+/g, "");
        const value = statsData?.[keyCamel] ?? statsData?.[keyNoSpace];
        return {
            ...stat,
            value,
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {displayStats.map((metric) => {
                const Icon = metric.icon;
                return (
                    <Card
                        key={metric.label}
                        className="border border-slate-100/80 bg-white/90 backdrop-blur-sm text-[#0b1d3a] shadow-[0_12px_28px_-20px_rgba(8,47,73,0.35)] hover:shadow-[0_20px_40px_-20px_rgba(8,47,73,0.45)] hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-5">
                                <div className="p-4 rounded-xl bg-sky-500/12 text-sky-700 shadow-inner shadow-sky-900/10 border border-sky-500/20">
                                    <Icon className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-slate-600 mb-1 tracking-tight">
                                        {metric.label}
                                    </p>
                                    <p className="text-3xl font-extrabold text-[#0b1d3a] drop-shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                                        {metric.value == null ? (
                                            <span className="text-2xl text-slate-400">—</span>
                                        ) : (
                                            typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value
                                        )}
                                        {metric.suffix && <span className="text-lg text-slate-500 ml-1 font-bold">{metric.suffix}</span>}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

DashboardStats.propTypes = {
    statsData: PropTypes.object,
};

