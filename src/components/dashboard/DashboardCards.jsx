import { Card, CardContent } from "@components/ui/card";
import { Package, Activity, WifiOff, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Progressbar from "./Progressbar";

const metrics = [
  {
    label: "Total Devices",
    value: 45,
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500 to-blue-600",
  },
  {
    label: "Active Devices",
    value: 50,
    icon: Activity,
    color: "text-green-600 dark:text-green-400",
    bgGradient: "from-green-500 to-green-600",
  },
  {
    label: "Lost",
    value: 30,
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgGradient: "from-red-500 to-red-600",
  },
  {
    label: "Overdue date",
    value: 45,
    icon: Clock,
    color: "text-white dark:text-purple-400",
    bgGradient: "from-purple-500 to-purple-600",
  },
];

export default function DashboardCards() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <Progressbar />
    <div className="flex flex-wrap justify-start sm:justify-end items-center gap-3 sm:gap-5 w-full sm:w-auto">
      {/* the numbers to be used here should be got from the it-equipment.json file or the database */}
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="flex flex-col">
            <div className="flex items-center gap-2">
              <div
                className="p-1 rounded-lg mt-2 sm:mt-4 bg-gray-300/50"
              >
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-600`} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground text-gray-800">
                {metric.value.toLocaleString()}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {metric.label}
            </p>
          </div>
        );
      })}
      </div>
    </div>
  );
}
