import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '@/utils/api';
import { Download, FileText, Users, Monitor, ShieldAlert, Loader2, ChevronDown } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

// CONSTANTS
const ROLES = ["All Roles", "Student", "IT_Staff", "Staff", "Admin"];
const STATUSES = ["All Statuses", "Active", "Overdue", "Returned", "Lost", "Maintenance", "Damaged", "Stolen", "Inactive"];
const TIME_RANGES = ["Last 30 Days", "Today", "This Week", "This Year"];
const CATEGORIES = ['All Categories', 'Laptop', 'Projector', 'Camera', 'Microphone', 'Tablet', 'Audio', 'Accessories', 'Other'];

const ReportsPage = () => {
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
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedRole, setSelectedRole] = useState("All Roles");

    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'System Admin', role: 'Admin' };

    // Reset filters when report changes
    const handleReportChange = (report) => {
        setCurrentReport(report);
        setSelectedStatus("All Statuses");
        setSelectedCategory("All Categories");
        setSelectedRole("All Roles");
        setData([]); // Clear data briefly
    };

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let res;
                let endpoint = '';
                let params = {};

                if (currentReport === 'activity' || currentReport === 'risk') {
                    endpoint = '/reports';
                    params = { startDate, endDate };
                } else if (currentReport === 'users') {
                    endpoint = '/users';
                } else if (currentReport === 'devices') {
                    endpoint = '/equipment/browse';
                }

                if (endpoint) {
                    res = await api.get(endpoint, { params });
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
            // Common Filters
            if (currentReport === 'activity' || currentReport === 'risk') {
                const itemDate = new Date(item.dateOut || item.createdAt || item.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                const dateMatch = !isNaN(itemDate) ? (itemDate >= start && itemDate <= end) : true;
                const statusMatch = selectedStatus === "All Statuses" || item.status === selectedStatus;

                // Risk Assessment: Show activity data filtered by status/date
                if (currentReport === 'risk') {
                    return statusMatch && dateMatch;
                }

                return statusMatch && dateMatch;
            }

            if (currentReport === 'users') {
                const roleMatch = selectedRole === "All Roles" || item.role === selectedRole;
                // Users might not have 'status' field consistent with 'selectedStatus' unless mapped
                // Let's assume 'Active' / 'Inactive' if available, otherwise ignore status filter for users for now
                return roleMatch;
            }

            if (currentReport === 'devices') {
                const catMatch = selectedCategory === "All Categories" || (item.category || item.type) === selectedCategory;
                // Allow status filter for devices too? 
                const statusMatch = selectedStatus === "All Statuses" || item.status === selectedStatus;
                return catMatch && statusMatch;
            }

            return true;
        });
    }, [data, currentReport, selectedStatus, selectedRole, selectedCategory]);

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
            label3 = "Offline"; // or In Use?
            stat1 = total;
            stat2 = filteredData.filter(d => d.available > 0 || d.status === 'Available').length;
            stat3 = filteredData.filter(d => d.status === 'Maintenance' || d.status === 'Broken').length;
        } else {
            // Activity / Risk
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
                        header: "User Identity", render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.fullName || row.username}</div>
                                <div className="text-xs text-slate-400">{row.email}</div>
                            </div>
                        )
                    },
                    {
                        header: "Role", render: (row) => (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.role === 'Student' ? 'bg-gray-100 text-gray-600' :
                                row.role === 'Admin' ? 'bg-slate-800 text-white' :
                                    'bg-blue-50 text-blue-600'
                                }`}>{row.role}</span>
                        )
                    },
                    { header: "Department", accessor: "department", render: (row) => row.department || "N/A" },
                    {
                        header: "Score", render: (row) => (
                            <span className={`font-bold ${!row.responsibilityScore || row.responsibilityScore >= 80 ? 'text-emerald-500' : row.responsibilityScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>
                                {row.responsibilityScore ?? 100}%
                            </span>
                        )
                    },
                    {
                        header: "Status", render: (row) => (
                            <span className={`text-xs font-bold ${row.status === 'Inactive' ? 'text-red-500' : 'text-emerald-600'}`}>
                                {row.status || 'Active'}
                            </span>
                        )
                    }
                ];
            case 'devices':
                return [
                    { header: "Device Name", render: (row) => <div className="font-bold text-slate-900">{row.name}</div> },
                    { header: "Category", accessor: "category", render: (row) => row.category || row.type || "N/A" },
                    { header: "Serial Number", accessor: "serialNumber", render: (row) => <span className="font-mono text-xs">{row.serialNumber || (row.id || row._id || "").slice(-6)}</span> },
                    { header: "Location", accessor: "location", render: (row) => row.location || "Main Storage" },
                    {
                        header: "Status", render: (row) => (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${(row.available > 0 || row.status === 'Available') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {row.available > 0 || row.status === 'Available' ? 'Available' : row.status || 'Unavailable'}
                            </span>
                        )
                    }
                ];
            case 'risk':
                return [
                    {
                        header: "User Identity", render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.user?.username || row.user || "Unknown User"}</div>
                                <div className="text-xs text-slate-400">{row.user?.email || row.email || "N/A"}</div>
                            </div>
                        )
                    },
                    {
                        header: "Risk Level", render: (row) => {
                            const score = row.responsibilityScore || (row.status === 'Overdue' ? 40 : 100);
                            let level = "Low";
                            let color = "text-emerald-600 bg-emerald-50 border-emerald-100";
                            if (score < 50) {
                                level = "High";
                                color = "text-rose-600 bg-rose-50 border-rose-100";
                            } else if (score < 80) {
                                level = "Medium";
                                color = "text-orange-600 bg-orange-50 border-orange-100";
                            }
                            return (
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${color}`}>
                                    {level} Risk
                                </span>
                            );
                        }
                    },
                    {
                        header: "Risk Score", render: (row) => {
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
                        header: "Status", render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {row.status}
                            </span>
                        )
                    }
                ];
            case 'activity':
            default:
                return [
                    {
                        header: "Item", render: (row) => (
                            <div>
                                <div className="font-bold text-slate-900">{row.item || row.equipment?.name || "Unknown Item"}</div>
                                <div className="text-xs text-slate-400">ID: {(row.id || "").slice(-6)}</div>
                            </div>
                        )
                    },
                    {
                        header: "User", render: (row) => (
                            <div>
                                <div className="font-medium text-slate-700">{row.user?.username || row.user || "Unknown"}</div>
                                <div className="text-xs text-slate-400">{row.role || row.user?.role || "User"}</div>
                            </div>
                        )
                    },
                    { header: "Date", render: (row) => row.dateOut ? new Date(row.dateOut).toLocaleDateString() : "N/A" },
                    {
                        header: "Status", render: (row) => (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                row.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    row.status === 'Returned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {row.status}
                            </span>
                        )
                    }
                ];
        }
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) return toast.error("No data to export!");

        // Adapt data for PDF Layout
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

        generatePDF(formattedForPdf, currentUser, `${currentReport.toUpperCase()} REPORT`);
    };

    const handleExportExcel = async () => {
        if (filteredData.length === 0) return toast.error("No data to export!");

        try {
            // Generate CSV from filtered data
            const headers = getColumns().map(c => c.header).join(',');
            const rows = filteredData.map(row => {
                const columns = getColumns();
                return columns.map(col => {
                    // For simplicity, we just extract text or accessor
                    if (col.accessor) return row[col.accessor] || "N/A";
                    // If it's a render function, we'd need to extract text which is complex.
                    // Let's use a simplified approach for Excel export
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
            <LandingCard title="Activity Logs" desc="Transactions & History" icon={FileText} color="bg-slate-900" onClick={() => handleReportChange('activity')} isSelected={currentReport === 'activity'} />
            <LandingCard title="User Directory" desc="Users & Roles" icon={Users} color="bg-slate-900" onClick={() => handleReportChange('users')} isSelected={currentReport === 'users'} />
            <LandingCard title="Device Inventory" desc="Equipment Status" icon={Monitor} color="bg-slate-900" onClick={() => handleReportChange('devices')} isSelected={currentReport === 'devices'} />
            <LandingCard title="Risk Assessment" desc="Borrowing Risks" icon={ShieldAlert} color="bg-slate-900" onClick={() => handleReportChange('risk')} isSelected={currentReport === 'risk'} />
        </div>
    );

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 mt-4 relative z-10 w-full text-white">
            <div>
                <h1 className="text-4xl font-bold mb-2">
                    {currentReport === 'activity' && "Activity Reports"}
                    {currentReport === 'users' && "User Reports"}
                    {currentReport === 'devices' && "Device Inventory"}
                    {currentReport === 'risk' && "Risk Analysis"}
                </h1>
                <p className="text-blue-100 max-w-2xl opacity-80">
                    Detailed analysis and exportable logs for system auditing.
                </p>
            </div>
            <div className="flex flex-col gap-4 items-end mt-4 md:mt-0">
                {/* Timeline removed per user request */}
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
                        {/* Date Range Picker (Only for Activity/Risk) */}
                        {(currentReport === 'activity' || currentReport === 'risk') && (
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
                        )}

                        {/* Status / Role / Category Filter based on Report */}
                        <div className="relative">
                            {currentReport === 'users' ? (
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {ROLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : currentReport === 'devices' ? (
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ) : (
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-4 pr-10 py-2.5 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 capitalize">{currentReport} Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Column 1: Report Info */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Report Info:</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">Export Date:</span>
                                    <span className="font-bold">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Filter By */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Filter By:</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                {(currentReport === 'activity' || currentReport === 'risk') && (
                                    <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                        <span className="font-semibold text-slate-500">Date Range:</span>
                                        <span className="font-bold">{startDate} to {endDate}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                    <span className="font-semibold text-slate-500">Status:</span>
                                    <span className="font-bold">{selectedStatus}</span>
                                </div>
                                {currentReport === 'users' && (
                                    <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                        <span className="font-semibold text-slate-500">Role:</span>
                                        <span className="font-bold">{selectedRole}</span>
                                    </div>
                                )}
                                {currentReport === 'devices' && (
                                    <div className="flex justify-between border-b border-slate-200 pb-1 border-dashed">
                                        <span className="font-semibold text-slate-500">Category:</span>
                                        <span className="font-bold">{selectedCategory}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
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
                                    <tr><td colSpan={columns.length} className="p-12 text-center text-slate-400">No records found.</td></tr>
                                ) : (
                                    filteredData.map((row, rIdx) => (
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