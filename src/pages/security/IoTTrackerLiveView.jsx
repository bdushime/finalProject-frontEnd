import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import MainLayout from "./layout/MainLayout";
import IoTHeader from "./components/iot/IoTHeader";
import IoTStatsCards from "./components/iot/IoTStatsCards";
import IoTFiltersBar from "./components/iot/IoTFiltersBar";
import IoTMapView from "./components/iot/IoTMapView";
import IoTActivityFeed from "./components/iot/IoTActivityFeed";
import IoTFleetStatusCard from "./components/iot/IoTFleetStatusCard";
import { IoTTableSection, TrackerHistoryDialog } from "./components/iot/IoTTableSection";
import api from "@/utils/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getTrackerStatusKind,
  formatLastSeen,
  buildBorrowerMapFromTransactions,
  isValidLastSeen,
  parseTrackerSensors,
  mergeSensorCache,
  enrichTrackersWithSensorSources,
  enrichTrackersWithDisplayLocations,
  buildSensorSeedIndex,
} from "./components/iot/iotUtils";

const MAX_ACTIVITY = 14;
const MAX_ONLINE_CHART_POINTS = 20;
const LOW_BATTERY_THRESHOLD = 30;

export default function SecurityIoTTrackerLiveView() {
  const { t } = useTranslation(["itstaff", "common", "security"]);
  const storageLabel = t("browseDevices.defaultStorage", "Main storage");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map");

  const [selectedTracker, setSelectedTracker] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [lastSeenSnapshots, setLastSeenSnapshots] = useState({});
  const [trackers, setTrackers] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [onlineChartData, setOnlineChartData] = useState([]);
  const [borrowerMap, setBorrowerMap] = useState({ byTag: {}, byName: {} });
  const [page, setPage] = useState(1);

  const prevStatuses = useRef({});
  const prevLowBattery = useRef({});
  const chartPointIndex = useRef(0);
  const sensorCacheRef = useRef({});
  const sensorSeedRef = useRef({});

  const processTrackers = (rawTrackers) => {
    const now = new Date().getTime();
    const TIMEOUT_MS = 15000;

    return rawTrackers.map((t) => {
      const tracker = { ...t };
      if (!isValidLastSeen(tracker.lastSeen)) {
        tracker.lastSeen = null;
      }
      const battery = Number(tracker.battery);
      tracker.battery = Number.isNaN(battery) ? null : battery;

      const tempVal =
        tracker.temperature != null
          ? tracker.temperature
          : parseTrackerSensors(tracker).temperature;
      const humVal =
        tracker.humidity != null
          ? tracker.humidity
          : parseTrackerSensors(tracker).humidity;

      tracker.temperature = mergeSensorCache(
        sensorCacheRef.current,
        tracker.id,
        "temperature",
        tempVal
      );
      tracker.humidity = mergeSensorCache(
        sensorCacheRef.current,
        tracker.id,
        "humidity",
        humVal
      );

      if (tracker.status === "online" && tracker.lastSeen) {
        const lastSeenTime = new Date(tracker.lastSeen).getTime();
        if (now - lastSeenTime > TIMEOUT_MS) {
          tracker.status = "offline";
        }
      } else if (tracker.status === "online" && !tracker.lastSeen) {
        tracker.status = "offline";
      }
      return tracker;
    });
  };

  const pushActivity = useCallback((entry) => {
    setActivityFeed((prev) =>
      [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, at: new Date(), ...entry }, ...prev].slice(
        0,
        MAX_ACTIVITY
      )
    );
  }, []);

  const recordStatusEvents = useCallback(
    (processedTrackers) => {
      processedTrackers.forEach((tItem) => {
        const prev = prevStatuses.current[tItem.id];
        const now = tItem.status;
        const tagLabel = tItem.id;
        const equip = tItem.equipment ? ` · ${tItem.equipment}` : "";

        if (prev === undefined) {
          prevStatuses.current[tItem.id] = now;
          prevLowBattery.current[tItem.id] =
            getTrackerStatusKind(tItem) === "weak";
          return;
        }

        if (prev !== "online" && now === "online") {
          pushActivity({
            type: prev === "offline" ? "reconnect" : "online",
            message: t("iot.activity.reconnected", {
              tag: tagLabel,
              equipment: equip,
              defaultValue: `Tag ${tagLabel} reconnected${equip}`,
            }),
          });
        } else if (prev === "online" && now !== "online") {
          pushActivity({
            type: "offline",
            message: t("iot.activity.offline", {
              tag: tagLabel,
              equipment: equip,
              defaultValue: `Tag ${tagLabel} went offline${equip}`,
            }),
          });
        }

        const isWeak = getTrackerStatusKind(tItem) === "weak";
        const wasWeak = prevLowBattery.current[tItem.id];
        if (isWeak && !wasWeak && now === "online") {
          pushActivity({
            type: "lowBattery",
            message: t("iot.activity.lowBattery", {
              tag: tagLabel,
              battery: tItem.battery,
              defaultValue: `Tag ${tagLabel} low battery (${tItem.battery}%)`,
            }),
          });
        }
        prevLowBattery.current[tItem.id] = isWeak;
        prevStatuses.current[tItem.id] = now;
      });
    },
    [pushActivity, t]
  );

  const updateLastSeenSnapshots = useCallback((processedTrackers) => {
    setLastSeenSnapshots((prev) => {
      const next = { ...prev };
      processedTrackers.forEach((tItem) => {
        if (!isValidLastSeen(tItem.lastSeen)) return;
        const ts = new Date(tItem.lastSeen).getTime();
        const label = formatLastSeen(tItem.lastSeen);
        const arr = next[tItem.id] ? [...next[tItem.id]] : [];
        if (!arr.length || arr[0].ts !== ts) {
          arr.unshift({ ts, label });
          next[tItem.id] = arr.slice(0, 5);
        }
      });
      return next;
    });
  }, []);

  const appendOnlineChartPoint = useCallback((processedTrackers) => {
    const online = processedTrackers.filter((t) => t.status === "online").length;
    chartPointIndex.current += 1;
    const label = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setOnlineChartData((prev) =>
      [...prev, { label, online, key: chartPointIndex.current }].slice(-MAX_ONLINE_CHART_POINTS)
    );
  }, []);

  const fetchRealData = async () => {
    try {
      const [liveRes, activeRes, equipmentRes] = await Promise.all([
        api.get(`/monitoring/live?nocache=${new Date().getTime()}`),
        api.get("/transactions/active").catch(() => ({ data: [] })),
        api.get("/equipment").catch(() => ({ data: [] })),
      ]);

      const activeList = Array.isArray(activeRes.data)
        ? activeRes.data
        : activeRes.data?.data || [];
      setBorrowerMap(buildBorrowerMapFromTransactions(activeList));

      const equipmentList = (
        Array.isArray(equipmentRes.data?.items)
          ? equipmentRes.data.items
          : Array.isArray(equipmentRes.data)
            ? equipmentRes.data
            : equipmentRes.data?.data || equipmentRes.data?.equipment || []
      ).map((d) => ({ ...d, id: d._id || d.id }));

      const rawTrackers =
        liveRes.data?.trackers ?? liveRes.data?.data?.trackers ?? [];

      if (rawTrackers.length) {
        const enriched = enrichTrackersWithSensorSources(rawTrackers, {
          livePayload: liveRes.data,
          equipmentList,
          seedIndex: sensorSeedRef.current,
          activeTransactions: activeList,
        });
        const withLocations = enrichTrackersWithDisplayLocations(enriched, {
          equipmentList,
          activeTransactions: activeList,
          borrowerMap: buildBorrowerMapFromTransactions(activeList),
          storageLabel,
        });
        const processedData = processTrackers(withLocations);
        recordStatusEvents(processedData);
        updateLastSeenSnapshots(processedData);
        appendOnlineChartPoint(processedData);
        setTrackers(processedData);
      }
    } catch (err) {
      console.error("Failed to load IoT data:", err);
    }
  };

  useEffect(() => {
    fetch("/trackers.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        sensorSeedRef.current = buildSensorSeedIndex(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackers.forEach((tItem) => {
      const prev = prevStatuses.current[tItem.id];
      const isNowOffline = tItem.status === "offline";

      if (prev === "online" && isNowOffline) {
        const message = t("iot.alerts.offlineMessage", {
          equipment: tItem.equipment,
          id: tItem.id,
        });

        toast.error(t("iot.alerts.alertPrefix", { message }), {
          duration: 5000,
          icon: "🚨",
        });

        api
          .post("/notifications", {
            title: t("iot.alerts.offlineTitle"),
            message,
            type: "error",
            role: "security",
            relatedId: tItem.id,
          })
          .catch((err) => console.error("Failed to save notification:", err));
      }
    });
  }, [trackers, t]);

  useEffect(() => {
    const generateHistory = (trackerId) => {
      const data = [];
      const now = new Date();
      const tracker = trackers.find((tItem) => tItem.id === trackerId);
      const snapshots = lastSeenSnapshots[trackerId] || [];

      if (snapshots.length > 0) {
        return snapshots.map((s) => ({
          time: new Date(s.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          battery: tracker?.battery ?? 0,
          temperature: tracker?.temperature ?? 24,
          seenLabel: s.label,
        }));
      }

      for (let i = 4; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3 * 60 * 1000);
        if (tracker) {
          data.push({
            time: time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            battery: tracker.battery ?? 0,
            temperature: tracker.temperature ?? 24,
          });
        }
      }
      return data;
    };

    const newHistory = {};
    trackers.forEach((tracker) => {
      newHistory[tracker.id] = generateHistory(tracker.id);
    });
    setHistoryData(newHistory);
  }, [trackers, lastSeenSnapshots]);

  const filteredTrackers = useMemo(() => {
    return trackers.filter((tracker) => {
      const matchesSearch =
        tracker.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracker.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracker.location.toLowerCase().includes(searchQuery.toLowerCase());

      const kind = getTrackerStatusKind(tracker);
      let matchesStatus = true;
      if (statusFilter === "online") {
        matchesStatus = tracker.status === "online";
      } else if (statusFilter === "offline") {
        matchesStatus = tracker.status !== "online";
      } else if (statusFilter === "weak") {
        matchesStatus = kind === "weak";
      }

      return matchesSearch && matchesStatus;
    });
  }, [trackers, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, viewMode]);

  const onlineCount = trackers.filter((tItem) => tItem.status === "online").length;
  const offlineCount = trackers.length - onlineCount;
  const lowBatteryCount = trackers.filter((tItem) => Number(tItem.battery) < LOW_BATTERY_THRESHOLD).length;

  return (
    <MainLayout
      heroContent={
        <div className="space-y-4">
          <IoTHeader />
          <div className="shadow-sm">
            <IoTStatsCards
              totalTrackers={trackers.length}
              onlineCount={onlineCount}
              offlineCount={offlineCount}
              lowBatteryCount={lowBatteryCount}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <IoTFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "map" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <IoTActivityFeed events={activityFeed} trackers={trackers} />
              </div>
              <IoTFleetStatusCard
                trackers={trackers}
                onlineCount={onlineCount}
                offlineCount={offlineCount}
                lowBatteryCount={lowBatteryCount}
              />
            </div>
            <IoTMapView filteredTrackers={filteredTrackers} borrowerMap={borrowerMap} />
          </>
        )}

        {viewMode === "table" && (
          <IoTTableSection
            viewMode={viewMode}
            trackers={trackers}
            filteredTrackers={filteredTrackers}
            setSelectedTracker={setSelectedTracker}
            historyData={historyData}
            lastSeenSnapshots={lastSeenSnapshots}
            borrowerMap={borrowerMap}
            page={page}
            setPage={setPage}
            pageSize={10}
          />
        )}

        <TrackerHistoryDialog
          selectedTracker={selectedTracker}
          onClose={() => setSelectedTracker(null)}
          historyData={historyData}
          borrowerMap={borrowerMap}
        />
      </div>
    </MainLayout>
  );
}
