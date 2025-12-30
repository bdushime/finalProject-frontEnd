import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";

const DEFAULT_CENTER = { lat: -1.9445, lng: 30.09 }; // campus center fallback
const DEFAULT_ZOOM = 16;

const onlineIcon = L.divIcon({
  className: "iot-marker iot-marker-online",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const offlineIcon = L.divIcon({
  className: "iot-marker iot-marker-offline",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function IoTMapView({ filteredTrackers, mapHeight = 500, onNavigate }) {
  const center = useMemo(() => {
    if (!filteredTrackers.length) return DEFAULT_CENTER;
    const avgLat =
      filteredTrackers.reduce((sum, t) => sum + t.coords.lat, 0) /
      filteredTrackers.length;
    const avgLng =
      filteredTrackers.reduce((sum, t) => sum + t.coords.lng, 0) /
      filteredTrackers.length;
    return { lat: avgLat, lng: avgLng };
  }, [filteredTrackers]);

  return (
    <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow h-full w-full flex flex-col">
      <CardHeader 
        className={`${onNavigate ? "cursor-pointer" : ""} pb-2 sm:pb-4`}
        onClick={onNavigate}
      >
        <CardTitle className="text-base sm:text-lg font-bold">Campus Map View</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          Trackers are shown on OpenStreetMap. Green = Online, Red = Offline.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div 
          className="w-full rounded-lg overflow-hidden" 
          style={{ height: `${mapHeight}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <MapContainer
            center={center}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredTrackers.map((tracker) => (
              <Marker
                key={tracker.id}
                position={tracker.coords}
                icon={tracker.status === "online" ? onlineIcon : offlineIcon}
              >
                <Popup className="border-gray-200 shadow-sm bg-background rounded-lg">
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">{tracker.equipment}</div>
                    <div className="text-muted-foreground text-xs">
                      {tracker.id}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {tracker.location}
                    </div>
                    <div className="text-xs mt-1">
                      Status:{" "}
                      <span
                        className={
                          tracker.status === "online"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {tracker.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

