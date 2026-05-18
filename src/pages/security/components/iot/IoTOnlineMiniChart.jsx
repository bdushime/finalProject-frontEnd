import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function IoTOnlineMiniChart({ data = [] }) {
  const { t } = useTranslation(["itstaff"]);

  return (
    <Card className="border-slate-200/90 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">
          {t("iot.chart.title", "Online devices")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("iot.chart.subtitle", "Heartbeat trend (last few minutes)")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[180px] w-full">
          {data.length < 2 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {t("iot.chart.collecting", "Collecting live data…")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="onlineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="online"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#onlineFill)"
                  name={t("iot.stats.online", "Online")}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
