import { MapPin, Wifi, WifiOff, Battery } from "lucide-react";

export default function IoTStatsCards({
  totalTrackers,
  onlineCount,
  offlineCount,
  lowBatteryCount,
}) {
  const items = [
    {
      label: "Total Trackers",
      value: totalTrackers,
      icon: MapPin,
      colorClass: "text-primary",
    },
    {
      label: "Online",
      value: onlineCount,
      icon: Wifi,
      colorClass: "text-green-500",
    },
    {
      label: "Offline",
      value: offlineCount,
      icon: WifiOff,
      colorClass: "text-red-500",
    },
    {
      label: "Low Battery",
      value: lowBatteryCount,
      icon: Battery,
      colorClass: "text-orange-500",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-6 md:gap-8">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center group cursor-default">
          <div className="flex items-center gap-3 mb-1">
            <item.icon
              className={`w-5 h-5 ${item.colorClass} transition-colors`}
            />
            <span className="text-3xl md:text-4xl font-light text-[#0b1d3a] tracking-tight">
              {item.value}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide pl-7">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}



