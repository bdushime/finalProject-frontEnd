import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Battery,
  Thermometer,
  Droplets,
  History,
  User,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getBatteryColor,
  getBatteryProgressColor,
  getTemperatureColor,
  formatLastSeen,
  formatSensorValue,
  getTrackerStatusKind,
  getTrackerStatusLabel,
  getTrackerStatusDotClass,
  getTrackerStatusBadgeClass,
  findBorrowerForTracker,
  formatAssignmentDisplay,
  isTemperatureHighForMaintenance,
  getSensorDisplay,
} from "./iotUtils";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/common/PaginationControls";
import { useTranslation } from "react-i18next";

const TH_CLASS =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-300 h-11 px-4 whitespace-nowrap";

function TrackerStatusBadge({ tracker, compact }) {
  const { t } = useTranslation(["itstaff"]);
  const kind = getTrackerStatusKind(tracker);
  const pulse = kind === "online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-semibold ${
        compact ? "text-[10px]" : "text-xs"
      } ${getTrackerStatusBadgeClass(kind)}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${getTrackerStatusDotClass(kind)}`} />
      </span>
      {getTrackerStatusLabel(tracker, t)}
    </span>
  );
}

function BatteryMeter({ value }) {
  if (value == null || Number.isNaN(Number(value))) {
    return <span className="text-xs font-medium text-slate-400">N/A</span>;
  }
  const pct = Math.max(0, Math.min(100, Number(value)));
  const barColor = getBatteryProgressColor(pct);
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <Battery className={`h-4 w-4 shrink-0 ${getBatteryColor(pct)}`} />
      <div className="flex-1 space-y-1">
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-800 tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

function TempCell({ tracker, t }) {
  const display = getSensorDisplay(tracker, "temperature", "°C");
  const needsMaintenance = isTemperatureHighForMaintenance(tracker.temperature);

  if (display.type !== "value") {
    return <span className="text-sm font-medium text-slate-400">{display.text}</span>;
  }

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-bold tabular-nums ${getTemperatureColor(tracker.temperature)}`}
      >
        <Thermometer className="h-4 w-4 shrink-0" />
        {display.text}
      </span>
      {needsMaintenance && (
        <span
          className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
          title={t("iot.table.tempMaintenanceHint")}
        >
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {t("iot.table.tempMaintenance", "Maintenance")}
        </span>
      )}
    </div>
  );
}

function HumidityCell({ tracker }) {
  const display = getSensorDisplay(tracker, "humidity", "%");

  if (display.type !== "value") {
    return <span className="text-sm font-medium text-slate-400">{display.text}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 tabular-nums">
      <Droplets className="h-4 w-4 text-sky-500 shrink-0" />
      {display.text}
    </span>
  );
}

function AssignmentCell({ borrower, t }) {
  const info = formatAssignmentDisplay(borrower);
  if (!info) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 text-xs font-medium text-slate-600">
        <Package className="h-3.5 w-3.5 text-slate-400" />
        {t("iot.table.inStorage", "In storage")}
      </span>
    );
  }
  return (
    <div className="max-w-[200px]">
      <div className="flex items-center gap-1.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <User className="h-3.5 w-3.5" />
        </span>
        <span className="font-semibold text-slate-900 text-sm truncate" title={info.name}>
          {info.name}
        </span>
      </div>
      {info.destination && (
        <p
          className="mt-1 pl-8 text-[11px] text-slate-500 truncate"
          title={info.fullDestination || info.destination}
        >
          <MapPin className="inline h-3 w-3 mr-0.5 -mt-px text-indigo-400" />
          {info.destination}
        </p>
      )}
    </div>
  );
}

export function IoTTableSection({
  viewMode,
  trackers,
  filteredTrackers,
  setSelectedTracker,
  historyData,
  lastSeenSnapshots = {},
  borrowerMap,
  page,
  setPage,
}) {
  const { t } = useTranslation(["itstaff"]);
  const effectivePageSize = 10;

  const { totalPages, currentPage, paginatedItems: currentTrackers } = usePagination(
    filteredTrackers,
    page,
    effectivePageSize
  );

  const onlineOnPage = currentTrackers.filter((tr) => tr.status === "online").length;
  if (viewMode !== "table") return null;

  return (
    <>
      <Card className="border-0 shadow-lg ring-1 ring-slate-200/80 bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
                {t("iot.table.title")}
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-1">
                {t("iot.table.showing", { current: filteredTrackers.length, total: trackers.length })}
                <span className="mx-2 text-slate-300">|</span>
                {t("iot.table.page", { current: currentPage, total: totalPages })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {onlineOnPage} {t("iot.stats.online", "Online")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800 border-0">
                  <TableHead className={`${TH_CLASS} w-[220px] rounded-tl-lg`}>
                    {t("iot.table.headers.equipment")}
                  </TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.id")}</TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.location")}</TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.status")}</TableHead>
                  <TableHead className={`${TH_CLASS} min-w-[160px]`}>
                    {t("iot.table.headers.assignedTo", "Assigned to")}
                  </TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.battery")}</TableHead>
                  <TableHead className={TH_CLASS} title={t("iot.table.tempMaintenanceHint")}>
                    {t("iot.table.headers.temp")}
                  </TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.humidity")}</TableHead>
                  <TableHead className={TH_CLASS}>{t("iot.table.headers.lastSeen")}</TableHead>
                  <TableHead className={`${TH_CLASS} w-12 rounded-tr-lg`} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.map((tracker, idx) => {
                  const borrower = findBorrowerForTracker(tracker, borrowerMap);
                  const isOnline = tracker.status === "online";
                  const highTemp = isTemperatureHighForMaintenance(tracker.temperature);

                  return (
                      <TableRow
                        key={tracker.id}
                        className={`group border-b border-slate-100 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        } ${isOnline ? "hover:bg-emerald-50/50" : "hover:bg-slate-100/80"} ${
                          highTemp ? "bg-rose-50/40" : ""
                        }`}
                      >
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isOnline
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {(tracker.equipment || "?").charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[160px]">
                                {tracker.equipment}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <code className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">
                            {tracker.id}
                          </code>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            {tracker.location || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <TrackerStatusBadge tracker={tracker} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <AssignmentCell borrower={borrower} t={t} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <BatteryMeter value={tracker.battery} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <TempCell tracker={tracker} t={t} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <HumidityCell tracker={tracker} t={t} />
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              isOnline ? "text-emerald-700" : "text-slate-600"
                            }`}
                          >
                            {formatLastSeen(tracker.lastSeen)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 opacity-70 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTracker(tracker);
                            }}
                            title={t("iot.table.viewHistory")}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                  );
                })}
                {currentTrackers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-16 text-slate-500">
                      {t("iot.table.noTrackers")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="px-6 py-4 border-t border-slate-100 bg-slate-50/50"
          />
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden mt-4">
        {currentTrackers.map((tracker) => {
          const borrower = findBorrowerForTracker(tracker, borrowerMap);
          return (
            <Card
              key={tracker.id}
              className="border-slate-200 shadow-sm overflow-hidden"
              onClick={() => setSelectedTracker(tracker)}
            >
              <CardHeader className="pb-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{tracker.equipment}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">{tracker.id}</CardDescription>
                  </div>
                  <TrackerStatusBadge tracker={tracker} compact />
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-3 text-sm">
                <AssignmentCell borrower={borrower} t={t} />
                <BatteryMeter value={tracker.battery} />
                <div className="flex gap-4">
                  <TempCell tracker={tracker} t={t} />
                  <HumidityCell tracker={tracker} t={t} />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  {t("iot.table.lastSeen", { time: formatLastSeen(tracker.lastSeen) })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function TrackerHistoryDialog({ selectedTracker, onClose, historyData, borrowerMap }) {
  const { t } = useTranslation(["itstaff"]);
  if (!selectedTracker) return null;
  const borrower = findBorrowerForTracker(selectedTracker, borrowerMap);
  const assignment = formatAssignmentDisplay(borrower);

  return (
    <Dialog open={!!selectedTracker} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl border-slate-200 shadow-xl rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("iot.table.historyTitle", { equipment: selectedTracker.equipment })}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{selectedTracker.id}</span>
            <span className="mx-2">·</span>
            {selectedTracker.location}
            {assignment && (
              <span className="block mt-2 text-sm">
                {t("iot.table.checkedOutBy", "Checked out by")}{" "}
                <strong>{assignment.name}</strong>
                {assignment.fullDestination && (
                  <span className="text-slate-500"> — {assignment.fullDestination}</span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <TrackerHistoryChart data={historyData[selectedTracker.id] || []} tracker={selectedTracker} />
      </DialogContent>
    </Dialog>
  );
}

function TrackerHistoryChart({ data, tracker }) {
  const { t } = useTranslation(["itstaff"]);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">{t("iot.table.trends")}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="battery" stroke="#4f46e5" strokeWidth={2} name={t("iot.table.batteryPercent")} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#e11d48" strokeWidth={2} name={t("iot.table.tempCelcius")} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">{t("iot.table.currentBattery")}</p>
          <p className="text-2xl font-bold text-slate-900">{tracker.battery ?? "—"}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">{t("iot.table.currentTemp")}</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatSensorValue(tracker.temperature, "°C") ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
