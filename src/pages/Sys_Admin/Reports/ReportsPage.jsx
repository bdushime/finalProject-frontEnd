import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import api from '@/utils/api';
import { Search, Filter, Download, FileText, BarChart3, Table, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// 👇 1. IMPORT GENERATOR
import { generatePDF } from '@/utils/pdfGenerator';

// CONSTANTS
const ROLES = ["All Users", "Student", "Staff", "Admin"]; // Updated to "All Users" to match UI text but logic remains role-based or we can treat as user type
const STATUSES = ["All Statuses", "Active", "Overdue", "Returned", "Lost", "Maintenance", "Damaged", "Stolen"];
const TIME_RANGES = ["Last 30 Days", "Today", "This Week", "This Year"];
const CATEGORIES = ["All Categories", "Laptops", "Cameras", "Audio", "Cables", "Tablets", "Accessories"]; // Mock categories for filter
const ROLES = ["All Roles", "Student", "IT_Staff", "Security"];
const TABS = ["Active", "Overdue", "Returned", "Lost/Damaged"];
const TIME_RANGES = ["View All Time", "Today", "This Week"];
const COLORS = ['#8D8DC7', '#10b981', '#f59e0b', '#ef4444'];

const ReportsPage = () => {
    const [reportMode, setReportMode] = useState('admin');
    const [activeTab, setActiveTab] = useState("Active");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
// Filters
    const [selectedStatus, setSelectedStatus] = useState("All Statuses");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedRole, setSelectedRole] = useState("All Users");
    const [timeRange, setTimeRange] = useState("Last 30 Days");

    // 👇 2. GET CURRENT USER (For "Prepared By")
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'System Admin', role: 'Admin' };

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
status: selectedStatus === "All Statuses" ? undefined : selectedStatus,
                    role: selectedRole === "All Users" ? undefined : selectedRole,
                    category: selectedCategory === "All Categories" ? undefined : selectedCategory,
                    timeRange
                };
                const res = await api.get('/reports', { params });
                setData(res.data);
            } catch (err) {
                console.error("Reports Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
}, [selectedStatus, selectedCategory, selectedRole, timeRange]);

    // Filtered Data
    const filteredData = data;

    // Chart Data
    const categoryStats = useMemo(() => {
        const stats = {};
        data.forEach(item => {
            stats[item.category] = (stats[item.category] || 0) + 1;
        });
        return Object.keys(stats).map(key => ({ name: key, value: stats[key] }));
    }, [data]);

    // 👇 3. HANDLE PDF GENERATION (Data Mapping)
    const handleExportPDF = () => {
        if (filteredData.length === 0) return alert("No data to export!");

        // The Admin API returns flat data (row.item), but PDF Generator expects objects (item.equipment.name)
        // We map it here to fit the generator's expected format
        const formattedForPdf = filteredData.map(row => ({
            createdAt: row.dateOut, // Map Date
            status: row.status,
            equipment: {
                name: row.item,
                serialNumber: row.id.slice(-6).toUpperCase(), // Use truncated ID as serial
                category: row.category
            },
            user: {
                username: row.user,
                email: row.role // Using role as secondary info since email isn't in this specific view
            }
        }));

        generatePDF(formattedForPdf, currentUser, "ADMINISTRATIVE EQUIPMENT REPORT");
    };

    // --- RENDERERS ---

    const renderTable = () => (
<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ITEM ID</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ITEM NAME</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">CATEGORY</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ASSIGNED TO</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">DATE BORROWED <AlertCircle className="w-3 h-3 inline text-slate-300 ml-1" /></th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">RISK</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">SCORE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="9" className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" /></td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan="9" className="p-12 text-center text-slate-400">No records found matching your filters.</td></tr>
                        ) : (
                            filteredData.map((row, index) => {
                                const riskLevel = row.responsibilityScore < 50 ? 'High' : row.responsibilityScore < 80 ? 'Medium' : 'Low';
                                const statusColor =
                                    row.status === 'Overdue' ? 'text-red-500 font-bold' :
                                        row.status === 'Active' ? 'text-slate-700 font-medium' :
                                            row.status === 'Returned' ? 'text-emerald-600 font-medium' :
                                                row.status === 'Lost' ? 'text-orange-500' :
                                                    row.status === 'Stolen' ? 'text-red-600 font-bold' :
                                                        'text-slate-500';

                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-sm text-slate-400 font-medium">{index + 1}</td>
                                        <td className="p-4 text-sm font-bold text-slate-700">{row.id}</td>
                                        <td className="p-4 text-sm font-bold text-slate-900">{row.item}</td>
                                        <td className="p-4 text-sm text-slate-500">{row.category}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{row.user}</span>
                                                <span className="text-xs text-slate-400">{row.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{new Date(row.dateOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className={`p-4 text-sm ${statusColor}`}>{row.status}</td>
                                        <td className="p-4">
                                            <span className={`text-sm font-medium ${riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-yellow-600' : 'text-slate-600'}`}>
                                                {riskLevel}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-bold text-sm ${row.responsibilityScore < 50 ? 'text-red-500' : row.responsibilityScore >= 90 ? 'text-emerald-500' : 'text-slate-700'}`}>
                                                {row.responsibilityScore}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors text-rose-500 hover:border-rose-200 hover:bg-rose-50">
                    <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50">
                    <Table className="w-4 h-4" /> Export Excel
                </button>
            </div>
        </div>
    );

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
<h1 className="text-3xl font-bold text-white mb-2">System Reports</h1>
                <p className="text-slate-400">Generate and export detailed system logs and inventories.</p>
            </div>
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 mt-4 md:mt-0">
                <button onClick={() => setReportMode('admin')} className={`px-4 py-2 rounded-lg text-sm font-medium ${reportMode === 'admin' ? 'bg-[#8D8DC7] text-white' : 'text-gray-400'}`}>
                    <Table className="w-4 h-4 inline mr-2" />
                </button>
                <button onClick={() => setReportMode('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium ${reportMode === 'analytics' ? 'bg-[#8D8DC7] text-white' : 'text-gray-400'}`}>
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">
{/* Mode: Admin Table */}
                {reportMode === 'admin' && (
                    <>
                        {/* Mode: Admin Table */}
                        {reportMode === 'admin' && (
                            <>
                                {/* Filters Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                                        <Filter className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">Report Filters</h3>
                                            <p className="text-xs text-gray-400">Customize your report by selecting filters below</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {/* Date Range */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                Date Range <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={timeRange}
                                                    onChange={e => setTimeRange(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#8D8DC7] appearance-none"
                                                >
                                                    {TIME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                Equipment Category <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={e => setSelectedCategory(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#8D8DC7] appearance-none"
                                                >
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Condition / Status */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Equipment & Condition
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedStatus}
                                                    onChange={e => setSelectedStatus(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#8D8DC7] appearance-none"
                                                >
                                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* User Filter */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                User Filter
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedRole}
                                                    onChange={e => setSelectedRole(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#8D8DC7] appearance-none"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={() => {
                                            setSelectedStatus("All Statuses");
                                            setSelectedCategory("All Categories");
                                            setSelectedRole("All Users");
                                            setTimeRange("Last 30 Days");
                                        }} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                            <Filter className="w-4 h-4" /> Reset Filters
                                        </button>
                                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10">
                                            <Filter className="w-4 h-4" /> Generate Report
                                        </button>
                                    </div>
                                </div>

                                {renderTable()}
                            </>
                        )}
                    </>
                )}

                {/* Mode: Analytics */}
                {reportMode === 'analytics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Items by Category (Current View)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                            More analytics coming soon...
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReportsPage;