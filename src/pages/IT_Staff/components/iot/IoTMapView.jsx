import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import { useTranslation } from "react-i18next";

// Helper to auto-center map
// Helper to auto-center map
function ChangeView({ center, zoom, bounds }) {
  const map = useMap();
  if (bounds) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  } else {
    map.setView(center, zoom);
  }
  return null;
}

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
  const { t } = useTranslation(["itstaff"]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  // STRICT SAFETY: Filter invalid trackers immediately
  const validTrackers = useMemo(() => {
    if (!Array.isArray(filteredTrackers)) return [];
    return filteredTrackers.filter(t => {
      if (!t || !t.id || !t.coords) return false;
      const lat = Number(t.coords.lat);
      const lng = Number(t.coords.lng);
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [filteredTrackers]);

  const center = useMemo(() => {
    // 1. If we have user location, Center on YOU (500m logic)
    if (userLocation) return userLocation;

    // 2. Otherwise center on average of devices
    if (!validTrackers.length) return DEFAULT_CENTER;
    const totalLat = validTrackers.reduce((sum, t) => sum + Number(t.coords.lat), 0);
    const totalLng = validTrackers.reduce((sum, t) => sum + Number(t.coords.lng), 0);
    return {
      lat: totalLat / validTrackers.length,
      lng: totalLng / validTrackers.length
    };
  }, [userLocation, validTrackers]);

  // Calculate Bounds to fit EVERYTHING (User + Trackers)
  const bounds = useMemo(() => {
    if (!validTrackers.length && !userLocation) return null;

    const points = validTrackers.map(t => [Number(t.coords.lat), Number(t.coords.lng)]);
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length === 0) return null;
    return L.latLngBounds(points);
  }, [userLocation, validTrackers]);

  // Higher zoom when tracking user (approx 500m view)
  const activeZoom = userLocation ? 15 : DEFAULT_ZOOM;

  const showDataWarning = filteredTrackers.length > 0 && validTrackers.length === 0;

  return (
    <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow h-full w-full flex flex-col relative">
      {showDataWarning && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-sm text-xs font-bold">
          {t('iot.map.warningNoGps', { count: filteredTrackers.length })}
        </div>
      )}
      <CardHeader
        className={`${onNavigate ? "cursor-pointer" : ""} pb-2 sm:pb-4`}
        onClick={onNavigate}
      >
        <CardTitle className="text-base sm:text-lg font-bold">{t('iot.map.title')}</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          {t('iot.map.desc')}
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
            zoom={activeZoom}
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <ChangeView center={center} zoom={activeZoom} bounds={bounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
              <CircleMarker
                center={userLocation}
                radius={8}
                pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
              >
                <Popup>{t('iot.map.youAreHere')}</Popup>
              </CircleMarker>
            )}

            {validTrackers.map((tracker) => (
              <Marker
                key={tracker.id}
                position={{ lat: Number(tracker.coords.lat), lng: Number(tracker.coords.lng) }}
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
                      {t('iot.map.status')}{" "}
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
    </Card >
  );
}


