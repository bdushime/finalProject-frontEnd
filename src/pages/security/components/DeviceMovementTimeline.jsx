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
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import { useTranslation } from "react-i18next";

const EVENT_TYPE_COLORS = {
  checkout: "bg-blue-100 text-blue-700 border-blue-200",
  return: "bg-green-100 text-green-700 border-green-200",
  movement: "bg-gray-100 text-gray-700 border-gray-200",
  geofence_violation: "bg-red-100 text-red-700 border-red-200",
  maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const EVENT_TYPE_ICONS = {
  checkout: Package,
  return: CheckCircle,
  movement: ArrowRight,
  geofence_violation: AlertTriangle,
  maintenance: Package,
};

export default function DeviceMovementTimeline({ movements, deviceName, deviceId }) {
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
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(movement);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredMovements]);

  const getEventIcon = (eventType) => {
    const Icon = EVENT_TYPE_ICONS[eventType] || Package;
    return <Icon className="h-4 w-4" />;
  };

  const getEventColor = (eventType, severity) => {
    if (eventType === "geofence_violation") {
      return severity === "critical"
        ? "bg-red-500"
        : severity === "high"
          ? "bg-orange-500"
          : "bg-yellow-500";
    }
    return EVENT_TYPE_COLORS[eventType] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t('deviceMovementHistory.timeline.filters.label')}</span>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('deviceMovementHistory.timeline.filters.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('deviceMovementHistory.timeline.filters.allEvents')}</SelectItem>
            <SelectItem value="checkout">{t('deviceMovementHistory.timeline.filters.checkouts')}</SelectItem>
            <SelectItem value="return">{t('deviceMovementHistory.timeline.filters.returns')}</SelectItem>
            <SelectItem value="movement">{t('deviceMovementHistory.timeline.filters.movements')}</SelectItem>
            <SelectItem value="geofence_violation">{t('deviceMovementHistory.timeline.filters.violations')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('deviceMovementHistory.timeline.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('deviceMovementHistory.timeline.filters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('deviceMovementHistory.timeline.filters.active')}</SelectItem>
            <SelectItem value="completed">{t('deviceMovementHistory.timeline.filters.completed')}</SelectItem>
            <SelectItem value="violation">{t('deviceMovementHistory.timeline.filters.violations')}</SelectItem>
            <SelectItem value="resolved">{t('deviceMovementHistory.timeline.filters.resolved')}</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('deviceMovementHistory.timeline.filters.export')}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {groupedMovements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t('deviceMovementHistory.timeline.empty')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMovements.map(([date, dayMovements]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-gray-50 py-3 px-4 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <Badge variant="outline" className="ml-2">
                    {dayMovements.length} {dayMovements.length !== 1 ? t('deviceMovementHistory.timeline.events') : t('deviceMovementHistory.timeline.event')}
                  </Badge>
                </div>
              </div>

              {/* Timeline Events */}
              <div className="bg-white rounded-b-lg border-x border-b border-gray-200">
                <div className="relative pl-8 py-4">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                  {dayMovements.map((movement, index) => {
                    const isLast = index === dayMovements.length - 1;
                    const Icon = EVENT_TYPE_ICONS[movement.eventType] || Package;
                    const dotColor = getEventColor(movement.eventType, movement.severity);

                    return (
                      <motion.div
                        key={movement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pb-6 last:pb-0"
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-0 top-1.5 w-8 h-8 rounded-full ${dotColor} border-4 border-white shadow-md flex items-center justify-center z-10`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>

                        {/* Content Card */}
                        <div
                          className={`ml-12 p-4 rounded-lg border ${movement.eventType === "geofence_violation"
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-200"
                            } hover:shadow-md transition-shadow`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={EVENT_TYPE_COLORS[movement.eventType] || ""}
                                >
                                  {(t(`deviceMovementHistory.timeline.filters.${movement.eventType === 'geofence_violation' ? 'violations' : movement.eventType}s`) || movement.eventType).toUpperCase()}
                                </Badge>
                                {movement.severity && (
                                  <Badge
                                    variant="outline"
                                    className={
                                      movement.severity === "critical"
                                        ? "bg-red-100 text-red-700 border-red-200"
                                        : "bg-orange-100 text-orange-700 border-orange-200"
                                    }
                                  >
                                    {movement.severity.toUpperCase()}
                                  </Badge>
                                )}
                              </div>

                              <p className="font-medium text-gray-900 mb-2">{movement.action}</p>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <span>
                                    <strong>{t('deviceMovementHistory.timeline.details.location')}</strong> {movement.location}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>
                                    {format(new Date(movement.timestamp), "h:mm a")} •{" "}
                                    {formatDistanceToNow(new Date(movement.timestamp), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>

                                {movement.userName && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span>
                                      <strong>{t('deviceMovementHistory.timeline.details.user')}</strong> {movement.userName}
                                    </span>
                                  </div>
                                )}

                                {movement.duration && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {t('deviceMovementHistory.timeline.details.duration')} {movement.duration}
                                  </div>
                                )}

                                {movement.coordinates && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {t('deviceMovementHistory.timeline.details.coordinates')} {movement.coordinates.lat.toFixed(4)},{" "}
                                    {movement.coordinates.lng.toFixed(4)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">{t('deviceMovementHistory.timeline.filters.allEvents')}</div>
          <div className="text-2xl font-bold text-gray-900">{filteredMovements.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">{t('deviceMovementHistory.timeline.filters.checkouts')}</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredMovements.filter((m) => m.eventType === "checkout").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">{t('deviceMovementHistory.timeline.filters.returns')}</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredMovements.filter((m) => m.eventType === "return").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">{t('deviceMovementHistory.timeline.filters.violations')}</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredMovements.filter((m) => m.eventType === "geofence_violation").length}
          </div>
        </div>
      </div>
    </div>
  );
}

