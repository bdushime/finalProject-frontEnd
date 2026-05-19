import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/pages/security/layout/MainLayout";
import api from "@/utils/api";
import {
  FileText,
  Monitor,
  Package,
  ShieldAlert,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";
import Loader from "@/components/common/Loader";
import {
  buildBorrowDestinationMap,
  getEquipmentDisplayLocation,
} from "@/utils/equipmentDisplayLocation";

const datePickerStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.3);
    padding: 2px;
  }
`;

const normalizeEquipmentList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const list =
    payload.items ||
    payload.equipment ||
    payload.results ||
    payload.data ||
    [];
  return Array.isArray(list) ? list : [];
};

const isExceptionDevice = (row) => {
  const s = (row.status || "").toString().toLowerCase();
  const c = (row.condition || "").toString().toLowerCase();
  const damagedLike =
    s.includes("damage") ||
    c.includes("damage") ||
    s.includes("broken") ||
    c.includes("broken");
  if (damagedLike) return true;
  if (s.includes("lost") || c.includes("lost")) return true;
  if (s.includes("maintenance") || c.includes("maintenance")) return true;
  if (s.includes("overdue")) return true;
  return false;
};

/** Equipment IDs with an active Overdue transaction (device row may still say Checked Out). */
const buildOverdueEquipmentIdMap = (activeTransactions) => {
  const list = Array.isArray(activeTransactions) ? activeTransactions : [];
  const map = Object.create(null);
  for (const tx of list) {
    if (String(tx?.status) !== "Overdue") continue;
    const eq = tx.equipment;
    const eqId =
      typeof eq === "object" && eq !== null ? eq._id || eq.id : eq;
    if (eqId) map[String(eqId)] = true;
  }
  return map;
};

const normStatus = (s) =>
  (s ?? "").toString().trim().toLowerCase().replace(/-/g, " ");

/** Normalize log status for filter matching (e.g. Cancelled vs Canceled). */
const normLogStatusKey = (s) => {
  const n = normStatus(s);
  if (n === "cancelled") return "canceled";
  return n;
};

/** Three restrained tones: good (emerald), loan risk (sky), needs attention (rose); neutral slate for in-flight checkout. */
const reportStatusBadgeClass = (statusRaw) => {
  const s = normStatus(statusRaw);
  if (s === "returned" || s === "available") {
    return "bg-emerald-50 text-emerald-800 border border-emerald-200/90";
  }
  if (s === "overdue" || s.includes("overdue")) {
    return "bg-sky-50 text-sky-800 border border-sky-200/90";
  }
  if (s.includes("checked") && s.includes("out")) {
    return "bg-slate-100 text-slate-700 border border-slate-200/90";
  }
  if (
    s === "denied" ||
    s === "canceled" ||
    s === "cancelled" ||
    s.includes("damag") ||
    s.includes("lost") ||
    s.includes("maintenance")
  ) {
    return "bg-rose-50 text-rose-800 border border-rose-200/90";
  }
  return "bg-slate-50 text-slate-600 border border-slate-200/80";
};

const SecurityReportsDashboard = () => {
  const { t } = useTranslation(["security", "admin", "common"]);

  /** Device inventory + attention items status filter (includes Overdue via active loans). */
  const INVENTORY_STATUSES = useMemo(
    () => [
      { value: "All Statuses", label: t("security:reportsDashboard.allStatuses") },
      { value: "Available", label: t("security:browseDevices.labels.available") },
      { value: "Checked Out", label: t("security:browseDevices.labels.checkedOut") },
      { value: "Maintenance", label: t("security:browseDevices.labels.maintenance") },
      { value: "Damaged", label: t("security:browseDevices.labels.damaged") },
      { value: "Lost", label: t("security:browseDevices.labels.lost") },
      { value: "Overdue", label: t("security:reportsDashboard.logStatusOverdue") },
    ],
    [t]
  );

  const LOG_STATUSES = useMemo(
    () => [
      { value: "All Statuses", label: t("security:reportsDashboard.allStatuses") },
      { value: "Checked Out", label: t("security:browseDevices.labels.checkedOut") },
      { value: "Returned", label: t("security:reportsDashboard.logStatusReturned") },
      { value: "Overdue", label: t("security:reportsDashboard.logStatusOverdue") },
      { value: "Denied", label: t("security:reportsDashboard.logStatusDenied") },
      { value: "Canceled", label: t("security:reportsDashboard.logStatusCanceled") },
    ],
    [t]
  );

  const [currentReport, setCurrentReport] = useState("devices");
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState([]);
  const [borrowDestinationByEquipmentId, setBorrowDestinationByEquipmentId] = useState({});
  const [overdueEquipmentIds, setOverdueEquipmentIds] = useState({});
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {
        username: "Security",
        role: "Security",
      };
    } catch {
      return { username: "Security", role: "Security" };
    }
  }, []);

  const handleReportChange = (report) => {
    setCurrentReport(report);
    setSelectedStatus("All Statuses");
    setCurrentPage(1);
    setRawData([]);
    setBorrowDestinationByEquipmentId({});
    setOverdueEquipmentIds({});
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, startDate, endDate]);

  const storageLabel = t("security:browseDevices.defaultStorage", "Main storage");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentReport === "packages") {
          setBorrowDestinationByEquipmentId({});
          setOverdueEquipmentIds({});
          const res = await api.get("/packages").catch(() => ({ data: [] }));
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data?.data || res.data?.packages || []);
          setRawData(list);
        } else if (currentReport === "logs") {
          setBorrowDestinationByEquipmentId({});
          setOverdueEquipmentIds({});
          const res = await api.get(
            "/transactions/security/access-logs?page=1&limit=2000"
          );
          setRawData(Array.isArray(res.data?.logs) ? res.data.logs : []);
        } else {
          const [eqRes, activeRes] = await Promise.all([
            api.get("/equipment"),
            api.get("/transactions/active").catch(() => ({ data: [] })),
          ]);
          const activeList = Array.isArray(activeRes.data)
            ? activeRes.data
            : activeRes.data?.data || [];
          setBorrowDestinationByEquipmentId(
            buildBorrowDestinationMap(activeList)
          );
          const overdueMap = buildOverdueEquipmentIdMap(activeList);
          setOverdueEquipmentIds(overdueMap);
          const list = normalizeEquipmentList(eqRes.data);
          if (currentReport === "exceptions") {
            setRawData(
              list.filter(
                (row) =>
                  isExceptionDevice(row) ||
                  overdueMap[String(row._id || row.id || "")]
              )
            );
          } else {
            setRawData(list);
          }
        }
      } catch (err) {
        console.error("Security reports fetch error:", err);
        if (err.response?.status !== 404) {
          toast.error("Failed to load report data.");
        }
        setRawData([]);
        setBorrowDestinationByEquipmentId({});
        setOverdueEquipmentIds({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentReport]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    if (currentReport === "devices" || currentReport === "exceptions") {
      return rawData.filter((row) => {
        if (selectedStatus === "All Statuses") return true;
        if (selectedStatus === "Overdue") {
          const id = String(row._id || row.id || "");
          return (
            !!overdueEquipmentIds[id] ||
            normStatus(row.status).includes("overdue")
          );
        }
        const st = (row.status || "").toString().toLowerCase();
        const cond = (row.condition || "").toString().toLowerCase();

        if (selectedStatus === "Damaged") {
          return (
            st.includes("damage") ||
            cond.includes("damage") ||
            st.includes("broken") ||
            cond.includes("broken") ||
            st === "damaged" ||
            cond === "damaged"
          );
        }
        if (selectedStatus === "Lost") {
          return st.includes("lost") || cond.includes("lost");
        }
        if (selectedStatus === "Maintenance") {
          return (
            st.includes("maintenance") ||
            cond.includes("maintenance") ||
            st === selectedStatus.toLowerCase() ||
            (row.status || "").toString() === selectedStatus
          );
        }

        const rowStatus = (row.status || "").toString();
        return (
          rowStatus === selectedStatus ||
          rowStatus.toLowerCase() === selectedStatus.toLowerCase()
        );
      });
    }

    if (currentReport === "logs") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return rawData.filter((log) => {
        const ts = new Date(log.updatedAt || log.createdAt);
        const dateOk = !Number.isNaN(ts.getTime()) ? ts >= start && ts <= end : true;
        if (!dateOk) return false;
        if (selectedStatus === "All Statuses") return true;
        return (
          normLogStatusKey(log.status) === normLogStatusKey(selectedStatus)
        );
      });
    }

    return rawData;
  }, [
    rawData,
    currentReport,
    selectedStatus,
    startDate,
    endDate,
    overdueEquipmentIds,
  ]);

  const categorySummary = useMemo(() => {
    if (currentReport !== "devices" && currentReport !== "exceptions") return null;
    const counts = {};
    filteredData.forEach((row) => {
      const cat = row.category || row.type || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [filteredData, currentReport]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const getColumns = () => {
    switch (currentReport) {
      case "packages":
        return [
          {
            header: t("security:reportsDashboard.colPackageName"),
            render: (row) => (
              <div className="font-bold text-slate-900">{row.name || row.title || "—"}</div>
            ),
            pdf: (row) => row.name || row.title || "—",
          },
          {
            header: t("security:reportsDashboard.colDescription"),
            render: (row) => (
              <span className="text-sm text-slate-600 line-clamp-2">
                {row.description || "—"}
              </span>
            ),
            pdf: (row) => (row.description || "—").replace(/\s+/g, " ").slice(0, 120),
          },
          {
            header: t("security:reportsDashboard.colItemCount"),
            render: (row) => {
              const devices = row.devices || [];
              const count = devices.length;
              if (count === 0) return <span className="text-slate-400 font-medium">Empty package</span>;
              
              const names = devices
                .map((d) => (typeof d === "object" && d !== null ? d.name : d))
                .join(", ");
              return (
                <div>
                  <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                    {count} device{count !== 1 ? "s" : ""}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={names}>
                    {names}
                  </div>
                </div>
              );
            },
            pdf: (row) => {
              const devices = row.devices || [];
              return devices
                .map((d) => (typeof d === "object" && d !== null ? d.name : d))
                .join(", ");
            },
          },
          {
            header: t("security:reportsDashboard.colPackageId"),
            render: (row) => (
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                PKG-{(row._id || row.id || "").toString().slice(-8).toUpperCase()}
              </span>
            ),
            pdf: (row) => "PKG-" + (row._id || row.id || "").toString().slice(-8).toUpperCase(),
          },
        ];
      case "logs":
        return [
          {
            header: t("security:accessLogs.table.equipment"),
            render: (row) => (
              <div>
                <div className="font-bold text-slate-900">
                  {row.equipment?.name || "—"}
                </div>
                <div className="text-xs text-slate-400">
                  {row.equipment?.serialNumber || "—"}
                </div>
              </div>
            ),
            pdf: (row) => row.equipment?.name || "—",
          },
          {
            header: t("security:accessLogs.table.user"),
            render: (row) => {
              const u = row.user;
              const name = u?.fullName
                || (u?.studentId ? `Student ${u.studentId}` : u?.username)
                || u?.email
                || "—";
              return <span className="text-slate-700">{name}</span>;
            },
            pdf: (row) => row.user?.fullName
              || (row.user?.studentId ? `Student ${row.user.studentId}` : row.user?.username)
              || row.user?.email
              || "—",
          },
          {
            header: t("admin:reports.date"),
            render: (row) => {
              const d = row.updatedAt || row.createdAt;
              return d ? new Date(d).toLocaleDateString() : "—";
            },
            pdf: (row) => {
              const d = row.updatedAt || row.createdAt;
              return d ? new Date(d).toLocaleDateString() : "—";
            },
          },
          {
            header: t("admin:reports.time") || "Time",
            render: (row) => {
              const d = row.updatedAt || row.createdAt;
              return d
                ? new Date(d).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
            },
            pdf: (row) => {
              const d = row.updatedAt || row.createdAt;
              return d
                ? new Date(d).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
            },
          },
          {
            header: t("security:accessLogs.table.status"),
            render: (row) => (
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${reportStatusBadgeClass(
                  row.status
                )}`}
              >
                {row.status || "—"}
              </span>
            ),
            pdf: (row) => row.status || "—",
          },
          {
            header: t("security:accessLogs.table.location"),
            render: (row) => row.destination || row.location || "—",
            pdf: (row) => row.destination || row.location || "—",
          },
        ];
      case "exceptions":
      case "devices":
      default:
        return [
          {
            header: t("admin:reports.deviceName"),
            render: (row) => (
              <div>
                <div className="font-bold text-slate-900">{row.name || "—"}</div>
                <div className="text-xs text-slate-400">
                  {(row._id || row.id || "").toString().slice(-8)}
                </div>
              </div>
            ),
            pdf: (row) => row.name || "—",
          },
          {
            header: t("admin:reports.serialNumber"),
            render: (row) => (
              <span className="font-mono text-xs">{row.serialNumber || "—"}</span>
            ),
            pdf: (row) => row.serialNumber || "—",
          },
          {
            header: t("admin:reports.category"),
            render: (row) => row.category || row.type || "—",
            pdf: (row) => row.category || row.type || "—",
          },
          {
            header: t("admin:reports.statusFilter"),
            render: (row) => {
              const id = String(row._id || row.id || "");
              const overdueFromLoan =
                overdueEquipmentIds[id] &&
                !normStatus(row.status).includes("overdue");
              const label = overdueFromLoan
                ? t("security:reportsDashboard.logStatusOverdue")
                : row.status || "—";
              const tone = overdueFromLoan
                ? reportStatusBadgeClass("Overdue")
                : reportStatusBadgeClass(row.status);
              return (
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${tone}`}
                >
                  {label}
                </span>
              );
            },
            pdf: (row) => {
              const id = String(row._id || row.id || "");
              if (
                overdueEquipmentIds[id] &&
                !normStatus(row.status).includes("overdue")
              ) {
                return t("security:reportsDashboard.logStatusOverdue");
              }
              return row.status || "—";
            },
          },
          {
            header: t("security:reportsDashboard.colCondition"),
            render: (row) => row.condition || "—",
            pdf: (row) => row.condition || "—",
          },
          {
            header: t("admin:reports.location"),
            render: (row) =>
              getEquipmentDisplayLocation(
                row,
                borrowDestinationByEquipmentId,
                storageLabel
              ),
            pdf: (row) =>
              getEquipmentDisplayLocation(
                row,
                borrowDestinationByEquipmentId,
                storageLabel
              ),
          },
        ];
    }
  };

  const handleExportPDF = () => {
    if (!filteredData.length) {
      toast.error(t("security:reportsDashboard.noExport"));
      return;
    }
    const columns = getColumns();
    const tableColumn = ["No.", ...columns.map((c) => c.header)];
    const tableRows = filteredData.map((row, index) => {
      const rowData = [index + 1];
      columns.forEach((col) => {
        if (col.pdf) rowData.push(col.pdf(row));
        else if (col.accessor) rowData.push(row[col.accessor] || "N/A");
        else rowData.push("N/A");
      });
      return rowData;
    });
    const title = `${currentReport.toUpperCase()} ${t("security:reports.title")}`;
    generatePDF(filteredData, currentUser, title, tableColumn, tableRows);
  };

  const handleExportExcel = () => {
    if (!filteredData.length) {
      toast.error(t("security:reportsDashboard.noExport"));
      return;
    }
    try {
      const columns = getColumns();
      const headers = columns.map((c) => `"${String(c.header).replace(/"/g, '""')}"`).join(",");
      const rows = filteredData
        .map((row) =>
          columns
            .map((col) => {
              const cell = col.pdf ? col.pdf(row) : row[col.accessor] ?? "";
              const s = String(cell ?? "").replace(/"/g, '""');
              return `"${s}"`;
            })
            .join(",")
        )
        .join("\n");
      const csv = `\uFEFF${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `security_${currentReport}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(t("security:reportsDashboard.exportCsvOk"));
    } catch (e) {
      console.error(e);
      toast.error(t("security:reportsDashboard.exportFail"));
    }
  };

  const LandingCard = ({ title, desc, icon: Icon, onClick, isSelected }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start p-6 bg-white border rounded-2xl transition-all duration-300 group text-left w-full relative overflow-hidden ${
        isSelected
          ? "border-blue-500 shadow-lg ring-2 ring-blue-500/20 translate-y-[-2px]"
          : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1"
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50 rounded-bl-full -mr-4 -mt-4 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors bg-slate-900 text-white ${
          isSelected ? "scale-110 shadow-md" : "group-hover:scale-110"
        } duration-300 relative z-10`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3
        className={`text-lg font-bold mb-1 relative z-10 ${
          isSelected ? "text-blue-600" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p className="text-slate-500 text-xs leading-relaxed relative z-10">{desc}</p>
    </button>
  );

  const SelectionGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <LandingCard
        title={t("security:reportsDashboard.cardDevicesTitle")}
        desc={t("security:reportsDashboard.cardDevicesDesc")}
        icon={Monitor}
        onClick={() => handleReportChange("devices")}
        isSelected={currentReport === "devices"}
      />
      <LandingCard
        title={t("security:reportsDashboard.cardPackagesTitle")}
        desc={t("security:reportsDashboard.cardPackagesDesc")}
        icon={Package}
        onClick={() => handleReportChange("packages")}
        isSelected={currentReport === "packages"}
      />
      <LandingCard
        title={t("security:reportsDashboard.cardLogsTitle")}
        desc={t("security:reportsDashboard.cardLogsDesc")}
        icon={FileText}
        onClick={() => handleReportChange("logs")}
        isSelected={currentReport === "logs"}
      />
      <LandingCard
        title={t("security:reportsDashboard.cardExceptionsTitle")}
        desc={t("security:reportsDashboard.cardExceptionsDesc")}
        icon={ShieldAlert}
        onClick={() => handleReportChange("exceptions")}
        isSelected={currentReport === "exceptions"}
      />
    </div>
  );

  const heroTitle =
    currentReport === "devices"
      ? t("security:reportsDashboard.heroDevices")
      : currentReport === "packages"
        ? t("security:reportsDashboard.heroPackages")
        : currentReport === "logs"
          ? t("security:reportsDashboard.heroLogs")
          : t("security:reportsDashboard.heroExceptions");

  const HeroSection = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 mt-4 relative z-10 w-full text-white">
      <div>
        <h1 className="text-4xl font-bold mb-2">{heroTitle}</h1>
        <p className="text-blue-100 max-w-2xl opacity-80">
          {t("security:reportsDashboard.heroSubtitle")}
        </p>
      </div>
    </div>
  );

  const statusOptions =
    currentReport === "logs" ? LOG_STATUSES : INVENTORY_STATUSES;

  const renderReportDetail = () => {
    const columns = getColumns();
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all">
              <style>{datePickerStyles}</style>
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 px-1 text-slate-700 font-bold w-[135px] cursor-pointer"
                />
                <span className="text-slate-400 font-bold mx-1">
                  {t("common:misc.to")}
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 px-1 text-slate-700 font-bold w-[135px] cursor-pointer"
                />
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" /> Excel
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        <div className="bg-slate-100 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
            {heroTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {t("admin:reports.reportInfo")}
              </h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                  <span className="font-semibold text-slate-500">
                    {t("admin:reports.exportDate")}
                  </span>
                  <span className="font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {t("admin:reports.filterBy")}
              </h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                  <span className="font-semibold text-slate-500">
                    {t("admin:reports.dateRange")}
                  </span>
                  <span className="font-bold">
                    {startDate} {t("common:misc.to")} {endDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                  <span className="font-semibold text-slate-500">
                    {t("admin:reports.statusFilter")}
                  </span>
                  <span className="font-bold">
                    {statusOptions.find((s) => s.value === selectedStatus)?.label ||
                      selectedStatus}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                  <span className="font-semibold text-slate-500">
                    {t("security:reportsDashboard.recordsLabel")}
                  </span>
                  <span className="font-bold">{filteredData.length}</span>
                </div>
              </div>
            </div>
            {categorySummary && Object.keys(categorySummary).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Category Summary
                </h4>
                <div className="space-y-2 text-sm text-slate-700">
                  {Object.entries(categorySummary).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                      <span className="font-semibold text-slate-500">{cat}</span>
                      <span className="font-bold">{count} device{count !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="p-12 text-center">
                      <Loader variant="inline" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="p-12 text-center text-slate-400">
                      {t("common:misc.noRecords")}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rIdx) => (
                    <tr
                      key={row._id || row.id || rIdx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className="p-5 text-slate-700 font-medium">
                          {col.render ? col.render(row) : row[col.accessor] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !loading && (
            <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {t("security:reportsDashboard.showing", {
                  from: (currentPage - 1) * itemsPerPage + 1,
                  to: Math.min(currentPage * itemsPerPage, filteredData.length),
                  total: filteredData.length,
                })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center px-4 font-medium text-sm text-slate-600">
                  {t("security:reportsDashboard.pageOf", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="mt-8 px-1">
        <SelectionGrid />
        {renderReportDetail()}
      </div>
    </MainLayout>
  );
};

export default SecurityReportsDashboard;
