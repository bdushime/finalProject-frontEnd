import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, Download, RefreshCw, Filter, Loader2 } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/common/PaginationControls";
import { generateReportData, exportToCSV } from "@/pages/IT_Staff/reports/reportService";
import { generatePDF } from "@/utils/pdfGenerator";
import api from "@/utils/api";
import PropTypes from "prop-types";
import { toast } from "sonner";

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

const EQUIPMENT_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "LENT", label: "Lent" },
  { value: "RESERVED", label: "Reserved" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "LOST", label: "Lost" },
];

const LOG_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "violation", label: "Violation" },
  { value: "resolved", label: "Resolved" },
];

const EVENT_TYPES = [
  { value: "all", label: "All Event Types" },
  { value: "checkout", label: "Checkout" },
  { value: "return", label: "Return" },
  { value: "movement", label: "Movement" },
  { value: "geofence_violation", label: "Geofence Violation" },
];
import { useTranslation } from "react-i18next";

const DEVICE_IDS = [
  "TTGO-001", "TTGO-002", "TTGO-003", "TTGO-004", "TTGO-005", "TTGO-006",
  "EQ-001", "EQ-002", "EQ-003", "EQ-004", "EQ-005"
];

const generateSecurityReportData = async ({
  reportType,
  startDate,
  endDate,
  category,
  status,
  borrower,
  eventType,
  deviceId,
}) => {
  // All security reports (including inventory) are derived from access logs
  // so that the content reflects the selected date range and activity.
  const res = await api.get("/transactions/security/access-logs");
  const logs = res.data?.logs || [];

  const start = startDate ? new Date(startDate) : new Date("2020-01-01");
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const mapEventType = (logStatus) => {
    if (logStatus === "Checked Out") return "checkout";
    if (logStatus === "Returned") return "return";
    if (logStatus === "Overdue") return "geofence_violation";
    return "movement";
  };

  let filtered = logs.filter((log) => {
    const ts = new Date(log.updatedAt || log.createdAt);
    if (ts < start || ts > end) return false;

    if (category && category !== "all") {
      const logCategory = log.equipment?.category || log.equipment?.type;
      if (logCategory !== category) return false;
    }

    if (borrower) {
      const name = log.user?.username || log.user?.fullName || "";
      if (!name.toLowerCase().includes(borrower.toLowerCase())) return false;
    }

    if (deviceId && log.equipment?.serialNumber !== deviceId) return false;

    if (eventType && eventType !== "all") {
      if (mapEventType(log.status) !== eventType) return false;
    }

    if (status && status !== "all") {
      if (reportType === "logs") {
        if (status === "active" && log.status !== "Checked Out") return false;
        if (status === "completed" && log.status !== "Returned") return false;
        if (status === "violation" && log.status !== "Overdue") return false;
        if (status === "resolved" && log.status !== "Returned") return false;
      } else if (log.status !== status) {
        return false;
      }
    }

    return true;
  });

  if (reportType === "logs") {
    return filtered.map((log) => ({
      id: log._id,
      deviceName: log.equipment?.name || "Unknown Item",
      deviceId: log.equipment?.serialNumber || "N/A",
      eventType: mapEventType(log.status),
      location: log.destination || "Main Storage",
      userName: log.user?.username || "Unknown",
      timestamp: log.updatedAt || log.createdAt,
      status: (status === "all" || !status) ?
        (log.status === "Checked Out"
          ? "active"
          : log.status === "Returned"
            ? "completed"
            : log.status === "Overdue"
              ? "violation"
              : log.status?.toLowerCase() || "completed")
        : status,
    }));
  }

  if (reportType === "inventory") {
    const map = {};
    filtered.forEach((log) => {
      const eqId = log.equipment?._id;
      if (!eqId) return;
      if (!map[eqId]) {
        map[eqId] = {
          id: eqId,
          equipmentName: log.equipment?.name || "Unknown Device",
          serialNumber: log.equipment?.serialNumber || "N/A",
          category: log.equipment?.category || log.equipment?.type || "General",
          location: log.destination || "Main Storage",
          status: log.status || "AVAILABLE",
          condition: "Good",
          purchaseDate: (log.createdAt && log.createdAt.split("T")[0]) || "",
        };
      } else {
        map[eqId].status = log.status || map[eqId].status;
        map[eqId].location = log.destination || map[eqId].location;
      }
    });
    return Object.values(map);
  }

  if (reportType === "damaged") {
    return filtered
      .filter((log) => log.status === "Damaged")
      .map((log) => ({
        id: log._id,
        equipmentName: log.equipment?.name || "Unknown Device",
        serialNumber: log.equipment?.serialNumber || "N/A",
        category: log.equipment?.category || log.equipment?.type || "General",
        damageDate: (log.updatedAt || log.createdAt || "").split("T")[0],
        condition: "Damaged",
        remarks: log.purpose || "Reported as damaged",
        status: "DAMAGED",
      }));
  }

  if (reportType === "lost") {
    return filtered
      .filter((log) => log.status === "Lost")
      .map((log) => ({
        id: log._id,
        equipmentName: log.equipment?.name || "Unknown Device",
        serialNumber: log.equipment?.serialNumber || "N/A",
        category: log.equipment?.category || log.equipment?.type || "General",
        lossDate: (log.updatedAt || log.createdAt || "").split("T")[0],
        lastKnownLocation: log.destination || "Unknown",
        remarks: log.purpose || "Reported as lost",
        status: "LOST",
      }));
  }

  if (reportType === "utilization") {
    const utilMap = {};
    filtered.forEach((log) => {
      const eqId = log.equipment?._id;
      if (!eqId) return;
      if (!utilMap[eqId]) {
        utilMap[eqId] = {
          id: eqId,
          equipmentName: log.equipment?.name || "Unknown Device",
          serialNumber: log.equipment?.serialNumber || "N/A",
          category: log.equipment?.category || log.equipment?.type || "General",
          totalCheckouts: 0,
          currentStatus: log.status || "AVAILABLE",
        };
      }
      if (["Checked Out", "Returned", "Overdue"].includes(log.status)) {
        utilMap[eqId].totalCheckouts += 1;
      }
      utilMap[eqId].currentStatus = log.status || utilMap[eqId].currentStatus;
    });

    return Object.values(utilMap).map((item) => ({
      ...item,
      utilizationRate: Math.min(100, item.totalCheckouts * 5),
    }));
  }

  return [];
};

export default function ReportsContent({
  reportTypes,
  defaultReportType,
  showBorrowerFilter = true,
  exportFilenamePrefix = "equipment-report",
}) {
  const { t } = useTranslation(["common", "itstaff", "security"]);

  const DATE_PRESETS = [
    { value: "today", label: t('reports.presets.today') },
    { value: "last7days", label: t('reports.presets.last7days') },
    { value: "last30days", label: t('reports.presets.last30days') },
    { value: "custom", label: t('reports.presets.custom') },
  ];

  const EQUIPMENT_STATUSES = [
    { value: "all", label: t('reports.filters.allStatus') },
    { value: "AVAILABLE", label: t('itstaff:equipment.status.available') },
    { value: "LENT", label: t('common:status.borrowed') },
    { value: "RESERVED", label: t('common:status.pending') },
    { value: "DAMAGED", label: t('itstaff:equipment.status.maintenance') },
    { value: "LOST", label: t('itstaff:equipment.status.lost') },
  ];

  const LOG_STATUSES = [
    { value: "all", label: t('reports.filters.allStatus') },
    { value: "active", label: t('common:status.active') },
    { value: "completed", label: t('common:status.returned') },
    { value: "violation", label: t('common:status.overdue') },
    { value: "resolved", label: t('itstaff:equipment.status.returned') },
  ];

  const EVENT_TYPES = [
    { value: "all", label: t('reports.filters.allEvents') },
    { value: "checkout", label: t('security:browseDevices.labels.checkout', 'Checkout') },
    { value: "return", label: t('security:browseDevices.labels.return', 'Return') },
    { value: "movement", label: t('security:browseDevices.labels.movement', 'Movement') },
    { value: "geofence_violation", label: t('security:browseDevices.labels.violation', 'Violation') },
  ];

  const [reportType, setReportType] = useState(defaultReportType || reportTypes[0]?.value || "lending");
  const [datePreset, setDatePreset] = useState("last30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [borrower, setBorrower] = useState("");
  const [eventType, setEventType] = useState("all");
  const [deviceId, setDeviceId] = useState("");

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [reportGenerated, setReportGenerated] = useState(false);
  const pageSize = 10;
  const isSecurityContext = exportFilenamePrefix?.startsWith("security-");

  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/config/options");
        const raw = res.data?.categories || [];

        let normalized = [];
        if (Array.isArray(raw) && raw.length > 0) {
          if (typeof raw[0] === "string") {
            normalized = raw;
          } else {
            normalized = raw
              .map((c) => c.name || c.code)
              .filter(Boolean);
          }
        }

        if (normalized.length === 0) {
          normalized = ["Laptop", "Tablet", "Camera", "Audio", "Video", "Projector", "Accessories"];
        }

        setCategoryOptions(normalized);
      } catch (e) {
        console.warn("Failed to load report categories, using defaults.", e);
        setCategoryOptions(["Laptop", "Tablet", "Camera", "Audio", "Video", "Projector", "Accessories"]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (datePreset) {
      case "today":
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
        break;
      case "last7days":
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        setStartDate(formatDate(last7));
        setEndDate(formatDate(today));
        break;
      case "last30days":
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        setStartDate(formatDate(last30));
        setEndDate(formatDate(today));
        break;
      case "custom":
        if (!startDate || !endDate) {
          const defaultStart = new Date(today);
          defaultStart.setDate(today.getDate() - 30);
          setStartDate(formatDate(defaultStart));
          setEndDate(formatDate(today));
        }
        break;
      default:
        break;
    }
  }, [datePreset]);

  // Generate report when filters change
  const handleGenerateReport = async () => {
    setLoading(true);
    setPage(1);
    setReportGenerated(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let data = [];
      if (isSecurityContext) {
        data = await generateSecurityReportData({
          reportType,
          startDate,
          endDate,
          category,
          status,
          borrower: showBorrowerFilter && borrower ? borrower : undefined,
          eventType: reportType === "logs" ? eventType : undefined,
          deviceId: reportType === "logs" ? deviceId : undefined,
        });
      } else {
        data = await generateReportData({
          reportType,
          startDate,
          endDate,
          category: category !== "all" ? category : undefined,
          status: status !== "all" ? status : undefined,
          borrower: showBorrowerFilter && borrower ? borrower : undefined,
          eventType: reportType === "logs" && eventType !== "all" ? eventType : undefined,
          deviceId: reportType === "logs" && deviceId ? deviceId : undefined,
        });
      }

      const normalize = (val) => (val || "").toString().trim().toLowerCase();
      if (category && category !== "all") {
        data = (data || []).filter((item) => {
          if (!item || typeof item !== "object") return false;
          if (!("category" in item)) return true;
          return normalize(item.category) === normalize(category);
        });
      }

      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setReportType(defaultReportType || reportTypes[0]?.value || "lending");
    setDatePreset("last30days");
    setCategory("all");
    setStatus("all");
    setBorrower("");
    setEventType("all");
    setDeviceId("");
    setReportData([]);
    setPage(1);
    setReportGenerated(false);
  };

  // Get table columns based on report type
  const getTableColumns = () => {
    switch (reportType) {
      case "inventory":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.location'),
          t('reports.columns.status'),
          t('reports.columns.condition'),
          t('reports.columns.purchaseDate'),
        ];
      case "lending":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.borrowerName'),
          t('reports.columns.lendingDate'),
          t('reports.columns.dueDate'),
          t('reports.columns.status'),
        ];
      case "reservation":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.borrowerName'),
          t('reports.columns.reservationStart'),
          t('reports.columns.reservationEnd'),
          t('reports.columns.status'),
        ];
      case "damaged":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.damageDate'),
          t('reports.columns.condition'),
          t('reports.columns.remarks'),
          t('reports.columns.status'),
        ];
      case "lost":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.lossDate'),
          t('reports.columns.lastKnownLocation'),
          t('reports.columns.remarks'),
          t('reports.columns.status'),
        ];
      case "utilization":
        return [
          t('reports.columns.equipmentName'),
          t('reports.columns.serialNumber'),
          t('reports.columns.category'),
          t('reports.columns.totalCheckouts'),
          t('reports.columns.utilizationRate'),
          t('reports.columns.currentStatus'),
        ];
      case "logs":
        return [
          t('reports.columns.deviceName'),
          t('reports.columns.deviceId'),
          t('reports.columns.eventType'),
          t('reports.columns.location'),
          t('reports.columns.user'),
          t('reports.columns.timestamp'),
          t('reports.columns.status'),
        ];
      default:
        return [];
    }
  };

  // Get row data for table
  const getRowData = (item) => {
    switch (reportType) {
      case "inventory":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.location,
          <Badge
            key="status"
            variant={
              item.status === "AVAILABLE"
                ? "default"
                : item.status === "DAMAGED" || item.status === "LOST"
                  ? "destructive"
                  : "secondary"
            }
          >
            {t(`itstaff:equipment.status.${item.status.toLowerCase()}`, item.status)}
          </Badge>,
          item.condition,
          item.purchaseDate,
        ];
      case "lending":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.borrowerName,
          item.lendingDate,
          item.dueDate,
          <Badge
            key="status"
            variant={item.status === "LENT" ? "default" : "secondary"}
          >
            {t(`common:status.${item.status.toLowerCase()}`, item.status)}
          </Badge>,
        ];
      case "reservation":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.borrowerName,
          item.reservationStart,
          item.reservationEnd,
          <Badge
            key="status"
            variant={item.status === "RESERVED" ? "default" : "secondary"}
          >
            {t(`common:status.${item.status.toLowerCase()}`, item.status)}
          </Badge>,
        ];
      case "damaged":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.damageDate,
          item.condition,
          item.remarks,
          <Badge key="status" variant="destructive">
            {t(`itstaff:equipment.status.${item.status.toLowerCase()}`, item.status)}
          </Badge>,
        ];
      case "lost":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.lossDate,
          item.lastKnownLocation,
          item.remarks,
          <Badge key="status" variant="destructive">
            {t(`itstaff:equipment.status.${item.status.toLowerCase()}`, item.status)}
          </Badge>,
        ];
      case "utilization":
        return [
          item.equipmentName,
          item.serialNumber,
          item.category,
          item.totalCheckouts,
          `${item.utilizationRate}%`,
          <Badge
            key="status"
            variant={
              item.currentStatus === "AVAILABLE" ? "default" : "secondary"
            }
          >
            {t(`itstaff:equipment.status.${item.currentStatus.toLowerCase()}`, item.currentStatus)}
          </Badge>,
        ];
      case "logs":
        const getStatusDisplay = (status) => {
          if (status === "completed") return "Resolved";
          if (status === "violation") return "Open";
          if (status === "active") return "In use";
          return status?.charAt(0).toUpperCase() + status?.slice(1) || status;
        };

        const getStatusClassName = (status) => {
          if (status === "active") return "bg-yellow-100 text-yellow-700 border-yellow-200";
          if (status === "completed") return "bg-green-100 text-green-700 border-green-200";
          if (status === "violation") return "bg-red-100 text-red-700 border-red-200";
          if (status === "resolved") return "bg-blue-100 text-blue-700 border-blue-200";
          return "bg-gray-100 text-gray-700 border-gray-200";
        };

        return [
          item.deviceName,
          item.deviceId,
          item.eventType,
          item.location,
          item.userName,
          item.timestamp,
          <Badge
            key="status"
            variant="outline"
            className={getStatusClassName(item.status)}
          >
            {getStatusDisplay(item.status)}
          </Badge>,
        ];
      default:
        return [];
    }
  };

  // Pagination
  const {
    totalPages,
    currentPage,
    paginatedItems: currentData,
  } = usePagination(reportData, page, pageSize);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {
        username: "Security Staff",
        role: "Security",
      };
    } catch {
      return { username: "Security Staff", role: "Security" };
    }
  })();

  const mapItemToPdfRow = (item) => {
    switch (reportType) {
      case "inventory":
        return {
          createdAt: item.purchaseDate,
          status: item.status,
          equipment: {
            name: item.equipmentName,
            serialNumber: item.serialNumber,
            category: item.category,
          },
          user: {
            username: "-",
            email: "-",
          },
        };
      case "damaged":
        return {
          createdAt: item.damageDate,
          status: item.status,
          equipment: {
            name: item.equipmentName,
            serialNumber: item.serialNumber,
            category: item.category,
          },
          user: {
            username: "-",
            email: "-",
          },
        };
      case "lost":
        return {
          createdAt: item.lossDate,
          status: item.status,
          equipment: {
            name: item.equipmentName,
            serialNumber: item.serialNumber,
            category: item.category,
          },
          user: {
            username: "-",
            email: "-",
          },
        };
      case "utilization":
        return {
          createdAt: new Date().toISOString(),
          status: item.currentStatus,
          equipment: {
            name: item.equipmentName,
            serialNumber: item.serialNumber,
            category: item.category,
          },
          user: {
            username: "-",
            email: "-",
          },
        };
      case "logs":
        return {
          createdAt: item.timestamp,
          status: item.status,
          equipment: {
            name: item.deviceName,
            serialNumber: item.deviceId,
            category: item.eventType,
          },
          user: {
            username: item.userName,
            email: "-",
          },
        };
      default:
        return {
          createdAt: new Date().toISOString(),
          status: item.status,
          equipment: {
            name: item.equipmentName || item.deviceName || "N/A",
            serialNumber: item.serialNumber || item.deviceId || "N/A",
            category: item.category || item.eventType || "N/A",
          },
          user: {
            username: item.userName || "-",
            email: "-",
          },
        };
    }
  };

  // Handle download
  const handleDownload = async (format) => {
    if (reportData.length === 0) {
      toast.warning("No data to export. Please generate a report first.");
      return;
    }

    const reportTypeLabel =
      reportTypes.find((r) => r.value === reportType)?.label || reportType;
    const filename = `${exportFilenamePrefix}_${reportType}_${startDate}_${endDate}`;

    try {
      if (format === "csv") {
        exportToCSV(reportData, getTableColumns(), getRowData, filename);
      } else if (format === "pdf") {
        const pdfData = reportData.map(mapItemToPdfRow);
        const title = `${reportTypeLabel.toUpperCase()} ${t("reports.title").toUpperCase()}`;
        const includeUserColumn = !(isSecurityContext && reportType === "inventory");
        generatePDF(pdfData, currentUser, title, includeUserColumn);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Filters Section */}
      <Card className="mb-8 border-gray-100 shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#8D8DC7] transition-colors">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {t('reports.filters.title')}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm font-medium text-slate-400">
            {t('reports.filters.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-0">
          <div className="space-y-4">
            {/* Report Type */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                  {t('reports.filters.type')} <span className="text-red-500">*</span>
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-[#8D8DC7]/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Preset */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                  {t('reports.filters.dateRange')} <span className="text-red-500">*</span>
                </label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger className="w-full h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-[#8D8DC7]/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Date Range */}
              {datePreset === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                      {t('reports.filters.startDate')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-[#8D8DC7]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                      {t('reports.filters.endDate')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-slate-900 focus:ring-[#8D8DC7]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Optional Filters */}
              {reportType === "logs" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reports.filters.deviceId')}
                    </label>
                    <Select value={deviceId} onValueChange={setDeviceId}>
                      <SelectTrigger className="w-full border-gray-300 shadow-sm">
                        <SelectValue placeholder={t('reports.filters.allDevices')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('reports.filters.allDevices')}</SelectItem>
                        {DEVICE_IDS.map((id) => (
                          <SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reports.filters.eventType')}
                    </label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="w-full border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reports.filters.status')}
                    </label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOG_STATUSES.map((stat) => (
                          <SelectItem key={stat.value} value={stat.value}>
                            {stat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reports.filters.category')} <span className="text-red-500">*</span>
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t('reports.filters.allCategories')}
                        </SelectItem>
                        {categoryOptions.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reports.filters.status')}
                    </label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_STATUSES.map((stat) => (
                          <SelectItem key={stat.value} value={stat.value}>
                            {stat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {showBorrowerFilter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('reports.filters.borrower')}
                      </label>
                      <Input
                        type="text"
                        placeholder={t('reports.filters.borrowerPlaceholder')}
                        value={borrower}
                        onChange={(e) => setBorrower(e.target.value)}
                        className="border-gray-300 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-end sm:flex-row gap-3 pt-6 border-t border-gray-50">
              <Button
                onClick={handleGenerateReport}
                disabled={loading || !startDate || !endDate}
                className="flex-1 text-white sm:flex-initial bg-slate-900 hover:bg-slate-800 h-12 px-10 rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-transform active:scale-95 border-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('reports.actions.generating')}
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    {t('reports.actions.generate')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                disabled={loading}
                className="flex-1 sm:flex-initial border-slate-200 h-12 px-8 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('reports.actions.reset')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {
        reportData.length > 0 && (
          <Card className="mb-8 border-gray-100 shadow-md bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {t('reports.results.title')}
                  </CardTitle>
                  <CardDescription className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {t('reports.results.summary', { current: currentData.length, total: reportData.length })}
                    {totalPages > 1 &&
                      ` • ${t('reports.results.pageInfo', { current: currentPage, total: totalPages })}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <div className="overflow-hidden rounded-[1.5rem] border border-gray-50 bg-white shadow-sm">
                <Table className="w-full text-sm">
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-50">
                      {getTableColumns().map((column) => (
                        <TableHead
                          key={column}
                          className="h-14 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item, idx) => (
                      <TableRow
                        key={item.id || idx}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        {getRowData(item).map((cell, cellIdx) => {
                          const isStatus =
                            cellIdx === getRowData(item).length - 1;
                          return (
                            <TableCell
                              key={cellIdx}
                              className={`px-6 py-5 text-left ${isStatus
                                ? "font-black"
                                : "text-slate-600 font-bold"
                                }`}
                            >
                              {cell}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Download Section */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-8 border-t border-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t('reports.results.export')}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {t('reports.results.exportDesc')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleDownload("csv")}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-slate-900/10 transition-transform active:scale-95"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {t('reports.results.downloadCsv')}
                  </Button>
                  <Button
                    onClick={() => handleDownload("pdf")}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-slate-900/10 transition-transform active:scale-95"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('reports.results.downloadPdf')}
                  </Button>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )
      }

      {/* Empty State */}
      {
        !loading && reportData.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              {reportGenerated ? (
                <>
                  <FileDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('reports.emptyState.noDataTitle')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('reports.emptyState.noDataDesc')}
                  </p>
                </>
              ) : (
                <>
                  <FileDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('reports.emptyState.noReportTitle')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('reports.emptyState.noReportDesc')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}

ReportsContent.propTypes = {
  reportTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  defaultReportType: PropTypes.string,
  showBorrowerFilter: PropTypes.bool,
  exportFilenamePrefix: PropTypes.string,
};

