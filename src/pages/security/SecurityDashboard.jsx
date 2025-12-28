import { useState } from "react";
import MainLayout from "./layout/MainLayout";
import StatCard from "@/components/security/StatCard";
import ActionButton from "@/components/security/ActionButton";
import ChartCard from "@/components/security/ChartCard";
import AccessLogsTable from "@/components/security/AccessLogsTable";
import { Activity, FileText, ShieldCheck, AlertTriangle, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DeviceUsageChart from "./DeviceUsage";

// Mock data for charts
const accessTrendData = [
  { name: "Jan", checkouts: 455, returns: 420, failed: 12 },
  { name: "Feb", checkouts: 409, returns: 395, failed: 18 },
  { name: "Mar", checkouts: 522, returns: 510, failed: 8 },
  { name: "Apr", checkouts: 600, returns: 580, failed: 10 },
  { name: "May", checkouts: 650, returns: 630, failed: 12 },
  { name: "Jun", checkouts: 700, returns: 680, failed: 14 }
];

const equipmentTypeData = [
  { name: "Laptops", value: 245, color: "#1A2240" },
  { name: "Cameras", value: 130, color: "#BEBEE0" },
  { name: "Tablets", value: 67, color: "#343264" },
];

const COLORS = {
  navy: "#1A2240",
  navyDark: "#0A1128",
  purple: "#BEBEE0",
  purpleDark: "#343264",
};

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const [bookingFilter, setBookingFilter] = useState("quantity");
  const [categoryFilter, setCategoryFilter] = useState("weekly");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Section: Action Buttons + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Action Buttons */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionButton
              label="Monitor Activity"
              icon={Activity}
              variant="primary"
              onClick={() => navigate("/security/logs")}
            />
            <ActionButton
              label="Generate Report"
              icon={FileText}
              variant="secondary"
              onClick={() => console.log("Generate Report")}
            />
          </div>

          {/* Right: Summary Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Active Checkouts"
              value="85%"
              comparison="114 last month"
              change="+5%"
              changeType="positive"
            />
            <StatCard
              title="Security Alerts"
              value="12"
              comparison="18 last month"
              change="-33%"
              changeType="positive"
            />
            <StatCard
              title="System Uptime"
              value="99.8%"
              comparison="99.5% last month"
              change="+0.3%"
              changeType="positive"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Access Trends Chart */}
          <ChartCard
            title="Access Trends"
            description="Monthly checkouts and returns"
            filterLabel="Quantity"
            filterOptions={[
              { value: "quantity", label: "Quantity" },
              { value: "revenue", label: "Revenue" },
            ]}
            selectedFilter={bookingFilter}
            onFilterChange={setBookingFilter}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accessTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="checkouts"
                  fill={COLORS.navy}
                  radius={[8, 8, 0, 0]}
                  name="Checkouts"
                />
                <Bar
                  dataKey="returns"
                  fill={COLORS.purple}
                  radius={[8, 8, 0, 0]}
                  name="Returns"
                />
                <Bar
                  dataKey="failed"
                  fill={COLORS.purpleDark}
                  radius={[8, 8, 0, 0]}
                  name="Failed"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Equipment Type Distribution */}
          <ChartCard
            title="Top Equipment"
            description="Most accessed equipment types"
            filterLabel="Weekly"
            filterOptions={[
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            selectedFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
          >
              < DeviceUsageChart />
          </ChartCard>
        </div>

        <AccessLogsTable />
      </div>
    </MainLayout>
  );
}
