import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Package } from "lucide-react";

// Brand palette — used in order for whichever categories actually show up.
const DEFAULT_PALETTE = [
  "#0b1d3a",
  "#8D8DC7",
  "#126dd5",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

const renderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload || {};
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 text-xs">
      <div className="font-semibold text-slate-900">{item.name}</div>
      <div className="text-slate-500 mt-0.5">
        <span className="font-bold text-slate-700">{item.value}</span> checkouts ·{" "}
        <span className="font-bold text-slate-700">{item.percent}%</span>
      </div>
    </div>
  );
};

const DeviceUsage = ({ data: serverData }) => {
  const { t } = useTranslation(["security"]);

  // Normalize + drop zero/N/A entries so the chart doesn't render empty slices.
  const { rows, total, dominant } = useMemo(() => {
    const raw = Array.isArray(serverData) ? serverData : [];
    const cleaned = raw
      .filter((d) => d && d.value > 0 && d.name && d.name !== "N/A")
      .map((d, i) => ({
        name: d.name,
        value: d.value,
        color: d.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
      }));

    const sum = cleaned.reduce((s, r) => s + r.value, 0);
    const withPct = cleaned
      .map((r) => ({ ...r, percent: sum > 0 ? Math.round((r.value / sum) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);

    return {
      rows: withPct,
      total: sum,
      dominant: withPct[0] || null,
    };
  }, [serverData]);

  // Empty state — no real data yet
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
          <Package className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {t("dashboard.charts.noEquipmentData", "No equipment activity yet")}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {t(
            "dashboard.charts.noEquipmentDataHint",
            "Categories will appear here once devices are checked out."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center px-2 py-2">
      {/* Donut */}
      <div className="relative h-52 sm:h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={rows.length > 1 ? 3 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive
              animationDuration={650}
            >
              {rows.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl sm:text-4xl font-black text-[#0b1d3a] leading-none">
            {dominant.percent}%
          </div>
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            {dominant.name}
          </div>
        </div>
      </div>

      {/* Side legend */}
      <ul className="flex sm:flex-col gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-center sm:min-w-[140px]">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center gap-2 sm:gap-3 text-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: row.color }}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-slate-800">{row.name}</span>
              <span className="text-[11px] text-slate-400">
                {row.value} · {row.percent}%
              </span>
            </div>
          </li>
        ))}
        <li className="text-[10px] uppercase tracking-widest text-slate-400 pt-1 sm:pt-3 sm:border-t sm:border-slate-100 sm:mt-1">
          {t("dashboard.charts.total", "Total")}:{" "}
          <span className="font-bold text-slate-700">{total}</span>
        </li>
      </ul>
    </div>
  );
};

export default DeviceUsage;
