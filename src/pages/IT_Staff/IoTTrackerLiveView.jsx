import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import IoTHeader from "@/pages/IT_Staff/components/iot/IoTHeader";
import IoTStatsCards from "@/pages/IT_Staff/components/iot/IoTStatsCards";
import IoTFiltersBar from "@/pages/IT_Staff/components/iot/IoTFiltersBar";
import IoTMapView from "@/pages/IT_Staff/components/iot/IoTMapView";
import {
  IoTTableSection,
  TrackerHistoryDialog,
} from "@/pages/IT_Staff/components/iot/IoTTableSection";
import { CAMPUS_ZONES } from "@/pages/IT_Staff/components/iot/iotUtils";

export default function IoTTrackerLiveView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map"); // "map" or "table"
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [trackers, setTrackers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/trackers.json");
        const json = await res.json();

        const formatted = json.map((t) => ({
          ...t,
          lastSeen: new Date(t.lastSeen),
        }));

        setTrackers(formatted);
      } catch (err) {
        console.error("Failed to load tracker data:", err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const generateHistory = (trackerId) => {
      const data = [];
      const now = new Date();
      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3 * 60 * 1000); // Every 3 minutes for last hour
        const tracker = trackers.find((t) => t.id === trackerId);
        if (tracker) {
          data.push({
            time: time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            battery: Math.max(
              0,
              Math.min(100, tracker.battery + (Math.random() - 0.5) * 10)
            ),
            temperature: Math.max(
              20,
              Math.min(35, tracker.temperature + (Math.random() - 0.5) * 3)
            ),
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

  // Simulate real-time updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTrackers((prev) =>
        prev.map((tracker) => {
          // Randomly move to different zones (10% chance)
          let newLocation = tracker.location;
          let newCoords = tracker.coords;
          if (Math.random() < 0.1) {
            const randomZone =
              CAMPUS_ZONES[Math.floor(Math.random() * CAMPUS_ZONES.length)];
            newLocation = randomZone.name;
            newCoords = randomZone.coords;
          }

          // Update battery (slowly decrease, with small random variation)
          const batteryChange = (Math.random() - 0.5) * 2; // -1 to +1
          const newBattery = Math.max(
            0,
            Math.min(100, tracker.battery + batteryChange)
          );

          // Update temperature (with small random variation)
          const tempChange = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75
          const newTemperature = Math.max(
            20,
            Math.min(35, tracker.temperature + tempChange)
          );

          // Update humidity (with small random variation)
          const humidityChange = (Math.random() - 0.5) * 3; // -1.5 to +1.5
          const newHumidity = Math.max(
            40,
            Math.min(80, tracker.humidity + humidityChange)
          );

          // Randomly toggle online/offline (5% chance for online, 2% for offline)
          let newStatus = tracker.status;
          if (tracker.status === "offline" && Math.random() < 0.05) {
            newStatus = "online";
          } else if (tracker.status === "online" && Math.random() < 0.02) {
            newStatus = "offline";
          }

          return {
            ...tracker,
            location: newLocation,
            coords: newCoords,
            battery: Math.round(newBattery * 10) / 10,
            temperature: Math.round(newTemperature * 10) / 10,
            humidity: Math.round(newHumidity * 10) / 10,
            status: newStatus,
            lastSeen: newStatus === "online" ? new Date() : tracker.lastSeen,
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Filter trackers based on search and status
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

  // Reset pagination when filters or view change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, viewMode]);

  const handleSimulateUpdate = () => {
    setTrackers((prev) =>
      prev.map((tracker) => {
        const randomZone =
          CAMPUS_ZONES[Math.floor(Math.random() * CAMPUS_ZONES.length)];
        return {
          ...tracker,
          location: randomZone.name,
          coords: randomZone.coords,
          battery: Math.max(
            0,
            Math.min(100, tracker.battery + (Math.random() - 0.5) * 10)
          ),
          temperature: Math.max(
            20,
            Math.min(35, tracker.temperature + (Math.random() - 0.5) * 2)
          ),
          humidity: Math.max(
            40,
            Math.min(80, tracker.humidity + (Math.random() - 0.5) * 5)
          ),
          lastSeen: new Date(),
        };
      })
    );
  };

  const onlineCount = trackers.filter((t) => t.status === "online").length;
  const offlineCount = trackers.filter((t) => t.status === "offline").length;
  const lowBatteryCount = trackers.filter((t) => t.battery < 30).length;

  return (
    <MainLayout>
      <div className="space-y-6">
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
    </MainLayout>
  );
}
