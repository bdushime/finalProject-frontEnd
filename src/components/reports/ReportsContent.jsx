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
import { generateReportData, exportToCSV, exportToPDF } from "@/pages/IT_Staff/reports/reportService";
import PropTypes from "prop-types";

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

const DEVICE_IDS = [
  "TTGO-001", "TTGO-002", "TTGO-003", "TTGO-004", "TTGO-005", "TTGO-006",
  "EQ-001", "EQ-002", "EQ-003", "EQ-004", "EQ-005"
];

export default function ReportsContent({
  reportTypes,
  defaultReportType,
  showBorrowerFilter = true,
  exportFilenamePrefix = "equipment-report",
}) {
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

      const data = generateReportData({
        reportType,
        startDate,
        endDate,
        category: category !== "all" ? category : undefined,
        status: status !== "all" ? status : undefined,
        borrower: showBorrowerFilter && borrower ? borrower : undefined,
        eventType: reportType === "logs" && eventType !== "all" ? eventType : undefined,
        deviceId: reportType === "logs" && deviceId ? deviceId : undefined,
      });

      setReportData(data);
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
          "Equipment Name",
          "Serial Number",
          "Category",
          "Location",
          "Status",
          "Condition",
          "Purchase Date",
        ];
      case "lending":
        return [
          "Equipment Name",
          "Serial Number",
          "Category",
          "Borrower Name",
          "Lending Date",
          "Due Date",
          "Status",
        ];
      case "reservation":
        return [
          "Equipment Name",
          "Serial Number",
          "Category",
          "Borrower Name",
          "Reservation Start",
          "Reservation End",
          "Status",
        ];
      case "damaged":
        return [
          "Equipment Name",
          "Serial Number",
          "Category",
          "Damage Date",
          "Condition",
          "Remarks",
          "Status",
        ];
      case "lost":
        return [
          "Equipment Name",
          "Serial Number",
          "Category",
          "Loss Date",
          "Last Known Location",
          "Remarks",
          "Status",
        ];
      case "utilization":
        return [
          "Equipment Name",
          "Serial Number",
          "Category",
          "Total Checkouts",
          "Utilization Rate",
          "Current Status",
        ];
      case "logs":
        return [
          "Device Name",
          "Device ID",
          "Event Type",
          "Location",
          "User",
          "Timestamp",
          "Status",
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
            {item.status}
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
            {item.status}
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
            {item.status}
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
            {item.status}
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
            {item.status}
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
            {item.currentStatus}
          </Badge>,
        ];
      case "logs":
        // Map status to display text and styling to match Accesslogs.jsx
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

  // Handle download
  const handleDownload = async (format) => {
    if (reportData.length === 0) {
      alert("No data to export. Please generate a report first.");
      return;
    }

    const reportTypeLabel =
      reportTypes.find((r) => r.value === reportType)?.label || reportType;
    const filename = `${exportFilenamePrefix}_${reportType}_${startDate}_${endDate}`;

    try {
      if (format === "csv") {
        exportToCSV(reportData, getTableColumns(), getRowData, filename);
      } else if (format === "pdf") {
        await exportToPDF(
          reportData,
          getTableColumns(),
          getRowData,
          reportTypeLabel,
          startDate,
          endDate,
          filename
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  // Get categories from equipment data
  const categories = useMemo(() => {
    return [
      "All Categories",
      "Laptop",
      "Tablet",
      "Camera",
      "Audio",
      "Video",
      "Projector",
      "Accessories",
    ];
  }, []);

  return (
    <div className="space-y-3">
      {/* Filters Section */}
      <Card className="mb-6 border-gray-200 shadow-sm space-y-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl font-bold">
              Report Filters
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">
            Customize your report by selecting filters below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Report Type */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full border-gray-300 shadow-sm">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range <span className="text-red-500">*</span>
                </label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger className="w-full border-gray-300 shadow-sm">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Optional Filters */}
            {reportType === "logs" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device ID
                  </label>
                  <Select value={deviceId} onValueChange={setDeviceId}>
                    <SelectTrigger className="w-full border-gray-300 shadow-sm">
                      <SelectValue placeholder="All Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Devices</SelectItem>
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
                    Event Type
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
                    Status
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
                    Equipment Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full border-gray-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat === "All Categories" ? "all" : cat}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Status
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
                      Borrower (Staff/User)
                    </label>
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
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
            <div className="flex flex-col justify-end sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleGenerateReport}
                disabled={loading || !startDate || !endDate}
                className="flex-1 text-white sm:flex-initial bg-[#343264] hover:bg-[#2a2751]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                disabled={loading}
                className="flex-1 sm:flex-initial border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {reportData.length > 0 && (
        <Card className="mb-6 border-gray-200 shadow-sm space-y-4">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">
                  Report Results
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Showing {currentData.length} of {reportData.length} records
                  {totalPages > 1 &&
                    ` (Page ${currentPage} of ${totalPages})`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <Table className="w-full text-sm">
                <TableHeader className="bg-gray-100/50">
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    {getTableColumns().map((column) => (
                      <TableHead
                        key={column}
                        className="h-12 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
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
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 even:bg-gray-50/30"
                    >
                      {getRowData(item).map((cell, cellIdx) => {
                        const isStatus =
                          cellIdx === getRowData(item).length - 1;
                        return (
                          <TableCell
                            key={cellIdx}
                            className={`px-6 py-4 text-left font-medium ${
                              isStatus
                                ? "text-gray-900 font-bold uppercase"
                                : "text-gray-700"
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
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200/60">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Export Report
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Download the complete report in your preferred format
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleDownload("csv")}
                  className="bg-[#23214a] hover:bg-[#1a1838] text-white font-medium shadow-sm transition-all"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button
                  onClick={() => handleDownload("pdf")}
                  className="bg-[#23214a] hover:bg-[#1a1838] text-white font-medium shadow-sm transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
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
      )}

      {/* Empty State */}
      {!loading && reportData.length === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center">
            {reportGenerated ? (
              <>
                <FileDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Data Found
                </h3>
                <p className="text-gray-600 mb-4">
                  No records match your current filter criteria. Try adjusting your filters
                  (date range, category, status{showBorrowerFilter ? ", or borrower" : ""}) and generate the report again.
                </p>
              </>
            ) : (
              <>
                <FileDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Report Generated
                </h3>
                <p className="text-gray-600 mb-4">
                  Use the filters above to generate a report. Select your report
                  type, date range, and any optional filters, then click "Generate
                  Report".
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
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

