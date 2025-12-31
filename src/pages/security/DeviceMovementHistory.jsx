import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DeviceMovementTimeline from "./components/DeviceMovementTimeline";
import { getDeviceMovementHistory, getDeviceMovementStats } from "@/components/lib/movementHistoryData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Activity, AlertTriangle, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function DeviceMovementHistory() {
  const { deviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceName, setDeviceName] = useState("");

  // Get deviceId from URL params or search params
  const effectiveDeviceId = deviceId || searchParams.get("device");

  useEffect(() => {
    if (effectiveDeviceId) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const history = getDeviceMovementHistory(effectiveDeviceId);
        const deviceStats = getDeviceMovementStats(effectiveDeviceId);
        
        // Get device name from movements or use a default
        const firstMovement = history[0];
        const name = firstMovement?.deviceName || getDeviceNameFromId(effectiveDeviceId);
        
        setMovements(history);
        setStats(deviceStats);
        setDeviceName(name);
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  }, [effectiveDeviceId]);

  const getDeviceNameFromId = (id) => {
    const deviceNames = {
      "TTGO-001": "Projector",
      "TTGO-002": "TV Remote",
      "TTGO-003": "Extension Cable",
      "TTGO-004": "TV Remote",
      "TTGO-005": "Apple TV Remote",
      "TTGO-006": "Projector 2",
      "EQ-001": "MacBook Pro 16\"",
      "EQ-002": "Dell XPS 15",
      "EQ-003": "iPad Pro 12.9\"",
      "EQ-004": "Canon EOS R5",
      "EQ-005": "Sony A7III",
    };
    return deviceNames[id] || "Unknown Device";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading movement history...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!effectiveDeviceId) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Device Selected</h3>
              <p className="text-gray-600 mb-4">
                Please select a device to view its movement history.
              </p>
              <Button onClick={() => navigate("/security/BrowseDevices")} variant="outline">
                Browse Devices
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (movements.length === 0 && !loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/security/BrowseDevices")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Movement History</h3>
              <p className="text-gray-600">
                No movement history found for {deviceName} ({effectiveDeviceId}).
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
              onClick={() => navigate("/security/devices")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Device Movement History</h1>
              <p className="text-gray-600 mt-1">
                {deviceName} • {effectiveDeviceId}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {movements.length} Total Events
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Movements</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMovements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Checkouts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.checkouts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Violations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.violations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unique Locations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniqueLocations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Timeline */}
        <DeviceMovementTimeline
          movements={movements}
          deviceName={deviceName}
          deviceId={effectiveDeviceId}
        />
      </div>
    </MainLayout>
  );
}

