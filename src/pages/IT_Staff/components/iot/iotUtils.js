import { formatDistanceToNow } from "date-fns";

// Campus zones for location simulation
export const CAMPUS_ZONES = [
  { name: "Computer Lab A", coords: { lat: -1.945, lng: 30.089 } },
  { name: "Library Zone", coords: { lat: -1.943, lng: 30.091 } },
  { name: "Store Room", coords: { lat: -1.946, lng: 30.087 } },
  { name: "Lecture Hall B", coords: { lat: -1.944, lng: 30.09 } },
  { name: "Admin Building", coords: { lat: -1.942, lng: 30.092 } },
  { name: "Workshop Area", coords: { lat: -1.947, lng: 30.088 } },
];

// Helper function to get battery color
export const getBatteryColor = (battery) => {
  if (battery >= 70) return "text-green-500";
  if (battery >= 30) return "text-orange-500";
  return "text-red-500";
};

// Helper function to get battery progress color
export const getBatteryProgressColor = (battery) => {
  if (battery >= 70) return "bg-green-500";
  if (battery >= 30) return "bg-orange-500";
  return "bg-red-500";
};

// Helper function to get temperature color
export const getTemperatureColor = (temp) => {
  if (temp < 20) return "text-blue-500";
  if (temp < 28) return "text-green-500";
  if (temp < 32) return "text-orange-500";
  return "text-red-500";
};

// Helper function to format last seen time
export const formatLastSeen = (date) => {
  try {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "Unknown";
  }
};


