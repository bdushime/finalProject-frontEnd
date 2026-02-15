import { useState, useEffect, useMemo, useRef } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import IoTHeader from "@/pages/IT_Staff/components/iot/IoTHeader";
import IoTStatsCards from "@/pages/IT_Staff/components/iot/IoTStatsCards";
import IoTFiltersBar from "@/pages/IT_Staff/components/iot/IoTFiltersBar";
import IoTMapView from "@/pages/IT_Staff/components/iot/IoTMapView";
import {
  IoTTableSection,
  TrackerHistoryDialog,
} from "@/pages/IT_Staff/components/iot/IoTTableSection";
import api from "@/utils/api";
import { toast } from "sonner"; // Assuming you have sonner installed, optional

import { useTranslation } from "react-i18next";

export default function IoTTrackerLiveView() {
  const { t } = useTranslation(["itstaff", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map");



  const [selectedTracker, setSelectedTracker] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [trackers, setTrackers] = useState([]);
  const [page, setPage] = useState(1);

  // =========================================================
  // 1. FETCH REAL DATA (From Monitoring Route)
  // =========================================================
  /* 
     STRICT LIVE LOGIC: 
     Backend might be slow to timeout (e.g. 1 min). 
     We enforce a 15-second "Heartbeat Check".
     If 'online' but no data for >15s, force to 'offline'.
  */
  const processTrackers = (rawTrackers) => {
    const now = new Date().getTime();
    const TIMEOUT_MS = 15000; // 15 seconds allowed silence

    return rawTrackers.map(t => {
      // Create a copy to avoid mutating state directly if using objects
      const tracker = { ...t };

      if (tracker.status === 'online' && tracker.lastSeen) {
        const lastSeenTime = new Date(tracker.lastSeen).getTime();
        const diff = now - lastSeenTime;

        // If silent for too long, FORCE offline
        if (diff > TIMEOUT_MS) {
          tracker.status = 'offline';
        }
      }
      return tracker;
    });
  };

  const fetchRealData = async () => {
    try {
      // 👇 Use the specific monitoring endpoint, add cache busting
      const res = await api.get(`/monitoring/live?nocache=${new Date().getTime()}`);

      if (res.data && res.data.trackers) {
        // Apply our strict frontend timeout rule
        const processedData = processTrackers(res.data.trackers);
        setTrackers(processedData);
      }
    } catch (err) {
      console.error("Failed to load IoT data:", err);
    }
  };

  // Track previous states to detect changes
  const prevStatuses = useRef({});

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 2000); // Polling every 2s for live feel
    return () => clearInterval(interval);
  }, []);

  // --- 3. NOTIFICATION LOGIC ---
  useEffect(() => {
    trackers.forEach(t => {
      const prev = prevStatuses.current[t.id];
      const isNowOffline = t.status === 'offline';

      // If was online (or unknown) and NOW is offline, trigger alert
      // We only alert if we specifically knew it was 'online' before to avoid spam on load
      if (prev === 'online' && isNowOffline) {
        const message = t('iot.alerts.offlineMessage', { equipment: t.equipment, id: t.id });

        // 1. Show Visual Toast
        toast.error(t('iot.alerts.alertPrefix', { message }), {
          duration: 5000,
          icon: '🚨'
        });

        // 2. Persist to Backend (Fire and Forget)
        api.post('/notifications', {
          title: t('iot.alerts.offlineTitle'),
          message: message,
          type: "error", // red icon in list
          role: "it_staff",
          relatedId: t.id
        }).catch(err => console.error("Failed to save notification:", err));
      }

      // Update ref
      prevStatuses.current[t.id] = t.status;
    });
  }, [trackers]);

  // =========================================================
  // 2. SIMULATE BUTTON LOGIC (Fixed)
  // =========================================================


  // ... (History Logic - Visual Only) ...
  useEffect(() => {
    const generateHistory = (trackerId) => {
      const data = [];
      const now = new Date();
      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3 * 60 * 1000);
        const tracker = trackers.find((t) => t.id === trackerId);
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

  // ... (Filtering Logic) ...
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

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, viewMode]);

  const onlineCount = trackers.filter((t) => t.status === "online").length;
  // ROBUST: Treat anything not "online" (e.g. "lost", "maintenance", "offline") as Offline
  const offlineCount = trackers.length - onlineCount;
  const lowBatteryCount = trackers.filter((t) => t.battery < 30).length;

  return (
    <ITStaffLayout>
      <div className="space-y-6">
        <IoTHeader />

        <IoTStatsCards
          totalTrackers={trackers.length}
          onlineCount={onlineCount}
          offlineCount={offlineCount}
          lowBatteryCount={lowBatteryCount}
        />

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
    </ITStaffLayout>
  );
}