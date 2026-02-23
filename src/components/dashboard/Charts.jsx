import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import image from "@/assets/image.png";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import IoTMapView from "@/pages/IT_Staff/components/iot/IoTMapView";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";

const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  background: "#343264",
};

// UPDATE: Added 'metrics' to the props list
import { useTranslation } from "react-i18next";

export default function Charts({ chartData, recentActivityData, metrics }) {
  const { t } = useTranslation(["itstaff"]);
  const [trackers, setTrackers] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();

  // --- 1. Prepare Data for Charts ---
  const deviceTypesData = chartData?.deviceTypes || [];

  const activityTrendsData = chartData?.activityTrends?.length > 0
    ? chartData.activityTrends
    : [
      { name: "Jan", checkouts: 0, returns: 0 },
      { name: "Feb", checkouts: 0, returns: 0 },
      { name: "Mar", checkouts: 0, returns: 0 }
    ];

  // --- 2. Window Resize Logic ---
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 3. Fetch Map Data ---
  // --- 3. Fetch Map Data (REAL DATA) ---
  useEffect(() => {
    async function loadTrackerData() {
      try {
        const res = await api.get(`/monitoring/live?nocache=${new Date().getTime()}`);
        if (res.data && res.data.trackers) {
          // --- STRICT HEARTBEAT CHECK ---
          // If device hasn't pinged in 15s, mark offline locally
          const now = new Date().getTime();
          const TIMEOUT_MS = 15000;

          const processed = res.data.trackers.map(t => {
            const tracker = { ...t };
            if (tracker.status === 'online' && tracker.lastSeen) {
              const lastSeenTime = new Date(tracker.lastSeen).getTime();
              if (now - lastSeenTime > TIMEOUT_MS) {
                tracker.status = 'offline';
              }
            }
            return tracker;
          });

          setTrackers(processed);
        } else {
          setTrackers([]);
        }
      } catch (err) {
        console.error("Failed to load tracker data:", err);
      }
    }
    loadTrackerData();
    // Poll every 5s for dashboard live view
    const interval = setInterval(loadTrackerData, 5000);
    return () => clearInterval(interval);
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

      {/* 1. PROFILE CARD */}
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative border-none sm:col-span-2 lg:col-span-1 min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
        <img src={image} alt="Profile" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-black/20 to-transparent" />
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between text-white">
          <div>
            <h3 className="text-base sm:text-xl font-bold leading-tight">
              {t('dashboard.profileCard.role')}
            </h3>
            <p className="text-xs sm:text-sm opacity-80">{t('dashboard.profileCard.subRole')}</p>
          </div>
        </div>
      </Card>

      {/* 2. ACTIVITY TRENDS CHART (Line) */}
      <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">
            {t('dashboard.charts.activityTrends')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('dashboard.charts.monthlyActivity')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ResponsiveContainer className="overflow-hidden" width="100%" height={getChartHeight()}>
            <LineChart data={activityTrendsData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
              <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
              <Line type="monotone" dataKey="checkouts" stroke={COLORS.blue} strokeWidth={2} name={t('dashboard.charts.checkouts')} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="returns" stroke={COLORS.green} strokeWidth={2} name={t('dashboard.charts.returns')} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. DEVICE TYPES CHART (Bar) */}
      <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold">{t('dashboard.charts.deviceTypes')}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{t('dashboard.charts.distribution')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer className="overflow-hidden" width="100%" height={getChartHeight()}>
            <BarChart data={deviceTypesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" tick={{ fill: "currentColor" }} />
              <YAxis axisLine={false} tickLine={false} className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: "#343264", color: "#fff", borderRadius: "5px" }}
              />
              <Bar
                barCategoryGap="10%"
                barGap={1}
                barSize={20}
                dataKey="count"
                fill={COLORS.background}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. RECENT ACTIVITY LIST */}
      <Card className="sm:col-span-2 lg:col-span-1 lg:row-span-2 border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
        {/* UPDATE: Passing 'metrics' down to RecentActivity */}
        <RecentActivity data={recentActivityData} metrics={metrics} />
      </Card>

      {/* 5. QUICK ACTIONS */}
      <div className="sm:col-span-2 lg:col-span-1 h-full flex">
        <QuickActions />
      </div>

      {/* 6. IOT MAP VIEW */}
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