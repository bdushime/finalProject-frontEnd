import React, { useState, useEffect, useMemo } from 'react';
import ITStaffLayout from '@/components/layout/ITStaffLayout';
import api from '@/utils/api';
import {
    FileText, Monitor, ShieldAlert, Download, ChevronDown,
    Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { generatePDF } from '@/utils/pdfGenerator';

const datePickerStyles = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.3);
    padding: 2px;
  }
`;

const SimpleReports = () => {
    const { t } = useTranslation(["admin", "itstaff", "common"]);

    // Report Mode / State
    const [currentReport, setCurrentReport] = useState('activity');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    // Date Range State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState("All Statuses");
    const [selectedRiskLevel, setSelectedRiskLevel] = useState("All Levels");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'IT Staff', role: 'Staff' };

    // Define options dynamically inside render to safely use translation hook
    const STATUSES = [
        { value: "All Statuses", label: t('reports.allStatuses', 'All Statuses') },
        { value: "Active", label: t('users.activeStatus', 'Active') },
        { value: "Overdue", label: t('dashboard.status.overdue', 'Overdue') },
        { value: "Returned", label: t('dashboard.status.returned', 'Returned') },
        { value: "Maintenance", label: t('reports.maintenance', 'Maintenance') },
        { value: "Checked Out", label: t('reports.checkedOut', 'Checked Out') }
    ];

    const RISK_LEVELS = [
        { value: "All Levels", label: t('reports.allLevels', 'All Levels') },
        { value: "Low", label: t('reports.lowRisk', 'Low') },
        { value: "Medium", label: t('reports.mediumRisk', 'Medium') },
        { value: "High", label: t('reports.highRisk', 'High') }
    ];

    const handleReportChange = (report) => {
        setCurrentReport(report);
        setSelectedStatus("All Statuses");
        setSelectedRiskLevel("All Levels");
        setCurrentPage(1);
        setData([]);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, selectedRiskLevel, startDate, endDate]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                if (currentReport === 'activity' || currentReport === 'risk') {
                    endpoint = '/transactions/all-history';
                } else if (currentReport === 'devices') {
                    endpoint = '/equipment/browse';
                }

                if (endpoint) {
                    const res = await api.get(endpoint);
                    console.log(`Fetched data for ${currentReport}:`, res.data); // Debug log
                    
                    // 👇 THE PAGINATION FIX: Added res.data.items check
                    if (Array.isArray(res.data)) {
                        setData(res.data);
                    } else if (res.data && Array.isArray(res.data.items)) {
                        setData(res.data.items);
                    } else if (res.data && Array.isArray(res.data.data)) {
                        setData(res.data.data);
                    } else {
                        setData([]);
                    }
                }
            } catch (err) {
                console.error("Reports Fetch Error:", err);
                toast.error(t('itstaff:reports.error', "Failed to load report data."));
                setData([]); // Ensure data is empty array on fail, not undefined
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentReport, t]);

    // Filtered Data Logic
    const filteredData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        
        return data.filter(item => {
            // Safely parse dates, ignoring nulls
            const rawDate = item.dateOut || item.createdAt || item.startTime || item.date || item.updatedAt;
            let dateMatch = true;

            if (rawDate) {
                const itemDate = new Date(rawDate).setHours(0,0,0,0);
                const start = new Date(startDate).setHours(0,0,0,0);
                const end = new Date(endDate).setHours(23,59,59,999);
                dateMatch = !isNaN(itemDate) ? (itemDate >= start && itemDate <= end) : true;
            }

            if (currentReport === 'activity' || currentReport === 'risk') {
                const statusMatch = selectedStatus === "All Statuses" || item.status === selectedStatus;

                if (currentReport === 'risk') {
                    const score = item.user?.responsibilityScore || (item.status === 'Overdue' ? 40 : 100);
                    let level = "Low";
                    if (score < 50) level = "High";
                    else if (score < 80) level = "Medium";

                    const riskMatch = selectedRiskLevel === "All Levels" || level === selectedRiskLevel;
                    return riskMatch && dateMatch;
                }

                return statusMatch && dateMatch;
            }

            if (currentReport === 'devices') {
                const statusMatch = selectedStatus === "All Statuses" ||
                    (item.status === selectedStatus) ||
                    (selectedStatus === 'Active' && (item.available > 0 || item.status === 'Available'));
                return statusMatch && dateMatch;
            }

            return true;
        });
    }, [data, currentReport, selectedStatus, selectedRiskLevel, startDate, endDate]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const getColumns = () => {
        switch (currentReport) {
            case 'devices':
                return [
                    { header: t('admin:reports.deviceName', 'Device Name'), render: (row) => <div className="font-bold text-slate-900">{row.name || row.item || row.equipment?.name || "N/A"}</div> },
                    { header: t('admin:reports.category', 'Category'), accessor: "category", render: (row) => row.category || row.type || row.equipment?.category || row.equipment?.type || "N/A" },
                    { header: t('admin:reports.serialNumber', 'Serial Number'), accessor: "serialNumber", render: (row) => <span className="font-mono text-xs">{row.serialNumber || row.equipment?.serialNumber || (row.id || row._id || "").slice(-6)}</span> },
                    { header: t('admin:reports.location', 'Location'), accessor: "location", render: (row) => row.location || row.equipment?.location || t('admin:reports.mainStorage', 'Main Storage') },
                    {
                        header: t('admin:reports.statusFilter', 'Status'), render: (row) => (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${(row.available > 0 || row.status === 'Available' || row.status === 'Active') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {(row.available > 0 || row.status === 'Available' || row.status === 'Active') ? t('common:users.activeStatus', 'Active') : (STATUSES.find(s => s.value === row.status)?.label || row.status || 'Unavailable')}
                            </span>
                        )
                    }
                ];
            case 'risk':
                return [
                    {
                        header: t('admin:reports.userIdentity', 'User Identity'), render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.user?.username || row.user || "Unknown User"}</div>
                                <div className="text-xs text-slate-400">{row.user?.email || row.email || "N/A"}</div>
                            </div>
                        )
                    },
                    {
                        header: t('admin:reports.riskLevel', 'Risk Level'), render: (row) => {
                            const score = row.user?.responsibilityScore || (row.status === 'Overdue' ? 40 : 100);
                            let level = t('admin:reports.lowRisk', 'Low');
                            let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
                            if (score < 50) {
                                level = t('admin:reports.highRisk', 'High');
                                color = "text-rose-600 bg-rose-50 border-rose-100";
                            } else if (score < 80) {
                                level = t('admin:reports.mediumRisk', 'Medium');
                                color = "text-orange-600 bg-orange-50 border-orange-100";
                            }
                            return (
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${color}`}>
                                    {level}
                                </span>
                            );
                        }
                    },
                    {
                        header: t('admin:reports.riskScore', 'Risk Score'), render: (row) => {
                            const score = row.user?.responsibilityScore || (row.status === 'Overdue' ? 40 : 100);
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${score < 50 ? 'bg-rose-500' : score < 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${score}%` }}
                                        ></div>
                                    </div>
                                    <span className={`font-bold text-sm ${score < 50 ? 'text-rose-500' : score < 80 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                        {score}%
                                    </span>
                                </div>
                            );
                        }
                    },
                    {
                        header: t('admin:reports.statusFilter', 'Status'), render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {STATUSES.find(s => s.value === row.status)?.label || row.status || 'Unknown'}
                            </span>
                        )
                    }
                ];
            case 'activity':
            default:
                return [
                    {
                        header: t('admin:reports.item', 'Item'), render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.equipment?.name || row.item || "Unknown Item"}</div>
                                <div className="text-xs text-slate-400">ID: {(row.equipment?._id || row.id || row._id || "").slice(-6)}</div>
                            </div>
                        )
                    },
                    {
                        header: t('admin:reports.user', 'User'), render: (row) => (
                            <div>
                                <div className="font-medium text-slate-700">{row.user?.username || row.user || "Unknown"}</div>
                                <div className="text-xs text-slate-400">{row.user?.role || "User"}</div>
                            </div>
                        )
                    },
                    {
                        header: t('itstaff:reports.table.borrowed', 'Borrowed Date'), render: (row) => {
                            const date = row.startTime || row.dateOut || row.createdAt || row.date;
                            return date ? new Date(date).toLocaleDateString() : "N/A";
                        }
                    },
                    {
                        header: t('itstaff:reports.table.returned', 'Returned Date'), render: (row) => {
                            const date = row.actualReturnTime || row.expectedReturnTime || row.updatedAt;
                            return date ? new Date(date).toLocaleDateString() : "N/A";
                        }
                    },
                    {
                        header: t('admin:reports.statusFilter', 'Status'), render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        row.status === 'Checked Out' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {STATUSES.find(s => s.value === row.status)?.label || row.status || 'Unknown'}
                            </span>
                        )
                    }
                ];
        }
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) return toast.error(t('itstaff:reports.messages.noData', "No data to export!"));

        const formattedForPdf = filteredData.map(row => ({
            createdAt: row.dateOut || row.createdAt || row.startTime || new Date().toISOString(),
            expectedReturnTime: row.actualReturnTime || row.expectedReturnTime || row.updatedAt,
            status: row.status || 'Active',
            equipment: {
                name: row.item || row.name || row.equipment?.name || "N/A",
                serialNumber: (row.id || row._id || "").slice(-6).toUpperCase(),
                category: row.category || row.type || "N/A"
            },
            user: {
                username: row.user?.username || row.user || row.fullName || "N/A",
                email: row.user?.email || row.email || "N/A"
            }
        }));

        generatePDF(formattedForPdf, currentUser, `${currentReport.toUpperCase()} ${t('admin:reports.title', 'REPORT').toUpperCase()}`);
    };

    const handleExportExcel = async () => {
        if (filteredData.length === 0) return toast.error(t('itstaff:reports.messages.noData', "No data to export!"));

        try {
            const cols = getColumns();
            const headers = cols.map(c => c.header).join(',');

            const rows = filteredData.map(row => {
                return cols.map(col => {
                    let val = col.accessor ? row[col.accessor] : null;

                    if (col.header === t('itstaff:reports.table.borrowed', 'Borrowed Date')) return val || row.createdAt || row.dateOut || row.startTime || "N/A";
                    if (col.header === t('itstaff:reports.table.returned', 'Returned Date')) return val || row.actualReturnTime || row.expectedReturnTime || row.updatedAt || "N/A";
                    if (col.header === t('admin:reports.category', 'Category')) return val || row.type || row.equipment?.category || row.equipment?.type || "N/A";
                    if (col.header === t('admin:reports.serialNumber', 'Serial Number')) return val || row.equipment?.serialNumber || (row.id || row._id || "").slice(-6);
                    if (col.header === t('admin:reports.location', 'Location')) return val || row.equipment?.location || t('admin:reports.mainStorage', 'Main Storage');
                    if (col.header === t('admin:reports.deviceName', 'Device Name')) return val || row.name || row.item || row.equipment?.name || "N/A";
                    if (col.header === t('admin:reports.item', 'Item')) return val || row.name || row.item || row.equipment?.name || "N/A";
                    if (col.header === t('admin:reports.user', 'User')) return val || row.user?.username || row.user || row.fullName || "N/A";
                    if (col.header === t('admin:reports.statusFilter', 'Status')) return val || row.status || "N/A";

                    return val || "N/A";
                }).join(',');
            }).join('\n');

            const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${currentReport}_report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            toast.success("Excel (CSV) Export Successful");
        } catch (e) {
            console.error(e);
            toast.error("Export failed");
        }
    };

    const LandingCard = ({ title, desc, icon: Icon, color, onClick, isSelected }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-6 bg-white border rounded-2xl transition-all duration-300 group text-left w-full relative overflow-hidden ${isSelected
                ? 'border-[#0b1d3a] shadow-lg ring-2 ring-[#0b1d3a]/20 translate-y-[-2px]'
                : 'border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                }`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50 rounded-bl-full -mr-4 -mt-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${color} ${isSelected ? 'scale-110 shadow-md' : 'group-hover:scale-110'} duration-300 relative z-10`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className={`text-lg font-bold mb-1 relative z-10 ${isSelected ? 'text-[#0b1d3a]' : 'text-slate-900'}`}>{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed relative z-10">{desc}</p>
        </button>
    );

    const SelectionGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <LandingCard title={t('admin:reports.activityLogs', 'Activity Logs')} desc={t('admin:reports.transactionsHistory', 'History')} icon={FileText} color="bg-[#0b1d3a]" onClick={() => handleReportChange('activity')} isSelected={currentReport === 'activity'} />
            <LandingCard title={t('admin:reports.deviceInventory', 'Device Inventory')} desc={t('admin:reports.equipmentStatus', 'Status')} icon={Monitor} color="bg-[#0b1d3a]" onClick={() => handleReportChange('devices')} isSelected={currentReport === 'devices'} />
            <LandingCard title={t('admin:reports.riskAssessment', 'Risk Assessment')} desc={t('admin:reports.borrowingRisks', 'Risks')} icon={ShieldAlert} color="bg-[#0b1d3a]" onClick={() => handleReportChange('risk')} isSelected={currentReport === 'risk'} />
        </div>
    );

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 mt-4 relative z-10 w-full text-slate-800">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">
                    {currentReport === 'activity' && t('admin:reports.activityReports', 'Activity Reports')}
                    {currentReport === 'devices' && t('admin:reports.deviceInventory', 'Device Inventory')}
                    {currentReport === 'risk' && t('admin:reports.riskAnalysis', 'Risk Analysis')}
                </h1>
                <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                    {t('admin:reports.subtitle', 'View and export specific system reports')}
                </p>
            </div>
        </div>
    );

    const renderReportDetail = () => {
        const columns = getColumns();

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all">
                            <style>{datePickerStyles}</style>
                            <FileText className="w-4 h-4 text-[#0b1d3a]" />
                            <div className="flex items-center gap-1 text-sm font-medium text-slate-800">
                                <div className="flex items-center gap-1 group relative">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none focus:ring-0 px-1 text-slate-700 font-bold w-[135px] cursor-pointer" />
                                </div>
                                <span className="text-slate-400 font-bold mx-1">{t('common:misc.to', 'to')}</span>
                                <div className="flex items-center gap-1 group relative">
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none focus:ring-0 px-1 text-slate-700 font-bold w-[135px] cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {currentReport === 'risk' ? (
                                <select value={selectedRiskLevel} onChange={(e) => setSelectedRiskLevel(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1d3a] transition-all cursor-pointer shadow-sm">
                                    {RISK_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                                </select>
                            ) : (
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1d3a] transition-all cursor-pointer shadow-sm">
                                    {STATUSES.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                            )}
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                            <Download className="w-4 h-4" /> Excel
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-[#0b1d3a] text-white rounded-lg text-sm font-bold hover:bg-[#0b1d3a]/90 transition-colors shadow-lg shadow-slate-900/10">
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                <div className="bg-slate-100 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 capitalize">
                        {currentReport === 'activity' && t('admin:reports.activityReports', 'Activity Reports')}
                        {currentReport === 'devices' && t('admin:reports.deviceInventory', 'Device Inventory')}
                        {currentReport === 'risk' && t('admin:reports.riskAnalysis', 'Risk Analysis')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('admin:reports.reportInfo', 'Report Info')}</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('admin:reports.exportDate', 'Export Date')}</span>
                                    <span className="font-bold">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('admin:reports.filterBy', 'Filter By')}</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('admin:reports.dateRange', 'Date Range')}</span>
                                    <span className="font-bold">{startDate} {t('common:misc.to', 'to')} {endDate}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('admin:reports.statusFilter', 'Status')}</span>
                                    <span className="font-bold text-capitalize">
                                        {currentReport === 'risk'
                                            ? (RISK_LEVELS.find(r => r.value === selectedRiskLevel)?.label || selectedRiskLevel)
                                            : (STATUSES.find(s => s.value === selectedStatus)?.label || selectedStatus)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={columns.length} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0b1d3a]" /></td></tr>
                                ) : (!Array.isArray(paginatedData) || paginatedData.length === 0) ? (
                                    <tr><td colSpan={columns.length} className="p-12 text-center text-slate-400">{t('common:misc.noRecords', 'No records found.')}</td></tr>
                                ) : (
                                    paginatedData.map((row, rIdx) => (
                                        <tr key={row.id || row._id || rIdx} className="hover:bg-slate-50 transition-colors group">
                                            {columns.map((col, cIdx) => (
                                                <td key={cIdx} className="p-5 text-slate-700 font-medium whitespace-nowrap">
                                                    {col.render ? col.render(row) : (row[col.accessor] || "N/A")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
                            </p>
                            <div className="flex gap-2">
                                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                <div className="flex items-center px-4 font-medium text-sm text-slate-600">Page {currentPage} of {totalPages}</div>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <ITStaffLayout>
            <div className="px-1 mt-4">
                {HeroSection}
                <SelectionGrid />
                {renderReportDetail()}
            </div>
        </ITStaffLayout>
    );
};

export default SimpleReports;