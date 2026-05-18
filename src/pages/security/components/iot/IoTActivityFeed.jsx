import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Wifi, Bell, Radio } from "lucide-react";
import { formatActivityClock, buildLiveStatusEvents } from "./iotUtils";
import { useTranslation } from "react-i18next";

const EVENT_META = {
  online: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  offline: {
    icon: AlertTriangle,
    iconClass: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  reconnect: {
    icon: Wifi,
    iconClass: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  lowBattery: {
    icon: Bell,
    iconClass: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
};

export default function IoTActivityFeed({ events = [], trackers = [] }) {
  const { t } = useTranslation(["itstaff"]);

  const displayEvents = useMemo(() => {
    if (events.length > 0) return events;
    return buildLiveStatusEvents(trackers, t);
  }, [events, trackers, t]);

  const isLiveSnapshot = events.length === 0 && trackers.length > 0;

  return (
    <Card className="border-slate-200 shadow-sm h-full bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {t("iot.activity.title", "Recent activity")}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {isLiveSnapshot
                ? t("iot.activity.liveSnapshot", "Current status of all tags")
                : t("iot.activity.subtitle", "Live tag events from heartbeat polling")}
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold">
            <Radio className="h-3 w-3 animate-pulse" />
            {t("iot.liveConnection", "Live")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {displayEvents.length === 0 ? (
            <li className="text-sm text-slate-500 py-8 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200">
              {t("iot.activity.empty", "No trackers loaded yet")}
            </li>
          ) : (
            displayEvents.map((ev) => {
              const meta = EVENT_META[ev.type] || EVENT_META.online;
              const Icon = meta.icon;
              return (
                <li
                  key={ev.id}
                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm border ${meta.bg} ${meta.border}`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.iconClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 leading-snug font-medium">{ev.message}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatActivityClock(ev.at)}
                      {isLiveSnapshot && (
                        <span className="ml-1.5 text-slate-400">· {t("iot.activity.now", "now")}</span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
