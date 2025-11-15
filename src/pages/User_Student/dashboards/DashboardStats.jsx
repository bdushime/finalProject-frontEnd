import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, AlertTriangle, CheckCircle, FileText, Hourglass } from "lucide-react";
import PropTypes from "prop-types";

const stats = [
    {
        label: "Active Borrows",
        value: 2,
        icon: Package,
        color: "text-blue-600 dark:text-blue-400",
        bgGradient: "from-blue-500 to-blue-600",
    },
    {
        label: "Pending Requests",
        value: 1,
        icon: Hourglass,
        color: "text-yellow-600 dark:text-yellow-400",
        bgGradient: "from-yellow-500 to-yellow-600",
    },
    {
        label: "Overdue Items",
        value: 1,
        icon: AlertTriangle,
        color: "text-red-600 dark:text-red-400",
        bgGradient: "from-red-500 to-red-600",
    },
    {
        label: "Returned Items",
        value: 4,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgGradient: "from-green-500 to-green-600",
    },
    {
        label: "Total Requests",
        value: 5,
        icon: FileText,
        color: "text-purple-600 dark:text-purple-400",
        bgGradient: "from-purple-500 to-purple-600",
    },
];

export default function DashboardStats({ statsData = {} }) {
    const displayStats = stats.map(stat => ({
        ...stat,
        value: statsData[stat.label.toLowerCase().replace(/\s+/g, '')] || stat.value,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {displayStats.map((metric) => {
                const Icon = metric.icon;
                return (
                    <Card
                        key={metric.label}
                        className="bg-card border border-gray-300 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-5">
                                <div
                                    className={`p-3 rounded-lg bg-gradient-to-br ${metric.bgGradient}`}
                                >
                                    <Icon className={`h-6 w-6 text-white`} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {metric.label}
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {metric.value.toLocaleString()}
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

