import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import image from "@/assets/image.png";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import IoTMapView from "@/pages/IT_Staff/components/iot/IoTMapView";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
  gray: "#6b7280",
  background: "#343264",
};

const deviceStatusData = [
  { name: "Active", value: 450, color: COLORS.green },
  { name: "Offline", value: 120, color: COLORS.orange },
  { name: "Lost/Stolen", value: 30, color: COLORS.red },
  { name: "Maintenance", value: 45, color: COLORS.blue },
];

const activityTrendsData = [
  { name: "Jan", checkouts: 120, returns: 95 },
  { name: "Feb", checkouts: 145, returns: 120 },
  { name: "Mar", checkouts: 130, returns: 140 },
  { name: "Apr", checkouts: 160, returns: 150 },
  { name: "May", checkouts: 180, returns: 165 },
  { name: "Jun", checkouts: 200, returns: 185 },
];

const deviceTypesData = [
  { name: "Laptops", count: 245 },
  { name: "Tablets", count: 180 },
  { name: "Cameras", count: 95 },
  { name: "Projectors", count: 75 },
  { name: "Audio", count: 50 },
];

export default function Charts() {
  const [trackers, setTrackers] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/trackers.json");
        const json = await res.json();
        const formatted = json.map((t) => ({
          ...t,
          lastSeen: new Date(t.lastSeen),
        }));
        setTrackers(formatted);
      } catch (err) {
        console.error("Failed to load tracker data:", err);
      }
    }
    loadData();
  }, []);

  const getChartHeight = () => {
    if (windowWidth < 640) return 200;
    if (windowWidth < 1024) return 220;
    return 180;
  };

  const getMapHeight = () => {
    if (windowWidth < 640) return 250;
    if (windowWidth < 1024) return 300;
    return 200;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-1">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative border-none sm:col-span-2 lg:col-span-1 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
        <img src={image} alt="Profile" className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-linear-to-t from-gray-300/60 via-black/20 to-transparent" />

        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between text-white">
          <div>
            <h3 className="text-base sm:text-xl font-bold leading-tight">
              IT Manager
            </h3>
            <p className="text-xs sm:text-sm opacity-80">Manager</p>
          </div>
        </div>
      </Card>

      <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">
            Activity Trends
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Monthly checkout and return trends</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ResponsiveContainer className="overflow-hidden" width="100%" height={getChartHeight()}>
            <LineChart data={activityTrendsData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.background,
                  border: "1px solid border",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                // className="stroke-blue-500 text-sm"
                type="monotone"
                dataKey="checkouts"
                stroke={COLORS.blue}
                strokeWidth={2}
                name="Checkouts"
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke={COLORS.green}
                strokeWidth={2}
                name="Returns"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">Device Types</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Distribution by device category</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer className="overflow-hidden" width="100%" height={getChartHeight()}>
            <BarChart data={deviceTypesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              {/* <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /> */}
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <YAxis axisLine={false} tickLine={false} className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "bg-[#343264]",
                  border: "1px solid var(--border)",
                  borderRadius: "0.2rem",
                }}
              />
              <Bar
                barCategoryGap="10%"
                barGap={1}              
                barSize={10}
                dataKey="count"
                fill={COLORS.background}
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1 lg:row-span-2 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        <RecentActivity />
      </Card>

      <div className="sm:col-span-2 lg:col-span-1 h-full flex">
        <QuickActions />
      </div>
      <div className="sm:col-span-2 lg:col-span-2 h-full flex">
        <IoTMapView 
          filteredTrackers={trackers} 
          mapHeight={getMapHeight()}
          onNavigate={() => navigate("/it/iot-tracker")}
        />
      </div>
    </div>
  );
}
