import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Package,
  Calendar,
  Filter,
  Warehouse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import { useTranslation } from "react-i18next";

const EVENT_BADGE_CLASS = {
  checkout: "bg-blue-50 text-blue-800 border-blue-200",
  return: "bg-emerald-50 text-emerald-800 border-emerald-200",
  storage: "bg-slate-100 text-slate-700 border-slate-200",
  movement: "bg-slate-100 text-slate-700 border-slate-200",
  geofence_violation: "bg-rose-50 text-rose-800 border-rose-200",
};

const EVENT_DOT_CLASS = {
  checkout: "bg-blue-500",
  return: "bg-emerald-500",
  storage: "bg-slate-500",
  movement: "bg-slate-400",
  geofence_violation: "bg-orange-500",
};

const EVENT_TYPE_ICONS = {
  checkout: Package,
  return: CheckCircle,
  storage: Warehouse,
  movement: ArrowRight,
  geofence_violation: AlertTriangle,
};

const EVENT_LABEL_KEYS = {
  checkout: "checkouts",
  return: "returns",
  storage: "storage",
  movement: "movements",
  geofence_violation: "violations",
};

export default function DeviceMovementTimeline({ movements }) {
  const { t } = useTranslation(["security", "common"]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const typeMatch = filterType === "all" || movement.eventType === filterType;
      const statusMatch = filterStatus === "all" || movement.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [movements, filterType, filterStatus]);

  const groupedMovements = useMemo(() => {
    const groups = {};
    filteredMovements.forEach((movement) => {
      const date = format(new Date(movement.timestamp), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(movement);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredMovements]);

  const eventTypeLabel = (eventType) => {
    const key = EVENT_LABEL_KEYS[eventType] || "movements";
    return t(`deviceMovementHistory.timeline.filters.${key}`, eventType);
  };

  return (
    <motion.div className="space-y-4">
      <motion.div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <motion.div className="flex items-center gap-2 text-sm font-semibold text-slate-600 shrink-0">
          <Filter className="h-4 w-4 text-[#8D8DC7]" />
          {t("deviceMovementHistory.timeline.filters.label")}
        </motion.div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-slate-200">
            <SelectValue placeholder={t("deviceMovementHistory.timeline.filters.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("deviceMovementHistory.timeline.filters.allEvents")}</SelectItem>
            <SelectItem value="checkout">{t("deviceMovementHistory.timeline.filters.checkouts")}</SelectItem>
            <SelectItem value="return">{t("deviceMovementHistory.timeline.filters.returns")}</SelectItem>
            <SelectItem value="storage">{t("deviceMovementHistory.timeline.filters.storage")}</SelectItem>
            <SelectItem value="geofence_violation">
              {t("deviceMovementHistory.timeline.filters.violations")}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-slate-200">
            <SelectValue placeholder={t("deviceMovementHistory.timeline.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("deviceMovementHistory.timeline.filters.allStatus")}</SelectItem>
            <SelectItem value="active">{t("deviceMovementHistory.timeline.filters.active")}</SelectItem>
            <SelectItem value="completed">{t("deviceMovementHistory.timeline.filters.completed")}</SelectItem>
            <SelectItem value="violation">{t("deviceMovementHistory.timeline.filters.violations")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {groupedMovements.length === 0 ? (
        <motion.div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">{t("deviceMovementHistory.timeline.empty")}</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-6">
          {groupedMovements.map(([date, dayMovements]) => (
            <motion.div key={date} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <motion.div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2 flex-wrap">
                <Calendar className="h-4 w-4 text-[#8D8DC7]" />
                <h3 className="font-semibold text-slate-900">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
                <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600">
                  {dayMovements.length}{" "}
                  {dayMovements.length === 1
                    ? t("deviceMovementHistory.timeline.event")
                    : t("deviceMovementHistory.timeline.events")}
                </Badge>
              </motion.div>

              <motion.div className="relative pl-10 sm:pl-12 py-4 pr-4">
                <motion.div className="absolute left-5 sm:left-6 top-4 bottom-4 w-0.5 bg-slate-200" />

                {dayMovements.map((movement, index) => {
                  const Icon = EVENT_TYPE_ICONS[movement.eventType] || Package;
                  const dotClass = EVENT_DOT_CLASS[movement.eventType] || "bg-slate-400";

                  return (
                    <motion.div
                      key={movement.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="relative pb-6 last:pb-0"
                    >
                      <motion.div
                        className={`absolute left-0 top-1 w-8 h-8 rounded-full ${dotClass} border-4 border-white shadow flex items-center justify-center z-10`}
                      >
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </motion.div>

                      <motion.div
                        className={`ml-6 sm:ml-8 p-4 rounded-xl border ${
                          movement.eventType === "geofence_violation"
                            ? "bg-rose-50/80 border-rose-200"
                            : "bg-slate-50/50 border-slate-100"
                        }`}
                      >
                        <motion.div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`rounded-lg font-semibold text-[10px] uppercase tracking-wide ${
                              EVENT_BADGE_CLASS[movement.eventType] || EVENT_BADGE_CLASS.movement
                            }`}
                          >
                            {eventTypeLabel(movement.eventType)}
                          </Badge>
                          {movement.status === "active" && (
                            <Badge className="bg-blue-600 text-white border-0 text-[10px]">
                              {t("deviceMovementHistory.timeline.filters.active")}
                            </Badge>
                          )}
                        </motion.div>

                        <p className="font-semibold text-slate-900 mb-3">{movement.action}</p>

                        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <motion.div className="flex items-center gap-2 text-slate-600 bg-white rounded-lg px-2.5 py-2 border border-slate-100">
                            <User className="h-4 w-4 text-[#8D8DC7] shrink-0" />
                            <span className="truncate">
                              <span className="font-medium text-slate-800">
                                {t("deviceMovementHistory.timeline.details.user")}{" "}
                              </span>
                              {movement.userName || "—"}
                            </span>
                          </motion.div>
                          <motion.div className="flex items-center gap-2 text-slate-600 bg-white rounded-lg px-2.5 py-2 border border-slate-100">
                            <MapPin className="h-4 w-4 text-[#8D8DC7] shrink-0" />
                            <span className="truncate">
                              <span className="font-medium text-slate-800">
                                {t("deviceMovementHistory.timeline.details.location")}{" "}
                              </span>
                              {movement.location}
                            </span>
                          </motion.div>
                          <motion.div className="flex items-center gap-2 text-slate-600 bg-white rounded-lg px-2.5 py-2 border border-slate-100">
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>
                              {format(new Date(movement.timestamp), "h:mm a")} ·{" "}
                              {formatDistanceToNow(new Date(movement.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
