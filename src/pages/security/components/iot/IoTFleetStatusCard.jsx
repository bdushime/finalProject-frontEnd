import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Wifi, WifiOff, BatteryWarning } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTrackerStatusKind } from "./iotUtils";

const SEGMENT_COLORS = {
  online: "#22c55e",
  offline: "#f43f5e",
  weak: "#f59e0b",
};

export default function IoTFleetStatusCard({
  trackers = [],
  onlineCount = 0,
  offlineCount = 0,
  lowBatteryCount = 0,
}) {
  const { t } = useTranslation(["itstaff"]);

  const weakCount = useMemo(
    () => trackers.filter((tr) => getTrackerStatusKind(tr) === "weak").length,
    [trackers]
  );

  const total = trackers.length || 0;
  const onlinePct = total > 0 ? Math.round((onlineCount / total) * 100) : 0;

  const segments = useMemo(() => {
    const items = [
      {
        key: "online",
        name: t("iot.stats.online", "Online"),
        value: onlineCount,
        color: SEGMENT_COLORS.online,
        icon: Wifi,
      },
      {
        key: "offline",
        name: t("iot.stats.offline", "Offline"),
        value: offlineCount,
        color: SEGMENT_COLORS.offline,
        icon: WifiOff,
      },
    ];
    if (weakCount > 0) {
      items.push({
        key: "weak",
        name: t("iot.status.weakSignal", "Weak signal"),
        value: weakCount,
        color: SEGMENT_COLORS.weak,
        icon: BatteryWarning,
      });
    }
    return items.filter((s) => s.value > 0);
  }, [onlineCount, offlineCount, weakCount, t]);

  const chartData =
    segments.length > 0
      ? segments
      : [{ key: "empty", name: "—", value: 1, color: "#e2e8f0" }];

  return (
    <Card className="border-slate-200 shadow-sm h-full overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
      <CardHeader className="pb-2 border-b border-slate-100/80">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {t("iot.fleet.title", "Fleet health")}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {t("iot.fleet.subtitle", "Live tag status breakdown")}
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
            <Activity className="h-3 w-3" />
            Live
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-5">
        {total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-500">
            {t("iot.chart.collecting", "Collecting live data…")}
          </div>
        ) : (
          <>
            <div className="relative h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={68}
                    paddingAngle={segments.length > 1 ? 3 : 0}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}`, name]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">{onlinePct}%</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t("iot.fleet.onlineLabel", "online")}
                </span>
              </div>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              {segments.map((seg) => (
                <div
                  key={seg.key}
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(seg.value / total) * 100}%`,
                    backgroundColor: seg.color,
                  }}
                  title={`${seg.name}: ${seg.value}`}
                />
              ))}
            </div>

            <ul className="mt-4 grid grid-cols-1 gap-2">
              {segments.map((seg) => {
                const Icon = seg.icon;
                return (
                  <li
                    key={seg.key}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/80 px-3 py-2 text-sm shadow-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${seg.color}22` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: seg.color }} />
                      </span>
                      {seg.name}
                    </span>
                    <span className="font-bold tabular-nums text-slate-900">{seg.value}</span>
                  </li>
                );
              })}
              {lowBatteryCount > 0 && weakCount === 0 && (
                <li className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                  <BatteryWarning className="h-3.5 w-3.5 shrink-0" />
                  {t("iot.fleet.lowBatteryNote", {
                    count: lowBatteryCount,
                    defaultValue: "{{count}} device(s) below 30% battery",
                  })}
                </li>
              )}
            </ul>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              {t("iot.fleet.totalTags", {
                total,
                online: onlineCount,
                defaultValue: "{{online}} of {{total}} tags reporting",
              })}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
