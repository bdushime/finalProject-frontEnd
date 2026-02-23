import { useState, useEffect, useMemo } from "react";
import { cn } from "@/components/ui/utils";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/pages/security/layout/MainLayout";
import StatCard from "@/components/security/StatCard"; // Ensure this path is correct
import api from "@/utils/api";
import {
  Search,
  Filter,
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
import { format, isSameDay, parseISO } from "date-fns";

// --- UI CONSTANTS ---
const EVENT_TYPE_ICONS = {
  checkout: Package,
  return: CheckCircle,
  violation: AlertTriangle,
  movement: ArrowRight,
};

const EVENT_TYPE_COLORS = {
  checkout: "bg-blue-100 text-blue-700",
  return: "bg-green-100 text-green-700",
  violation: "bg-red-100 text-red-700",
  movement: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS = {
  'Checked Out': "bg-blue-100 text-blue-800 border-blue-200",
  'Returned': "bg-green-100 text-green-800 border-green-200",
  'Overdue': "bg-red-100 text-red-800 border-red-200",
  'Pending': "bg-yellow-100 text-yellow-800 border-yellow-200",
};

import { useTranslation } from "react-i18next";

export default function AccessLogs() {
  const { t } = useTranslation(["security", "common"]);
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBorrowed: 0, totalLost: 0, totalDamaged: 0, totalOverdue: 0 });
  const [allLogs, setAllLogs] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEventType, setFilterEventType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/transactions/security/access-logs');
        setStats(res.data.stats || { totalBorrowed: 0, totalLost: 0, totalDamaged: 0, totalOverdue: 0 });

        // Map Backend Data to Frontend Structure
        const mappedLogs = (res.data.logs || []).map(log => {
          // Determine Event Type based on Status
          let type = 'movement';
          if (log.status === 'Checked Out') type = 'checkout';
          if (log.status === 'Returned') type = 'return';
          if (log.status === 'Overdue') type = 'violation';

          return {
            id: log._id,
            timestamp: log.updatedAt || log.createdAt, // Use update time for returns
            eventType: type,
            status: log.status,
            userName: log.user?.username || "Unknown",
            userId: log.user?.email || "N/A",
            deviceName: log.equipment?.name || "Unknown Item",
            deviceId: log.equipment?.serialNumber || "N/A",
            location: log.destination || "Main Storage", // Using destination as location
            coordinates: { lat: -1.9441, lng: 30.0619 }, // Mock Kigali coords for now
            notes: log.purpose || "No notes provided"
          };
        });

        setAllLogs(mappedLogs);
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredMovements = useMemo(() => {
    let filtered = allLogs;

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.deviceName?.toLowerCase().includes(query) ||
          m.userName?.toLowerCase().includes(query) ||
          m.deviceId?.toLowerCase().includes(query)
      );
    }

    if (filterEventType !== "all") {
      filtered = filtered.filter(m => m.eventType === filterEventType);
    }

    // 3. Date Filter
    if (startDate) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      // Add one day to include end date fully
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter(m => new Date(m.timestamp) < end);
    }

    // 4. Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortBy === "date-desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allLogs, searchQuery, filterEventType, startDate, endDate, sortBy]);

  // Group by Date for Timeline
  const groupedMovements = useMemo(() => {
    const groups = {};
    filteredMovements.forEach((movement) => {
      const dateKey = format(new Date(movement.timestamp), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(movement);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredMovements]);

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Clock className="h-10 w-10 animate-spin text-[#0b1d3a]" />
        </div>
      </MainLayout>
    );
  }

  const HeroSection = (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('accessLogs.title')}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
            {t('accessLogs.subtitle')}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          {/* Action buttons if needed, currently empty to match Admin layout */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-8">
        <StatCard
          title={t('accessLogs.stats.totalBorrowed')}
          value={stats.totalBorrowed.toString()}
          subtext={t('accessLogs.stats.activeLoans')}
          icon={Package}
        />
        <StatCard
          title={t('accessLogs.stats.totalOverdue')}
          value={stats.totalOverdue.toString()}
          subtext={t('accessLogs.stats.needsAction')}
          icon={AlertTriangle}
          isAlert={stats.totalOverdue > 0}
        />
        <StatCard
          title={t('accessLogs.stats.lostItems')}
          value={stats.totalLost.toString()}
          subtext={t('accessLogs.stats.reportedLost')}
          icon={Search}
        />
        <StatCard
          title={t('accessLogs.stats.damagedItems')}
          value={stats.totalDamaged.toString()}
          subtext={t('accessLogs.stats.maintenance')}
          icon={AlertTriangle}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#8D8DC7] transition-colors" />
          <Input
            placeholder={t('accessLogs.filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500 py-7 pl-12 rounded-2xl focus:ring-2 focus:ring-[#8D8DC7]/50 transition-all backdrop-blur-sm shadow-xl"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-800/50 border-slate-700/50 text-white h-full rounded-2xl p-4 sm:p-6 shadow-xl"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-800/50 border-slate-700/50 text-white h-full rounded-2xl p-4 sm:p-6 shadow-xl"
          />
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="space-y-6 mt-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'checkout', 'return', 'violation'].map(type => (
            <Button
              key={type}
              variant={filterEventType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterEventType(type)}
              className={`capitalize rounded-full px-6 py-2 transition-all ${filterEventType === type
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }`}
            >
              {type === 'all' ? t('accessLogs.filters.allActions') : t(`accessLogs.actions.${type}`)}
            </Button>
          ))}
        </div>


        <Card className="border border-gray-100 shadow-sm overflow-hidden bg-white rounded-[2rem]">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-12 gap-4 px-4 sm:px-8 py-4 bg-gray-50/50 border-b border-gray-50 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                <div className="col-span-1">{t('accessLogs.table.event')}</div>
                <div className="col-span-2">{t('accessLogs.table.dateTime')}</div>
                <div className="col-span-3">{t('accessLogs.table.user')}</div>
                <div className="col-span-3">{t('accessLogs.table.device')}</div>
                <div className="col-span-2">{t('accessLogs.table.location')}</div>
                <div className="col-span-1 text-center">{t('accessLogs.table.status')}</div>
              </div>

              <div className="relative min-h-[300px]">
                {groupedMovements.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">{t('accessLogs.table.noLogs')}</div>
                ) : (

                  <div className="divide-y divide-gray-100">
                    {groupedMovements.map(([dateKey, movements]) => (
                      <div key={dateKey}>
                        {/* Date Header */}
                        <div className="bg-slate-50/50 px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                          {format(parseISO(dateKey), "EEEE, MMMM do, yyyy")}
                        </div>

                        {movements.map((log) => {
                          const Icon = EVENT_TYPE_ICONS[log.eventType] || Package;
                          const isExpanded = expandedRow === log.id;

                          return (
                            <div key={log.id}>
                              <div
                                className={`grid grid-cols-12 gap-4 px-4 sm:px-8 py-5 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 border-b border-gray-50/50 group ${isExpanded ? 'bg-[#8D8DC7]/5 shadow-inner' : ''}`}
                                onClick={() => toggleExpand(log.id)}
                              >
                                <div className="col-span-1 flex items-center">
                                  <div className={`p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${EVENT_TYPE_COLORS[log.eventType]}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                </div>
                                <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight flex flex-col justify-center">
                                  <span>{format(new Date(log.timestamp), "h:mm a")}</span>
                                </div>
                                <div className="col-span-3 flex flex-col justify-center">
                                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#8D8DC7] transition-colors">{log.userName}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.userId}</div>
                                </div>
                                <div className="col-span-3 flex flex-col justify-center">
                                  <div className="text-sm font-bold text-slate-700">{log.deviceName}</div>
                                  <div className="text-[10px] font-mono font-bold text-slate-400">{log.deviceId}</div>
                                </div>
                                <div className="col-span-2 flex items-center text-xs font-bold text-slate-500">
                                  <MapPin className="h-3 w-3 mr-1.5 text-[#8D8DC7]" />
                                  <span className="truncate">{log.location}</span>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                  <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border-none shadow-sm shadow-black/5", STATUS_COLORS[log.status] || "bg-gray-100")}>
                                    {log.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 text-sm">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">{t('accessLogs.table.eventDetails')}</h4>
                                      <p><span className="text-gray-500">{t('accessLogs.table.logId')}:</span> {log.id}</p>
                                      <p><span className="text-gray-500">{t('accessLogs.table.fullTime')}:</span> {new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">{t('accessLogs.table.notes')}</h4>
                                      <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                                        {log.notes}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/security/device-movement/${log.deviceId}`)}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-2" /> {t('accessLogs.table.viewDeviceHistory')}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}