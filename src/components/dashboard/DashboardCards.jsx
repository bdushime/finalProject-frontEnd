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
    <div className="flex justify-between items-center">
      <Progressbar />
    <div className="flex justify-end items-center gap-5 ">
      {/* the numbers to be used here should be got from the it-equipment.json file or the database */}
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <>
          {/* <Card
            onClick={() => navigate(`/it/browse`)}
            key={metric.label}
            className="bg-card border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-5">
              <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#BEBEE0" }}
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
            </Card> */}
            <div className=" flex flex-col">
              <div className="flex items-center gap-2 ">
              <div
                  className="p-1 rounded-lg mt-4 bg-gray-300/50 "
                  
                >
                  <Icon className={`h-4 w-4 text-gray-600`} />
                </div>
                <p className="text-4xl font-semibold text-foreground text-gray-800">
                    {metric.value.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                    {metric.label}
              </p>
            </div>
          </>
          // {/* </div> */}
        );
      })}
      </div>
    </div>
  );
}
