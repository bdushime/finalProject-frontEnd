import { useState, useEffect, useMemo, useRef } from "react";
import MainLayout from "./layout/MainLayout";
import IoTHeader from "./components/iot/IoTHeader";
import IoTStatsCards from "./components/iot/IoTStatsCards";
import IoTFiltersBar from "./components/iot/IoTFiltersBar";
import IoTMapView from "./components/iot/IoTMapView";
import { IoTTableSection, TrackerHistoryDialog } from "./components/iot/IoTTableSection";
import api from "@/utils/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function SecurityIoTTrackerLiveView() {
  const { t } = useTranslation(["itstaff", "common"]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map");

  const [selectedTracker, setSelectedTracker] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [trackers, setTrackers] = useState([]);
  const [page, setPage] = useState(1);

  const processTrackers = (rawTrackers) => {
    const now = new Date().getTime();
    const TIMEOUT_MS = 15000; 

    return rawTrackers.map((t) => {
      const tracker = { ...t };

      if (tracker.status === "online" && tracker.lastSeen) {
        const lastSeenTime = new Date(tracker.lastSeen).getTime();
        const diff = now - lastSeenTime;

        // If silent for too long, FORCE offline
        if (diff > TIMEOUT_MS) {
          tracker.status = "offline";
        }
      }

      return tracker;
    });
  };

  const fetchRealData = async () => {
    try {
      const res = await api.get(`/monitoring/live?nocache=${new Date().getTime()}`);

      if (res.data && res.data.trackers) {
        const processedData = processTrackers(res.data.trackers);
        setTrackers(processedData);
      }
    } catch (err) {
      console.error("Failed to load IoT data:", err);
    }
  };

  // Poll live data
  const prevStatuses = useRef({});
  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 2000); // Polling every 2s for live feel
    return () => clearInterval(interval);
  }, []);

  // --- 3. NOTIFICATION LOGIC ---
  // Creates backend notifications for Security when devices go offline.
  useEffect(() => {
    trackers.forEach((tItem) => {
      const prev = prevStatuses.current[tItem.id];
      const isNowOffline = tItem.status === "offline";

      // Avoid spamming on initial load by only alerting when we knew it was online before.
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
          .catch((err) =>
            console.error("Failed to save notification:", err)
          );
      }

      prevStatuses.current[tItem.id] = tItem.status;
    });
  }, [trackers, t]);

  // =========================================================
  // 2. SIMULATE BUTTON LOGIC (History / Visual only)
  // =========================================================
  useEffect(() => {
    const generateHistory = (trackerId) => {
      const data = [];
      const now = new Date();

      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3 * 60 * 1000);
        const tracker = trackers.find((tItem) => tItem.id === trackerId);

        if (tracker) {
          data.push({
            time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            battery: Math.max(0, Math.min(100, (tracker.battery || 100) + (Math.random() - 0.5) * 5)),
            temperature: 24 + (Math.random() - 0.5),
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
  }, [trackers]);

  // --- Filtering Logic ---
  const filteredTrackers = useMemo(() => {
    return trackers.filter((tracker) => {
      const matchesSearch =
        tracker.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracker.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracker.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && tracker.status === "online") ||
        (statusFilter === "offline" && tracker.status !== "online");

      return matchesSearch && matchesStatus;
    });
  }, [trackers, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, viewMode]);

  const onlineCount = trackers.filter((tItem) => tItem.status === "online").length;
  const offlineCount = trackers.length - onlineCount;
  const lowBatteryCount = trackers.filter((tItem) => tItem.battery < 30).length;

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
          <IoTMapView filteredTrackers={filteredTrackers} />
        )}

        <IoTTableSection
          viewMode={viewMode}
          trackers={trackers}
          filteredTrackers={filteredTrackers}
          setSelectedTracker={setSelectedTracker}
          historyData={historyData}
          page={page}
          setPage={setPage}
          pageSize={10}
        />

        <TrackerHistoryDialog
          selectedTracker={selectedTracker}
          onClose={() => setSelectedTracker(null)}
          historyData={historyData}
        />
      </div>
    </MainLayout>
  );
}

