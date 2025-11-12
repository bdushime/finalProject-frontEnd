import { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
    Search, 
    RefreshCw, 
    MapPin, 
    Battery, 
    Thermometer, 
    Droplets, 
    Wifi, 
    WifiOff,
    Activity,
    Map as MapIcon,
    List,
    History
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Campus zones for location simulation
const CAMPUS_ZONES = [
    { name: 'Computer Lab A', coords: { lat: -1.945, lng: 30.089 } },
    { name: 'Library Zone', coords: { lat: -1.943, lng: 30.091 } },
    { name: 'Store Room', coords: { lat: -1.946, lng: 30.087 } },
    { name: 'Lecture Hall B', coords: { lat: -1.944, lng: 30.090 } },
    { name: 'Admin Building', coords: { lat: -1.942, lng: 30.092 } },
    { name: 'Workshop Area', coords: { lat: -1.947, lng: 30.088 } },
];

// Initial mock tracker data
const INITIAL_TRACKERS = [
    {
        id: 'TTGO-001',
        equipment: 'MacBook Pro 16"',
        location: 'Computer Lab A',
        coords: { lat: -1.945, lng: 30.089 },
        battery: 82,
        temperature: 27.3,
        humidity: 58,
        status: 'online',
        lastSeen: new Date(),
    },
    {
        id: 'TTGO-002',
        equipment: 'Sony A7 III Camera',
        location: 'Library Zone',
        coords: { lat: -1.943, lng: 30.091 },
        battery: 64,
        temperature: 29.0,
        humidity: 61,
        status: 'online',
        lastSeen: new Date(),
    },
    {
        id: 'TTGO-003',
        equipment: 'Portable Projector',
        location: 'Store Room',
        coords: { lat: -1.946, lng: 30.087 },
        battery: 48,
        temperature: 31.2,
        humidity: 67,
        status: 'offline',
        lastSeen: new Date(Date.now() - 600000),
    },
    {
        id: 'TTGO-004',
        equipment: 'Canon EOS R5',
        location: 'Lecture Hall B',
        coords: { lat: -1.944, lng: 30.090 },
        battery: 91,
        temperature: 25.8,
        humidity: 55,
        status: 'online',
        lastSeen: new Date(),
    },
    {
        id: 'TTGO-005',
        equipment: 'Dell XPS 15',
        location: 'Admin Building',
        coords: { lat: -1.942, lng: 30.092 },
        battery: 35,
        temperature: 28.5,
        humidity: 62,
        status: 'online',
        lastSeen: new Date(),
    },
    {
        id: 'TTGO-006',
        equipment: 'DJI Mavic 3 Drone',
        location: 'Workshop Area',
        coords: { lat: -1.947, lng: 30.088 },
        battery: 72,
        temperature: 26.2,
        humidity: 59,
        status: 'online',
        lastSeen: new Date(),
    },
];

// Helper function to get battery color
const getBatteryColor = (battery) => {
    if (battery >= 70) return "text-green-500";
    if (battery >= 30) return "text-orange-500";
    return "text-red-500";
};

// Helper function to get battery progress color
const getBatteryProgressColor = (battery) => {
    if (battery >= 70) return "bg-green-500";
    if (battery >= 30) return "bg-orange-500";
    return "bg-red-500";
};

// Helper function to get temperature color
const getTemperatureColor = (temp) => {
    if (temp < 20) return "text-blue-500";
    if (temp < 28) return "text-green-500";
    if (temp < 32) return "text-orange-500";
    return "text-red-500";
};

// Helper function to format last seen time
const formatLastSeen = (date) => {
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

export default function IoTTrackerLiveView() {
    const [trackers, setTrackers] = useState(INITIAL_TRACKERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("map"); // "map" or "table"
    const [isSimulating, setIsSimulating] = useState(true);
    const [selectedTracker, setSelectedTracker] = useState(null);
    const [historyData, setHistoryData] = useState({});

    // Generate history data for charts
    useEffect(() => {
        const generateHistory = (trackerId) => {
            const data = [];
            const now = new Date();
            for (let i = 19; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 3 * 60 * 1000); // Every 3 minutes for last hour
                const tracker = trackers.find(t => t.id === trackerId);
                if (tracker) {
                    data.push({
                        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        battery: Math.max(0, Math.min(100, tracker.battery + (Math.random() - 0.5) * 10)),
                        temperature: Math.max(20, Math.min(35, tracker.temperature + (Math.random() - 0.5) * 3)),
                    });
                }
            }
            return data;
        };

        const newHistory = {};
        trackers.forEach(tracker => {
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
                        const randomZone = CAMPUS_ZONES[Math.floor(Math.random() * CAMPUS_ZONES.length)];
                        newLocation = randomZone.name;
                        newCoords = randomZone.coords;
                    }

                    // Update battery (slowly decrease, with small random variation)
                    const batteryChange = (Math.random() - 0.5) * 2; // -1 to +1
                    const newBattery = Math.max(0, Math.min(100, tracker.battery + batteryChange));

                    // Update temperature (with small random variation)
                    const tempChange = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75
                    const newTemperature = Math.max(20, Math.min(35, tracker.temperature + tempChange));

                    // Update humidity (with small random variation)
                    const humidityChange = (Math.random() - 0.5) * 3; // -1.5 to +1.5
                    const newHumidity = Math.max(40, Math.min(80, tracker.humidity + humidityChange));

                    // Randomly toggle online/offline (5% chance for online, 2% for offline)
                    let newStatus = tracker.status;
                    if (tracker.status === 'offline' && Math.random() < 0.05) {
                        newStatus = 'online';
                    } else if (tracker.status === 'online' && Math.random() < 0.02) {
                        newStatus = 'offline';
                    }

                    return {
                        ...tracker,
                        location: newLocation,
                        coords: newCoords,
                        battery: Math.round(newBattery * 10) / 10,
                        temperature: Math.round(newTemperature * 10) / 10,
                        humidity: Math.round(newHumidity * 10) / 10,
                        status: newStatus,
                        lastSeen: newStatus === 'online' ? new Date() : tracker.lastSeen,
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

            const matchesStatus = statusFilter === "all" || tracker.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [trackers, searchQuery, statusFilter]);

    // Calculate map bounds for visualization
    const mapBounds = useMemo(() => {
        if (filteredTrackers.length === 0) return null;
        const lats = filteredTrackers.map((t) => t.coords.lat);
        const lngs = filteredTrackers.map((t) => t.coords.lng);
        return {
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
            minLng: Math.min(...lngs),
            maxLng: Math.max(...lngs),
        };
    }, [filteredTrackers]);

    // Normalize coordinates for map display (0-100%)
    const normalizeCoords = (coords) => {
        if (!mapBounds) return { x: 50, y: 50 };
        const x = ((coords.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng || 1)) * 100;
        const y = ((coords.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat || 1)) * 100;
        return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    };

    const handleSimulateUpdate = () => {
        setTrackers((prev) =>
            prev.map((tracker) => {
                const randomZone = CAMPUS_ZONES[Math.floor(Math.random() * CAMPUS_ZONES.length)];
                return {
                    ...tracker,
                    location: randomZone.name,
                    coords: randomZone.coords,
                    battery: Math.max(0, Math.min(100, tracker.battery + (Math.random() - 0.5) * 10)),
                    temperature: Math.max(20, Math.min(35, tracker.temperature + (Math.random() - 0.5) * 2)),
                    humidity: Math.max(40, Math.min(80, tracker.humidity + (Math.random() - 0.5) * 5)),
                    lastSeen: new Date(),
                };
            })
        );
    };

    const onlineCount = trackers.filter((t) => t.status === 'online').length;
    const offlineCount = trackers.filter((t) => t.status === 'offline').length;
    const lowBatteryCount = trackers.filter((t) => t.battery < 30).length;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">IoT Tracker Live View</h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time monitoring of TTGO/ESP32 trackers across campus
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsSimulating(!isSimulating)}
                            className="flex items-center gap-2"
                        >
                            <Activity className={`h-4 w-4 ${isSimulating ? 'text-green-500 animate-pulse' : ''}`} />
                            {isSimulating ? 'Pause' : 'Resume'}
                        </Button>
                        <Button onClick={handleSimulateUpdate} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Simulate Update
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Trackers</p>
                                    <p className="text-2xl font-bold">{trackers.length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Online</p>
                                    <p className="text-2xl font-bold text-green-500">{onlineCount}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Wifi className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Offline</p>
                                    <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <WifiOff className="h-6 w-6 text-red-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Low Battery</p>
                                    <p className="text-2xl font-bold text-orange-500">{lowBatteryCount}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Battery className="h-6 w-6 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Controls */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="relative flex-1 w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, equipment, or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === "map" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("map")}
                                >
                                    <MapIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "table" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("table")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Map View */}
                {viewMode === "map" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Campus Map View</CardTitle>
                            <CardDescription>
                                Trackers are shown as colored dots. Green = Online, Red = Offline
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border-2 border-border overflow-hidden">
                                {filteredTrackers.map((tracker) => {
                                    const { x, y } = normalizeCoords(tracker.coords);
                                    return (
                                        <div
                                            key={tracker.id}
                                            className="absolute transition-all duration-500 ease-out"
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <div className="relative group">
                                                <div
                                                    className={`h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 shadow-lg ${
                                                        tracker.status === 'online'
                                                            ? 'bg-green-500 animate-pulse'
                                                            : 'bg-red-500'
                                                    }`}
                                                />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="bg-card border border-border rounded-lg px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                                                        <div className="font-semibold">{tracker.equipment}</div>
                                                        <div className="text-muted-foreground">{tracker.id}</div>
                                                        <div className="text-muted-foreground">{tracker.location}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredTrackers.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-muted-foreground">No trackers found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Table View */}
                {viewMode === "table" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracker Details</CardTitle>
                            <CardDescription>
                                Showing {filteredTrackers.length} of {trackers.length} trackers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Equipment</TableHead>
                                            <TableHead>Tracker ID</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Battery</TableHead>
                                            <TableHead>Temperature</TableHead>
                                            <TableHead>Humidity</TableHead>
                                            <TableHead>Last Seen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTrackers.map((tracker) => (
                                            <TableRow 
                                                key={tracker.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedTracker(tracker)}
                                            >
                                                <TableCell className="font-medium">
                                                    {tracker.equipment}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {tracker.id}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {tracker.location}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={tracker.status === 'online' ? 'default' : 'destructive'}
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {tracker.status === 'online' ? (
                                                            <Wifi className="h-3 w-3" />
                                                        ) : (
                                                            <WifiOff className="h-3 w-3" />
                                                        )}
                                                        {tracker.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 min-w-[120px]">
                                                        <Battery className={`h-4 w-4 ${getBatteryColor(tracker.battery)}`} />
                                                        <div className="flex-1">
                                                            <Progress
                                                                value={tracker.battery}
                                                                className="h-2"
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {tracker.battery}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Thermometer className={`h-4 w-4 ${getTemperatureColor(tracker.temperature)}`} />
                                                        <span>{tracker.temperature}°C</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Droplets className="h-4 w-4 text-blue-500" />
                                                        <span>{tracker.humidity}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatLastSeen(tracker.lastSeen)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTracker(tracker);
                                                            }}
                                                        >
                                                            <History className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredTrackers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No trackers found matching your filters
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tracker Cards (Mobile-friendly alternative view) */}
                {viewMode === "table" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
                        {filteredTrackers.map((tracker) => (
                            <Card 
                                key={tracker.id} 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedTracker(tracker)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{tracker.equipment}</CardTitle>
                                            <CardDescription className="mt-1">
                                                <code className="text-xs">{tracker.id}</code>
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={tracker.status === 'online' ? 'default' : 'destructive'}
                                            className="flex items-center gap-1"
                                        >
                                            {tracker.status === 'online' ? (
                                                <Wifi className="h-3 w-3" />
                                            ) : (
                                                <WifiOff className="h-3 w-3" />
                                            )}
                                            {tracker.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{tracker.location}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Battery className={`h-4 w-4 ${getBatteryColor(tracker.battery)}`} />
                                                <span>Battery</span>
                                            </div>
                                            <span className="font-medium">{tracker.battery}%</span>
                                        </div>
                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                                            <div
                                                className={`h-full transition-all ${getBatteryProgressColor(tracker.battery)}`}
                                                style={{ width: `${tracker.battery}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className={`h-4 w-4 ${getTemperatureColor(tracker.temperature)}`} />
                                            <div>
                                                <div className="text-muted-foreground">Temp</div>
                                                <div className="font-medium">{tracker.temperature}°C</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <div className="text-muted-foreground">Humidity</div>
                                                <div className="font-medium">{tracker.humidity}%</div>
                                            </div>
                                        </div>
                                    </div>

                                <div className="pt-2 border-t border-border">
                                    <div className="text-xs text-muted-foreground mb-2">
                                        Last seen: {formatLastSeen(tracker.lastSeen)}
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTracker(tracker);
                                                }}
                                            >
                                                <History className="h-3 w-3 mr-2" />
                                                View History
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Device History - {tracker.equipment}</DialogTitle>
                                                <DialogDescription>
                                                    {tracker.id} • {tracker.location}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Battery & Temperature Trends (Last Hour)</h4>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <LineChart data={historyData[tracker.id] || []}>
                                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                            <XAxis dataKey="time" className="text-xs" tick={{ fill: "currentColor" }} />
                                                            <YAxis yAxisId="left" className="text-xs" tick={{ fill: "currentColor" }} />
                                                            <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: "currentColor" }} />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Line 
                                                                yAxisId="left"
                                                                type="monotone" 
                                                                dataKey="battery" 
                                                                stroke="#3b82f6" 
                                                                strokeWidth={2} 
                                                                name="Battery %" 
                                                                dot={{ r: 3 }} 
                                                            />
                                                            <Line 
                                                                yAxisId="right"
                                                                type="monotone" 
                                                                dataKey="temperature" 
                                                                stroke="#ef4444" 
                                                                strokeWidth={2} 
                                                                name="Temperature °C" 
                                                                dot={{ r: 3 }} 
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Current Battery</p>
                                                        <p className="text-2xl font-bold">{tracker.battery}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Current Temperature</p>
                                                        <p className="text-2xl font-bold">{tracker.temperature}°C</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                )}

                {/* Device History Modal for selected tracker */}
                {selectedTracker && (
                    <Dialog open={!!selectedTracker} onOpenChange={(open) => !open && setSelectedTracker(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Device History - {selectedTracker.equipment}</DialogTitle>
                                <DialogDescription>
                                    {selectedTracker.id} • {selectedTracker.location}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Battery & Temperature Trends (Last Hour)</h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={historyData[selectedTracker.id] || []}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="time" className="text-xs" tick={{ fill: "currentColor" }} />
                                            <YAxis yAxisId="left" className="text-xs" tick={{ fill: "currentColor" }} />
                                            <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: "currentColor" }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                yAxisId="left"
                                                type="monotone" 
                                                dataKey="battery" 
                                                stroke="#3b82f6" 
                                                strokeWidth={2} 
                                                name="Battery %" 
                                                dot={{ r: 3 }} 
                                            />
                                            <Line 
                                                yAxisId="right"
                                                type="monotone" 
                                                dataKey="temperature" 
                                                stroke="#ef4444" 
                                                strokeWidth={2} 
                                                name="Temperature °C" 
                                                dot={{ r: 3 }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Battery</p>
                                        <p className="text-2xl font-bold">{selectedTracker.battery}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Temperature</p>
                                        <p className="text-2xl font-bold">{selectedTracker.temperature}°C</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </MainLayout>
    );
}

