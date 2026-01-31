import { useState, useEffect, useMemo } from "react";
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

export default function IoTTrackerLiveView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map"); 
  
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [trackers, setTrackers] = useState([]);
  const [page, setPage] = useState(1);

  // =========================================================
  // 1. FETCH REAL DATA (From Monitoring Route)
  // =========================================================
  const fetchRealData = async () => {
    try {
      // 👇 Use the specific monitoring endpoint
      const res = await api.get('/monitoring/live'); 

      if (res.data && res.data.trackers) {
          setTrackers(res.data.trackers);
      }
    } catch (err) {
      console.error("Failed to load IoT data:", err);
    }
  };

  useEffect(() => {
    fetchRealData(); 
    const interval = setInterval(fetchRealData, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // 2. SIMULATE BUTTON LOGIC (Fixed)
  // =========================================================
  const handleSimulateUpdate = async () => {
    setIsSimulating(true);
    try {
        // 👇 Triggers backend update
        await api.post('/monitoring/simulate');
        
        toast.success("Tracker Ping Received!");
        
        // 👇 Fetches updated status immediately
        await fetchRealData(); 
    } catch (err) {
        console.error("Simulation Failed", err);
        toast.error("Simulation Failed");
    } finally {
        setIsSimulating(false);
    }
  };

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
        statusFilter === "all" || tracker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trackers, searchQuery, statusFilter]);

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, viewMode]);

  const onlineCount = trackers.filter((t) => t.status === "online").length;
  const offlineCount = trackers.filter((t) => t.status === "offline").length;
  const lowBatteryCount = trackers.filter((t) => t.battery < 30).length;

  return (
    <ITStaffLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <IoTHeader
          isSimulating={isSimulating}
          onToggleSimulating={() => setIsSimulating((v) => !v)}
          onSimulateUpdate={handleSimulateUpdate}
        />

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