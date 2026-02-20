import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '@/utils/api';
import {
    FileText, Users, Monitor, ShieldAlert, Download, ChevronDown,
    Loader2, ChevronLeft, ChevronRight // 👈 Added ChevronLeft and ChevronRight
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';
import { generatePDF } from '@/utils/pdfGenerator';

// CONSTANTS - Moved inside component for i18n
const CATEGORIES = ['All Categories', 'Laptop', 'Projector', 'Camera', 'Microphone', 'Tablet', 'Audio', 'Accessories', 'Other'];
const COLORS = ['#8D8DC7', '#10b981', '#f59e0b', '#ef4444'];

const ReportsPage = () => {
    const { t } = useTranslation(["admin", "common"]);

    const ROLES = [
        { value: "All Roles", label: t('reports.allRoles') },
        { value: "Student", label: t('common.roles.student') },
        { value: "IT_Staff", label: t('common.roles.itStaff') },
        { value: "Staff", label: t('common.roles.staff') },
        { value: "Admin", label: t('common.roles.admin') }
    ];

    const STATUSES = [
        { value: "All Statuses", label: t('reports.allStatuses') },
        { value: "Active", label: t('users.activeStatus') },
        { value: "Overdue", label: t('users.overdue') },
        { value: "Returned", label: t('users.returned') },
        { value: "Maintenance", label: t('reports.maintenance') || "Maintenance" }
    ];

    const RISK_LEVELS = [
        { value: "All Levels", label: t('reports.allLevels') },
        { value: "Low", label: t('reports.lowRisk') },
        { value: "Medium", label: t('reports.mediumRisk') },
        { value: "High", label: t('reports.highRisk') }
    ];
    
    // Report Mode / State
    const [currentReport, setCurrentReport] = useState('activity');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Date Range State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState("All Statuses");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [selectedRiskLevel, setSelectedRiskLevel] = useState("All Levels");

    // 👇 NEW: Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'System Admin', role: 'Admin' };

    // Reset filters and page when report changes
    const handleReportChange = (report) => {
        setCurrentReport(report);
        setSelectedStatus("All Statuses");
        setSelectedCategory("All Categories");
        setSelectedRole("All Roles");
        setSelectedRiskLevel("All Levels");
        setCurrentPage(1); // Reset page
        setData([]); // Clear data briefly
    };

    // Reset page to 1 whenever any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, selectedCategory, selectedRole, selectedRiskLevel, startDate, endDate]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                let params = { startDate, endDate };

                if (currentReport === 'activity' || currentReport === 'risk') {
                    endpoint = '/reports';
                } else if (currentReport === 'users') {
                    endpoint = '/users';
                } else if (currentReport === 'devices') {
                    endpoint = '/equipment/browse';
                }

                if (endpoint) {
                    const res = await api.get(endpoint, { params });
                    setData(res.data);
                }
            } catch (err) {
                console.error("Reports Fetch Error:", err);
                toast.error("Failed to load report data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentReport, startDate, endDate]); // Refetch on report or date change

    // Filtered Data Logic (Client Side)
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => {
            // Global Date Filter
            const itemDate = new Date(item.dateOut || item.createdAt || item.date || item.updatedAt);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const dateMatch = !isNaN(itemDate.getTime()) ? (itemDate >= start && itemDate <= end) : true;

            // Specific Filters
            if (currentReport === 'activity' || currentReport === 'risk') {
                const statusMatch = selectedStatus === "All Statuses" || item.status === selectedStatus;

                // Risk Assessment: Show activity data filtered by risk level/status/date
                if (currentReport === 'risk') {
                    const score = item.responsibilityScore || (item.status === 'Overdue' ? 40 : 100);
                    let level = "Low";
                    if (score < 50) level = "High";
                    else if (score < 80) level = "Medium";

                    const riskMatch = selectedRiskLevel === "All Levels" || level === selectedRiskLevel;
                    return riskMatch && dateMatch;
                }

                return statusMatch && dateMatch;
            }

            if (currentReport === 'users') {
                const roleMatch = selectedRole === "All Roles" || item.role === selectedRole;
                return roleMatch && dateMatch;
            }

            if (currentReport === 'devices') {
                const statusMatch = selectedStatus === "All Statuses" ||
                    (item.status === selectedStatus) ||
                    (selectedStatus === 'Active' && (item.available > 0 || item.status === 'Available'));
                return statusMatch && dateMatch;
            }

            return true;
        });
    }, [data, currentReport, selectedStatus, selectedRole, selectedCategory, selectedRiskLevel, startDate, endDate]);

    // 👇 NEW: Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
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

    // Stats Calculation
    const stats = useMemo(() => {
        const total = filteredData.length;
        let stat1 = 0, stat2 = 0, stat3 = 0;
        let label1 = "Total", label2 = "Active", label3 = "Overdue";

        if (currentReport === 'users') {
            label1 = "Total Users";
            label2 = "Students";
            label3 = "Staff";
            stat1 = total;
            stat2 = filteredData.filter(u => u.role === 'Student').length;
            stat3 = filteredData.filter(u => u.role === 'Staff' || u.role === 'IT_Staff').length;
        } else if (currentReport === 'devices') {
            label1 = "Total Devices";
            label2 = "Available";
            label3 = "Broken/Maint.";
            stat1 = total;
            stat2 = filteredData.filter(d => d.available > 0 || d.status === 'Available').length;
            stat3 = filteredData.filter(d => d.status === 'Maintenance' || d.status === 'Broken').length;
        } else {
            label1 = "Total Records";
            label2 = "Active";
            label3 = "Overdue";
            stat1 = total;
            stat2 = filteredData.filter(i => i.status === 'Active').length;
            stat3 = filteredData.filter(i => i.status === 'Overdue').length;
        }

        return { total: stat1, active: stat2, overdue: stat3, labelTotal: label1, labelActive: label2, labelOverdue: label3 };
    }, [filteredData, currentReport]);

    // Dynamic Columns Config
    const getColumns = () => {
        switch (currentReport) {
            case 'users':
                return [
                    {
                        header: t('reports.userIdentity'), render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.fullName || row.username}</div>
                                <div className="text-xs text-slate-400">{row.email}</div>
                            </div>
                        )
                    },
                    {
                        header: t('reports.role'), render: (row) => (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.role === 'Student' ? 'bg-gray-100 text-gray-600' :
                                row.role === 'Admin' ? 'bg-slate-800 text-white' :
                                    'bg-blue-50 text-blue-600'
                                }`}>{ROLES.find(r => r.value === row.role)?.label || row.role}</span>
                        )
                    },
                    { header: t('reports.department'), accessor: "department", render: (row) => row.department || "N/A" },
                    {
                        header: t('reports.score'), render: (row) => (
                            <span className={`font-bold ${!row.responsibilityScore || row.responsibilityScore >= 80 ? 'text-emerald-500' : row.responsibilityScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                                {row.responsibilityScore ?? 100}%
                            </span>
                        )
                    },
                    {
                        header: t('reports.statusFilter'), render: (row) => (
                            <span className={`text-xs font-bold ${row.status === 'Inactive' ? 'text-red-500' : 'text-emerald-600'}`}>
                                {STATUSES.find(s => s.value === row.status)?.label || row.status || 'Active'}
                            </span>
                        )
                    }
                ];
            case 'devices':
                return [
                    { header: t('reports.deviceName'), render: (row) => <div className="font-bold text-slate-900">{row.name}</div> },
                    { header: t('reports.category'), accessor: "category", render: (row) => row.category || row.type || "N/A" },
                    { header: t('reports.serialNumber'), accessor: "serialNumber", render: (row) => <span className="font-mono text-xs">{row.serialNumber || (row.id || row._id || "").slice(-6)}</span> },
                    { header: t('reports.location'), accessor: "location", render: (row) => row.location || t('reports.mainStorage') },
                    {
                        header: t('reports.statusFilter'), render: (row) => (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${(row.available > 0 || row.status === 'Available' || row.status === 'Active') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {(row.available > 0 || row.status === 'Available' || row.status === 'Active') ? t('users.activeStatus') : (STATUSES.find(s => s.value === row.status)?.label || row.status || 'Unavailable')}
                            </span>
                        )
                    }
                ];
            case 'risk':
                return [
                    {
                        header: t('reports.userIdentity'), render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.user?.username || row.user || "Unknown User"}</div>
                                <div className="text-xs text-slate-400">{row.user?.email || row.email || "N/A"}</div>
                            </div>
                        )
                    },
                    {
                        header: t('reports.riskLevel'), render: (row) => {
                            const score = row.responsibilityScore || (row.status === 'Overdue' ? 40 : 100);
                            let level = t('reports.lowRisk');
                            let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
                            if (score < 50) {
                                level = t('reports.highRisk');
                                color = "text-rose-600 bg-rose-50 border-rose-100";
                            } else if (score < 80) {
                                level = t('reports.mediumRisk');
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
                        header: t('reports.riskScore'), render: (row) => {
                            const score = row.responsibilityScore || (row.status === 'Overdue' ? 40 : 100);
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
                        header: t('reports.statusFilter'), render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {STATUSES.find(s => s.value === row.status)?.label || row.status}
                            </span>
                        )
                    }
                ];
            case 'activity':
            default:
                return [
                    {
                        header: t('reports.item'), render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.item || row.equipment?.name || "Unknown Item"}</div>
                                <div className="text-xs text-slate-400">ID: {(row.id || "").slice(-6)}</div>
                            </div>
                        )
                    },
                    {
                        header: t('reports.user'), render: (row) => (
                            <div>
                                <div className="font-medium text-slate-700">{row.user?.username || row.user || "Unknown"}</div>
                                <div className="text-xs text-slate-400">{ROLES.find(r => r.value === (row.role || row.user?.role))?.label || row.role || row.user?.role || "User"}</div>
                            </div>
                        )
                    },
                    { header: t('reports.date'), render: (row) => row.dateOut ? new Date(row.dateOut).toLocaleDateString() : "N/A" },
                    {
                        header: t('reports.statusFilter'), render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {STATUSES.find(s => s.value === row.status)?.label || row.status}
                            </span>
                        )
                    }
                ];
        }
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) return toast.error("No data to export!");

        const formattedForPdf = filteredData.map(row => ({
            createdAt: row.dateOut || row.createdAt || new Date().toISOString(),
            status: row.status || 'Active',
            equipment: {
                name: row.item || row.name || row.equipment?.name || "N/A",
                serialNumber: (row.id || row._id || "").slice(-6).toUpperCase(),
                category: row.category || row.type || "N/A"
            },
            user: {
                username: row.user?.username || row.user || row.fullName || "N/A",
                email: row.email || "N/A"
            }
        }));

        generatePDF(formattedForPdf, currentUser, `${currentReport.toUpperCase()} ${t('reports.title').toUpperCase()}`);
    };

    const handleExportExcel = async () => {
        if (filteredData.length === 0) return toast.error("No data to export!");

        try {
            const headers = getColumns().map(c => c.header).join(',');
            const rows = filteredData.map(row => {
                const columns = getColumns();
                return columns.map(col => {
                    if (col.accessor) return row[col.accessor] || "N/A";
                    if (currentReport === 'users') return row.fullName || row.username || row.email;
                    if (currentReport === 'devices') return row.name || row.serialNumber;
                    return row.item || row.equipment?.name || "N/A";
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

    // --- COMPONENTS ---

    const LandingCard = ({ title, desc, icon: Icon, color, onClick, isSelected }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-6 bg-white border rounded-2xl transition-all duration-300 group text-left w-full relative overflow-hidden ${isSelected
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20 translate-y-[-2px]'
                : 'border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                }`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50 rounded-bl-full -mr-4 -mt-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${color} ${isSelected ? 'scale-110 shadow-md' : 'group-hover:scale-110'} duration-300 relative z-10`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className={`text-lg font-bold mb-1 relative z-10 ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed relative z-10">{desc}</p>
        </button>
    );

    const SelectionGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <LandingCard title={t('reports.activityLogs')} desc={t('reports.transactionsHistory')} icon={FileText} color="bg-slate-900" onClick={() => handleReportChange('activity')} isSelected={currentReport === 'activity'} />
            <LandingCard title={t('reports.userDirectory')} desc={t('reports.usersAndRoles')} icon={Users} color="bg-slate-900" onClick={() => handleReportChange('users')} isSelected={currentReport === 'users'} />
            <LandingCard title={t('reports.deviceInventory')} desc={t('reports.equipmentStatus')} icon={Monitor} color="bg-slate-900" onClick={() => handleReportChange('devices')} isSelected={currentReport === 'devices'} />
            <LandingCard title={t('reports.riskAssessment')} desc={t('reports.borrowingRisks')} icon={ShieldAlert} color="bg-slate-900" onClick={() => handleReportChange('risk')} isSelected={currentReport === 'risk'} />
        </div>
    );

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 mt-4 relative z-10 w-full text-white">
            <div>
                <h1 className="text-4xl font-bold mb-2">
                    {currentReport === 'activity' && t('reports.activityReports')}
                    {currentReport === 'users' && t('reports.userReports')}
                    {currentReport === 'devices' && t('reports.deviceInventory')}
                    {currentReport === 'risk' && t('reports.riskAnalysis')}
                </h1>
                <p className="text-blue-100 max-w-2xl opacity-80">
                    {t('reports.subtitle')}
                </p>
            </div>
        </div>
    );

    const renderReportDetail = () => {
        const columns = getColumns();

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2">
                    <div className="flex items-center gap-3">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-bold w-[110px]"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-700 font-bold w-[110px]"
                                />
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Status / Role / Category / Risk Filter */}
                        <div className="relative">
                            {currentReport === 'users' ? (
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                                </select>
                            ) : currentReport === 'devices' ? (
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {STATUSES.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                            ) : currentReport === 'risk' ? (
                                <select value={selectedRiskLevel} onChange={(e) => setSelectedRiskLevel(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {RISK_LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                                </select>
                            ) : (
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {STATUSES.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                            )}
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Exports */}
                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                            <Download className="w-4 h-4" /> Excel
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Report Info Block (Gray Header) */}
                <div className="bg-slate-100 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 capitalize">
                        {currentReport === 'activity' && t('reports.activityReports')}
                        {currentReport === 'users' && t('reports.userReports')}
                        {currentReport === 'devices' && t('reports.deviceInventory')}
                        {currentReport === 'risk' && t('reports.riskAnalysis')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Column 1: Report Info */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('reports.reportInfo')}</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('reports.exportDate')}</span>
                                    <span className="font-bold">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Filter By */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('reports.filterBy')}</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('reports.dateRange')}</span>
                                    <span className="font-bold">{startDate} {t('common.to')} {endDate}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">{t('reports.statusFilter')}</span>
                                    <span className="font-bold text-capitalize">
                                        {currentReport === 'risk'
                                            ? (RISK_LEVELS.find(r => r.value === selectedRiskLevel)?.label || selectedRiskLevel)
                                            : (STATUSES.find(s => s.value === selectedStatus)?.label || selectedStatus)}
                                    </span>
                                </div>
                                {currentReport === 'users' && (
                                    <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                        <span className="font-semibold text-slate-500">{t('reports.roleFilter')}</span>
                                        <span className="font-bold">{ROLES.find(r => r.value === selectedRole)?.label || selectedRole}</span>
                                    </div>
                                )}
                                {currentReport === 'devices' && (
                                    <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                        <span className="font-semibold text-slate-500">{t('reports.categoryFilter')}</span>
                                        <span className="font-bold">{selectedCategory}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
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
                                    <tr><td colSpan={columns.length} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-12 text-center text-slate-400">{t('common.noRecords') || "No records found."}</td></tr>
                                ) : (
                                    // 👇 NOW USING paginatedData INSTEAD OF filteredData
                                    paginatedData.map((row, rIdx) => (
                                        <tr key={row.id || row._id || rIdx} className="hover:bg-slate-50 transition-colors group">
                                            {columns.map((col, cIdx) => (
                                                <td key={cIdx} className="p-5">
                                                    {col.render ? col.render(row) : (row[col.accessor] || "N/A")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 👇 NEW: PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrevPage} 
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center px-4 font-medium text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button 
                                    onClick={handleNextPage} 
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
        <AdminLayout heroContent={HeroSection}>
            <div className="mt-8 px-1">
                <SelectionGrid />
                {renderReportDetail()}
            </div>
        </AdminLayout>
    );
};

export default ReportsPage;