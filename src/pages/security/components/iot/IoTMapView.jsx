import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useMemo, useState, useEffect, useCallback } from "react";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import { Navigation, MapPin } from "lucide-react";
import {
  getTrackerStatusKind,
  getTrackerStatusLabel,
  findBorrowerForTracker,
  hasRealTrackerGps,
} from "./iotUtils";

function MapFollowUser({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation?.lat == null || userLocation?.lng == null) return;
    map.flyTo([userLocation.lat, userLocation.lng], 17, { animate: true, duration: 0.6 });
  }, [map, userLocation?.lat, userLocation?.lng]);

  return null;
}

const MARKER_COLORS = {
  online: "#22c55e",
  weak: "#fbbf24",
  offline: "#ef4444",
};

function createTrackerIcon(kind) {
  const color = MARKER_COLORS[kind] || MARKER_COLORS.offline;
  const pulseClass = kind === "online" || kind === "weak" ? "iot-marker-pulse" : "";
  return L.divIcon({
    className: "",
    html: `<div class="iot-marker-dot ${pulseClass}" style="background-color:${color}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div class="iot-user-live-dot" style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.5)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEFAULT_CENTER = { lat: -1.9554801, lng: 30.1042722 };

export default function IoTMapView({
  filteredTrackers,
  borrowerMap,
  mapHeight = 480,
  onNavigate,
}) {
  const { t } = useTranslation(["itstaff"]);
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");

  const applyPosition = useCallback((pos) => {
    setUserLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setGeoStatus("active");
  }, []);

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 }
    );

    return navigator.geolocation.watchPosition(
      applyPosition,
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 25000 }
    );
  }, [applyPosition]);

  useEffect(() => {
    const watchId = startWatchingLocation();
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [startWatchingLocation]);

  const deviceOnMap = useMemo(() => {
    if (!Array.isArray(filteredTrackers)) return null;
    const online = filteredTrackers.filter((tr) => tr?.status === "online");
    const withGps = online.find((tr) => hasRealTrackerGps(tr));
    if (!withGps) return null;
    return {
      ...withGps,
      mapCoords: { lat: Number(withGps.coords.lat), lng: Number(withGps.coords.lng) },
    };
  }, [filteredTrackers]);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

  return (
    <Card className="border border-slate-200 text-gray-900 shadow-md h-full w-full flex flex-col">
      <CardHeader className={`${onNavigate ? "cursor-pointer" : ""} pb-2`} onClick={onNavigate}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">
              {t("iot.map.title")}
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              startWatchingLocation();
            }}
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            {t("iot.map.centerOnMe", "Center on me")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div
          className="w-full rounded-lg overflow-hidden border border-slate-200"
          style={{ height: `${mapHeight}px` }}
        >
          <MapContainer
            center={mapCenter}
            zoom={17}
            minZoom={3}
            maxZoom={19}
            className="w-full h-full"
            scrollWheelZoom
          >
            <MapFollowUser userLocation={userLocation} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
              <>
                {userLocation.accuracy > 0 && userLocation.accuracy < 200 && (
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={userLocation.accuracy}
                    pathOptions={{
                      color: "#2563eb",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.12,
                      weight: 1,
                    }}
                  />
                )}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        {t("iot.map.youAreHere")}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                      </p>
                      {userLocation.accuracy != null && (
                        <p className="text-xs text-slate-400">
                          {t("iot.map.accuracy", "Accuracy")}: ±{Math.round(userLocation.accuracy)}m
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {deviceOnMap && (
              <Marker
                position={[deviceOnMap.mapCoords.lat, deviceOnMap.mapCoords.lng]}
                icon={createTrackerIcon(getTrackerStatusKind(deviceOnMap))}
              >
                <Popup className="min-w-[180px]">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{deviceOnMap.equipment}</p>
                    <p className="text-xs font-mono text-slate-600">{deviceOnMap.id}</p>
                    <p className="text-xs text-slate-500">{deviceOnMap.location}</p>
                    <p className="text-xs flex items-center gap-1.5 pt-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            MARKER_COLORS[getTrackerStatusKind(deviceOnMap)] || MARKER_COLORS.online,
                        }}
                      />
                      {getTrackerStatusLabel(deviceOnMap, t)}
                    </p>
                    {findBorrowerForTracker(deviceOnMap, borrowerMap) && (
                      <p className="text-xs border-t pt-1 mt-1">
                        {t("iot.table.checkedOutBy")}:{" "}
                        <strong>{findBorrowerForTracker(deviceOnMap, borrowerMap).name}</strong>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {geoStatus === "loading" && (
          <p className="text-xs text-blue-600 mt-2 text-center animate-pulse">
            {t("iot.map.locating", "Getting your location…")}
          </p>
        )}
        {geoStatus === "denied" && (
          <p className="text-xs text-amber-700 mt-2 text-center">
            {t(
              "iot.map.locationDenied",
              "Location blocked — click “Center on me” and allow access in your browser."
            )}
          </p>
        )}
        {geoStatus === "unsupported" && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            {t("iot.map.locationUnsupported", "Geolocation is not supported on this device.")}
          </p>
        )}
        {geoStatus === "active" && (
          <p className="text-xs text-emerald-700 mt-2 text-center">
            {t("iot.map.liveActive", "Live — map is tracking your browser location")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
