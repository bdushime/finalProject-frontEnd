import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import api from '@/utils/api';
import { Search, Filter, Download, FileText, BarChart3, Table, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// 👇 1. IMPORT GENERATOR
import { generatePDF } from '@/utils/pdfGenerator';

// CONSTANTS
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [timeRange, setTimeRange] = useState("View All Time");

    // 👇 2. GET CURRENT USER (For "Prepared By")
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'System Admin', role: 'Admin' };

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    status: activeTab === "Active" ? "Active" : activeTab,
                    role: selectedRole,
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
    }, [activeTab, selectedRole, timeRange]);

    // Local Search Filter
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(item => 
            item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

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
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="p-4 pl-0">ID</th>
                        <th className="p-4">Item</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Date Out</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="8" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" /></td></tr>
                    ) : filteredData.length === 0 ? (
                        <tr><td colSpan="8" className="p-8 text-center text-gray-400">No records found.</td></tr>
                    ) : (
                        filteredData.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors group bg-white rounded-xl shadow-sm border border-gray-100">
                                <td className="p-4 font-mono text-xs text-gray-500">#{row.id.slice(-6).toUpperCase()}</td>
                                <td className="p-4 font-bold text-slate-800">{row.item}</td>
                                <td className="p-4 font-medium text-slate-700">{row.user}</td>
                                <td className="p-4 text-xs text-gray-500 uppercase">{row.role}</td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold ${row.responsibilityScore < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                        {row.responsibilityScore}%
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{new Date(row.dateOut).toLocaleDateString()}</td>
                                <td className="p-4 text-sm text-gray-500">{new Date(row.dueDate).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        row.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        row.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                                    }`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-gray-400">Real-time system logs and performance metrics.</p>
            </div>
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 mt-4 md:mt-0">
                <button onClick={() => setReportMode('admin')} className={`px-4 py-2 rounded-lg text-sm font-medium ${reportMode === 'admin' ? 'bg-[#8D8DC7] text-white' : 'text-gray-400'}`}>
                    <Table className="w-4 h-4 inline mr-2" /> Data View
                </button>
                <button onClick={() => setReportMode('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium ${reportMode === 'analytics' ? 'bg-[#8D8DC7] text-white' : 'text-gray-400'}`}>
                    <BarChart3 className="w-4 h-4 inline mr-2" /> Analytics
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
                        {/* Tabs */}
                        <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-100 shadow-sm">
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-grow md:flex-grow-0 ${activeTab === tab ? 'bg-[#8D8DC7] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filters & Actions */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#8D8DC7]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <select className="p-3 rounded-xl border border-gray-200 bg-white" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                            <select className="p-3 rounded-xl border border-gray-200 bg-white" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                                {TIME_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                            </select>
                            
                            {/* 👇 4. PDF BUTTON ADDED HERE */}
                            <button 
                                onClick={handleExportPDF}
                                className="bg-green-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-green-700 transition-all flex items-center text-sm shadow-lg shadow-green-500/20 whitespace-nowrap"
                            >
                                <FileText className="w-4 h-4 mr-2" /> PDF Report
                            </button>
                        </div>

                        {renderTable()}
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