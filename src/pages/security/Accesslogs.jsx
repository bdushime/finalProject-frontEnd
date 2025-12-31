import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import {
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getAllDeviceMovements } from "@/components/lib/movementHistoryData";
import { format, formatDistanceToNow, isSameDay, parseISO } from "date-fns";

const EVENT_TYPE_COLORS = {
  checkout: "bg-blue-100 text-blue-700 border-blue-200",
  return: "bg-green-100 text-green-700 border-green-200",
  movement: "bg-gray-100 text-gray-700 border-gray-200",
  geofence_violation: "bg-red-100 text-red-700 border-red-200",
  maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const EVENT_TYPE_ICONS = {
  checkout: Package,
  return: CheckCircle,
  movement: ArrowRight,
  geofence_violation: AlertTriangle,
  maintenance: Package,
};

const STATUS_COLORS = {
  active: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200", // Changed to match resolved styling
  violation: "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Accesslogs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDevice, setFilterDevice] = useState(
    searchParams.get("device") || "all"
  );
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [allMovements, setAllMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filters = {
        deviceId: filterDevice !== "all" ? filterDevice : undefined,
        eventType: filterEventType !== "all" ? filterEventType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const movements = getAllDeviceMovements(filters);
      setAllMovements(movements);
      setLoading(false);
    }, 500);
  }, [filterDevice, filterEventType, filterStatus, startDate, endDate]);

  const filteredMovements = useMemo(() => {
    let filtered = allMovements;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (movement) =>
          movement.deviceName?.toLowerCase().includes(query) ||
          movement.deviceId?.toLowerCase().includes(query) ||
          movement.location?.toLowerCase().includes(query) ||
          movement.userName?.toLowerCase().includes(query) ||
          movement.action?.toLowerCase().includes(query)
      );
    }

    // Sort movements
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      if (sortBy === "date-desc") return dateB - dateA;
      if (sortBy === "date-asc") return dateA - dateB;
      return 0;
    });

    return filtered;
  }, [allMovements, searchQuery, sortBy]);

  // Group movements by date
  const groupedMovements = useMemo(() => {
    const groups = {};
    filteredMovements.forEach((movement) => {
      const dateKey = format(new Date(movement.timestamp), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(movement);
    });
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  }, [filteredMovements]);

  const getEventIcon = (eventType) => {
    const Icon = EVENT_TYPE_ICONS[eventType] || Package;
    return <Icon className="h-4 w-4" />;
  };

  const handleViewDevice = (deviceId) => {
    navigate(`/security/device-movement/${deviceId}`);
  };

  const toggleExpand = (movementId) => {
    setExpandedRow(expandedRow === movementId ? null : movementId);
  };

  const stats = useMemo(() => {
    return {
      total: filteredMovements.length,
      checkouts: filteredMovements.filter((m) => m.eventType === "checkout")
        .length,
      returns: filteredMovements.filter((m) => m.eventType === "return").length,
      violations: filteredMovements.filter(
        (m) => m.eventType === "geofence_violation"
      ).length,
    };
  }, [filteredMovements]);

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading access logs...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}

        {/* Filters Section */}
        <Card className="border border-gray-200">
          <CardContent className="p-4 space-y-4">
            {/* Search and Date Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 font-semibold whitespace-nowrap">
                    Filter with date:
                  </label>
                  <div className="relative">
                    {/* <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className=" border border-gray-300 rounded-lg shadow-sm"
                      placeholder="Start date"
                    />
                  </div>
                  <div className="relative">
                    {/* <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className=" border border-gray-300 rounded-lg shadow-sm"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Type and Status Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Event Type:
              </span>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "checkout", label: "Checkouts", icon: Package, color: "green-500" },
                  { value: "return", label: "Returns", icon: CheckCircle, color: "blue-900" },
                  { value: "movement", label: "Movements", icon: ArrowRight, color: "yellow-500" },
                  {
                    value: "geofence_violation",
                    label: "Violations",
                    icon: AlertTriangle,
                    color: "red-500",
                  },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = filterEventType === type.value;
                  return (
                    <Button
                      key={type.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterEventType(type.value)}
                      className={
                      isActive ? "bg-[#0b1d3a] text-white hover:bg-[#0b1d3a]/90 cursor-pointer border border-gray-300 rounded-lg shadow-sm" : "border border-gray-300 rounded-lg shadow-sm"
                      }
                    >
                      {Icon && <Icon className={`h-5 w-5 bg-${type.color} rounded-lg p-1`} />}
                      <span >{type.label}</span>
                    </Button>
                  );
                })}
              </div>

              <span className="text-sm font-medium text-gray-700 ml-4">
                Status:
              </span>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Resolved" },
                  { value: "violation", label: "Unresolved" },
                ].map((status) => {
                  const isActive = filterStatus === status.value;
                  return (
                    <Button
                      key={status.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status.value)}
                      className={
                        isActive ? "bg-[#0b1d3a] text-white hover:bg-[#0b1d3a]/90 cursor-pointer border border-gray-300 rounded-lg shadow-sm" : "border border-gray-300 rounded-lg shadow-sm"
                      }
                    >
                      {status.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredMovements.length}
                </span>{" "}
                Results
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sorting by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline and Logs */}
        <Card className="border border-gray-200">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-14 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
              <div className="col-span-1 text-center">Event</div>
              <div className="col-span-1 text-center">ID</div>
              <div className="col-span-2 text-center">Date</div>
              <div className="col-span-1 text-center">Time</div>
              <div className="col-span-2 text-center">Duration</div>
              <div className="col-span-2 text-center">User - ID</div>
              <div className="col-span-3 text-center">Location</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Timeline and Logs Content */}
            <div className="relative">
              {groupedMovements.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No logs found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300" />

                  {/* Logs List */}
                  <div className="space-y-0">
                    {groupedMovements.map(([dateKey, movements]) => {
                      const date = parseISO(dateKey);
                      const dateFormatted = format(date, "dd.MM.yyyy");
                      const isToday = isSameDay(date, new Date());
                      const isFirstOfMonth = date.getDate() === 1;

                      return (
                        <div key={dateKey} className="relative">
                          {/* Date Marker */}
                          <div className="relative flex items-center py-4 px-6 bg-gray-50/50 border-b border-gray-200">
                            <div className="absolute left-6 transform -translate-x-1/2 z-10">
                              <div className="w-4 h-4 rounded-full bg-[#0b1d3a] border-2 border-white shadow-md" />
                            </div>
                            <div className="ml-12">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {isToday ? "Today" : dateFormatted}
                                </span>
                                {isFirstOfMonth && (
                                  <span className="text-xs text-gray-500 font-normal">
                                    ({format(date, "MMMM yyyy")})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Movements for this date */}
                          {movements.map((movement, idx) => {
                            const isExpanded = expandedRow === movement.id;
                            const Icon =
                              EVENT_TYPE_ICONS[movement.eventType] || Package;
                            const timestamp = new Date(movement.timestamp);

                            return (
                              <div key={movement.id}>
                                {/* Main Row */}
                                <div
                                  className={`grid grid-cols-14 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer ${
                                    isExpanded ? "bg-blue-50" : ""
                                  }`}
                                  onClick={() => toggleExpand(movement.id)}
                                >
                                  {/* Timeline Dot */}
                                  <div className="absolute left-6 transform -translate-x-1/2 z-10">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white" />
                                  </div>

                                  {/* Event Icon */}
                                  <div className=" flex items-center">
                                    <div
                                      className={`p-2 rounded-lg ${
                                        EVENT_TYPE_COLORS[movement.eventType] ||
                                        "bg-gray-100"
                                      }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                  </div>

                                  {/* ID */}
                                  <div className=" col-span-1 flex items-center justify-center">
                                    <span className="font-medium text-gray-900">
                                      {movement.id}
                                    </span>
                                  </div>

                                  {/* Date */}
                                  <div className=" col-span-2 flex items-center justify-center text-sm text-gray-700">
                                    {format(timestamp, "dd.MMMM yyyy")}
                                  </div>

                                  {/* Time */}
                                  <div className=" col-span-1 flex items-center justify-center text-sm text-gray-600">
                                    {format(timestamp, "h:mm a")}
                                  </div>

                                  {/* Duration */}
                                  <div className=" col-span-2 flex items-center justify-center text-sm text-gray-600">
                                    {formatDuration(movement.duration)}
                                  </div>

                                  {/* User */}
                                  <div className=" col-span-2 flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {movement.userName || "System"}
                                        </div>
                                        {movement.userId && (
                                          <div className="text-xs text-gray-500">
                                            {movement.userId}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Location */}
                                  <div className=" col-span-3 flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-700 truncate">
                                        {movement.location}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div className=" col-span-2 flex items-center justify-center">
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        STATUS_COLORS[movement.status] ||
                                        "bg-gray-100 text-gray-700"
                                      } flex items-center gap-1`}
                                    >
                                      {movement.status === "completed" ||
                                      movement.status === "resolved"
                                        ? "Resolved"
                                        : movement.status === "violation"
                                        ? "Unresolved"
                                        : movement.status === "active"
                                        ? "In use"
                                        : movement.status
                                            ?.charAt(0)
                                            .toUpperCase() +
                                          movement.status?.slice(1)}
                                      {isExpanded ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="bg-blue-50/50 border-b border-gray-200 px-6 py-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                      {/* Movement Details */}
                                      <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">
                                          Movement Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-gray-600">
                                              Event Type:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900">
                                              {movement.eventType
                                                .replace(/_/g, " ")
                                                .toUpperCase()}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">
                                              Action:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900">
                                              {movement.action}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">
                                              Device:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900">
                                              {movement.deviceName} (
                                              {movement.deviceId})
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">
                                              Start Time:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900">
                                              {format(
                                                timestamp,
                                                "dd.MMMM yyyy, h:mm:ss a"
                                              )}
                                            </span>
                                          </div>
                                          {movement.duration && (
                                            <div>
                                              <span className="text-gray-600">
                                                Duration:
                                              </span>
                                              <span className="ml-2 font-medium text-gray-900">
                                                {movement.duration}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Location & Coordinates */}
                                      <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">
                                          Location Information
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-gray-600">
                                              Current Location:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900">
                                              {movement.location}
                                            </span>
                                          </div>
                                          {movement.coordinates && (
                                            <div>
                                              <span className="text-gray-600">
                                                Coordinates:
                                              </span>
                                              <span className="ml-2 font-medium text-gray-900">
                                                {movement.coordinates.lat.toFixed(
                                                  4
                                                )}
                                                ,{" "}
                                                {movement.coordinates.lng.toFixed(
                                                  4
                                                )}
                                              </span>
                                            </div>
                                          )}
                                          {movement.severity && (
                                            <div>
                                              <span className="text-gray-600">
                                                Severity:
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className={`ml-2 ${
                                                  movement.severity ===
                                                  "critical"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-orange-100 text-orange-700"
                                                }`}
                                              >
                                                {movement.severity.toUpperCase()}
                                              </Badge>
                                            </div>
                                          )}
                                          <div className="pt-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDevice(
                                                  movement.deviceId
                                                );
                                              }}
                                              className="flex items-center gap-2"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                              View Full History
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Notes Section */}
                                      <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">
                                          Notes
                                        </h4>
                                        <Textarea
                                          placeholder="Add notes about this movement event..."
                                          className="min-h-[100px] resize-none"
                                          defaultValue={movement.notes || ""}
                                        />
                                        <div className="text-xs text-gray-500">
                                          Updated:{" "}
                                          {format(
                                            new Date(),
                                            "dd.MMMM yyyy, h:mm:ss a"
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
