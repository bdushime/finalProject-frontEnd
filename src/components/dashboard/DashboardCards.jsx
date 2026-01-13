import { Card } from "@/components/ui/card"; // Fixed path to @/components
import { Package, Activity, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom"; 

export default function DashboardCards({ metricsData }) {
  const navigate = useNavigate();

  // Use real data if available, otherwise default to 0
  const data = {
    total: metricsData?.total || 0,
    active: metricsData?.active || 0,
    lost: metricsData?.lost || 0,
    overdue: metricsData?.overdue || 0,
  };

  const metrics = [
    {
      label: "Total Devices",
      value: data.total,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Loans",
      value: data.active,
      icon: Activity,
      color: "text-green-600 dark:text-green-400",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      label: "Lost / Maintenance",
      value: data.lost,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgGradient: "from-red-500 to-red-600",
    },
    {
      label: "Overdue Items",
      value: data.overdue,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgGradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`p-2 rounded-full bg-slate-50 mb-2 ${metric.color}`}>
               <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {metric.value}
            </p>
            <p className="text-xs text-slate-500">
              {metric.label}
            </p>
          </div>
        );
      })}
      </div>
    </div>
  );
}