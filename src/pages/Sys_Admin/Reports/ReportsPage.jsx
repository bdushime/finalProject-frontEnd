import React, { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, Download, FileText, RefreshCw, Calendar, ChevronDown, Eye, AlertCircle, CheckCircle, Clock, XCircle, Wrench, BarChart3, Hammer, Table, Shield, User, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- DATA & LOGIC HELPERS ---

const ROLES = ["All Roles", "Student", "IT Staff", "Security", "Faculty"];
const TABS = ["Overview", "Active Loans", "Overdue Items", "Maintenance", "Lost/Damaged", "Flagged Users"];
const DEPARTMENTS = ["All Departments", "Software Engineering", "Networks and Communication Systems", "Information Management", "IT Security", "Facility Management"];
const CATEGORIES = ["All Categories", "Laptops", "Projectors", "Cameras", "Audio", "Cables", "Accessories", "Keys"];
const TIME_RANGES = ["View All Time", "Today", "This Week", "This Month", "This Year"];

const REPORT_MODES = [
    { id: 'admin', label: 'Administrative Reports', icon: Table },
    { id: 'analytics', label: 'System-Wide Analytics', icon: BarChart3 },
    { id: 'builder', label: 'Custom Report Builder', icon: Hammer },
];

// Helper to generate dates
const getRelativeDate = (daysOffset, hoursStr) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const [time, period] = hoursStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, parseInt(minutes), 0, 0);
    return d;
};

// MOCK DATA GENERATION WITH STRICT RULES
// Rule 1: "Active" items must be within the last 5 hours (approx).
// Rule 2: Items older than today/yesterday are "Returned" or "Overdue".
const initialReportData = [
    // --- TODAY'S ACTIVE LOANS (Students) ---
    { id: "EQ-2024-001", item: "MacBook Pro 16\"", category: "Laptops", user: "Esther Howard", role: "Student", dept: "Software Engineering", dateOut: getRelativeDate(0, "08:30 AM"), dueDate: getRelativeDate(0, "01:30 PM"), status: "Overdue", responsibilityScore: 45 }, // Overdue because it's past 1:30 PM (assuming current time >)
    { id: "EQ-2024-004", item: "Sony Alpha A7III", category: "Cameras", user: "Wade Warren", role: "Student", dept: "Software Engineering", dateOut: getRelativeDate(0, "11:00 AM"), dueDate: getRelativeDate(0, "04:00 PM"), status: "Active", responsibilityScore: 98 },
    { id: "EQ-2024-007", item: "Tripod Manfrotto", category: "Accessories", user: "Guy Hawkins", role: "Student", dept: "Software Engineering", dateOut: getRelativeDate(0, "12:30 PM"), dueDate: getRelativeDate(0, "05:30 PM"), status: "Active", responsibilityScore: 88 },

    // --- IT STAFF LOANS ---
    { id: "IT-2024-101", item: "Fluke Network Tester", category: "Tools", user: "SysAdmin Dave", role: "IT Staff", dept: "Networks and Communication Systems", dateOut: getRelativeDate(0, "09:00 AM"), dueDate: getRelativeDate(0, "02:00 PM"), status: "Returned", responsibilityScore: 100 },
    { id: "IT-2024-102", item: "Server Rack Key #4", category: "Keys", user: "Sarah Admin", role: "IT Staff", dept: "Information Management", dateOut: getRelativeDate(0, "08:00 AM"), dueDate: getRelativeDate(0, "06:00 PM"), status: "Active", responsibilityScore: 95 }, // Longer duration for staff

    // --- SECURITY LOGS ---
    { id: "SEC-2024-055", item: "Master Key B", category: "Keys", user: "Officer K.", role: "Security", dept: "IT Security", dateOut: getRelativeDate(-1, "10:00 PM"), dueDate: getRelativeDate(-1, "11:00 PM"), status: "Returned", responsibilityScore: 90 },

    // --- HISTORICAL DATA (Strictly Returned/Overdue/Lost) ---
    { id: "EQ-2024-002", item: "Dell XPS 15", category: "Laptops", user: "Cameron Williamson", role: "Student", dept: "Networks and Communication Systems", dateOut: getRelativeDate(-1, "09:00 AM"), dueDate: getRelativeDate(-1, "02:00 PM"), status: "Overdue", responsibilityScore: 30 },
    { id: "EQ-2024-003", item: "Epson Projector X5", category: "Projectors", user: "Jane Cooper", role: "Student", dept: "Information Management", dateOut: getRelativeDate(-5, "10:15 AM"), dueDate: getRelativeDate(-5, "03:15 PM"), status: "Returned", responsibilityScore: 78 },
    { id: "EQ-2024-005", item: "Wireless Mic Set", category: "Audio", user: "Brooklyn Simmons", role: "Student", dept: "Networks and Communication Systems", dateOut: getRelativeDate(-2, "08:00 AM"), dueDate: getRelativeDate(-2, "01:00 PM"), status: "Maintenance", responsibilityScore: 92 },
    { id: "EQ-2024-006", item: "HDMI Cable 10m", category: "Cables", user: "Leslie Alexander", role: "Student", dept: "Information Management", dateOut: getRelativeDate(-40, "02:00 PM"), dueDate: getRelativeDate(-40, "07:00 PM"), status: "Lost", responsibilityScore: 60 },
];

// --- CHART DATA ---
const usageData = [
    { name: 'Mon', usage: 120 }, { name: 'Tue', usage: 145 }, { name: 'Wed', usage: 132 }, { name: 'Thu', usage: 155 }, { name: 'Fri', usage: 190 }, { name: 'Sat', usage: 45 }, { name: 'Sun', usage: 20 },
];
const categoryData = [
    { name: 'Laptops', value: 45 }, { name: 'Projectors', value: 30 }, { name: 'Cameras', value: 15 }, { name: 'Others', value: 10 },
];
const COLORS = ['#8D8DC7', '#10b981', '#f59e0b', '#ef4444'];


const ReportsPage = () => {
    const [reportMode, setReportMode] = useState('admin');
    const [activeTab, setActiveTab] = useState("Overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [timeRange, setTimeRange] = useState("View All Time");

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return initialReportData.filter(item => {
            // 1. Tab Filter
            let matchesTab = true;
            if (activeTab === "Active Loans") matchesTab = item.status === "Active";
            else if (activeTab === "Overdue Items") matchesTab = item.status === "Overdue";
            else if (activeTab === "Maintenance") matchesTab = item.status === "Maintenance";
            else if (activeTab === "Lost/Damaged") matchesTab = ["Lost", "Damaged"].includes(item.status);
            else if (activeTab === "Flagged Users") matchesTab = item.responsibilityScore < 50; // New Logic

            // 2. Dropdown Filters
            const matchesRole = selectedRole === "All Roles" || item.role === selectedRole;
            const matchesDept = selectedDept === "All Departments" || item.dept === selectedDept;
            const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;

            // 3. Time Range Filter
            let matchesTime = true;
            if (timeRange === "Today") matchesTime = item.dateOut >= startOfDay;
            else if (timeRange === "This Week") matchesTime = item.dateOut >= startOfWeek;
            else if (timeRange === "This Month") matchesTime = item.dateOut >= startOfMonth;
            else if (timeRange === "This Year") matchesTime = item.dateOut >= startOfYear;

            // 4. Search
            const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTab && matchesRole && matchesDept && matchesCategory && matchesTime && matchesSearch;
        });
    }, [activeTab, selectedRole, selectedDept, selectedCategory, searchTerm, timeRange]);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-gray-400">Manage logs, view system health, and build custom reports.</p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 mt-4 md:mt-0">
                {REPORT_MODES.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => setReportMode(mode.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${reportMode === mode.id
                            ? 'bg-[#8D8DC7] text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <mode.icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{mode.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // --- RENDER CONTENT BASED ON MODE ---
    const renderContent = () => {
        // --- MODE: ANALYTICS ---
        if (reportMode === 'analytics') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Utilization Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Equipment Utilization</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Activity Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">User Activity (Last 7 Days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="usage" fill="#8D8DC7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center py-12">
                        <h3 className="text-lg font-bold text-slate-400">More analytics coming soon...</h3>
                    </div>
                </div>
            );
        }

        // --- MODE: BUILDER ---
        if (reportMode === 'builder') {
            return (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-purple-50 rounded-2xl">
                            <Hammer className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Custom Report Builder</h2>
                            <p className="text-gray-500">Construct specific datasets for export or analysis.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">1. Select Data Source</label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#8D8DC7] focus:ring-1 focus:ring-[#8D8DC7] outline-none">
                                <option>Equipment Loans Log</option>
                                <option>Inventory Status Snapshot</option>
                                <option>User Violation Reports</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700">2. Date Range</label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#8D8DC7] focus:ring-1 focus:ring-[#8D8DC7] outline-none">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Fiscal Year To Date</option>
                                <option>Custom Range</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <label className="block text-sm font-bold text-slate-700">3. Include Fields</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {["ID Number", "Item Name", "User Name", "Department", "Time Out", "Due Time", "Return Status", "Condition Notes"].map(field => (
                                    <label key={field} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-[#8D8DC7] rounded" defaultChecked />
                                        <span className="text-sm font-medium text-slate-600">{field}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <button className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Save Template</button>
                        <button className="px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg">Generate Report</button>
                    </div>
                </div>
            );
        }

        // --- MODE: ADMIN TABLE (Default) ---
        return (
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-100 shadow-sm">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-grow md:flex-grow-0 text-center ${activeTab === tab
                                ? 'bg-[#8D8DC7] text-white shadow-lg shadow-[#8D8DC7]/20'
                                : 'text-gray-500 hover:text-[#8D8DC7] hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col xl:flex-row gap-4 mb-6">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, item or ID..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] bg-gray-50 text-slate-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center flex-grow">
                            <div className="flex items-center text-gray-500 text-sm font-medium mr-2">
                                <Filter className="w-4 h-4 mr-1" /> Filters:
                            </div>

                            {/* Time Range Filter */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-white text-gray-600 py-2.5 pl-4 pr-10 rounded-xl text-sm border border-gray-200 hover:border-[#8D8DC7] focus:outline-none focus:ring-1 focus:ring-[#8D8DC7] cursor-pointer min-w-[150px] font-medium shadow-sm"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    {TIME_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Role Filter - NEW */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-white text-gray-600 py-2.5 pl-4 pr-10 rounded-xl text-sm border border-gray-200 hover:border-[#8D8DC7] focus:outline-none focus:ring-1 focus:ring-[#8D8DC7] cursor-pointer min-w-[140px] font-medium shadow-sm"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Department Filter */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-white text-gray-600 py-2.5 pl-4 pr-10 rounded-xl text-sm border border-gray-200 hover:border-[#8D8DC7] focus:outline-none focus:ring-1 focus:ring-[#8D8DC7] cursor-pointer min-w-[180px] font-medium shadow-sm"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-slate-700">Active View:</span> {timeRange} • {selectedRole}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedCategory("All Categories"); setSelectedDept("All Departments"); setTimeRange("View All Time"); setSelectedRole("All Roles") }}
                                className="text-gray-500 hover:text-slate-800 text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                            <button className="bg-green-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-green-700 transition-all flex items-center text-sm shadow-lg shadow-green-500/20">
                                <FileText className="w-4 h-4 mr-2" /> PDF
                            </button>
                            <button className="bg-red-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-red-700 transition-all flex items-center text-sm shadow-lg shadow-red-500/20">
                                <Download className="w-4 h-4 mr-2" /> Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">
                            {activeTab} ({filteredData.length})
                        </h3>
                        <p className="text-sm text-gray-500">Showing {filteredData.length} records</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4 pl-0">ID Number</th>
                                    <th className="p-4">Item & Category</th>
                                    <th className="p-4">Borrowed By</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Department</th>
                                    <th className="p-4">Date Borrowed</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4 rounded-l-xl font-mono text-sm text-[#8D8DC7] font-semibold border-l-4 border-transparent">
                                                {row.id}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{row.item}</div>
                                                <div className="text-xs text-gray-500">{row.category}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-700">{row.user}</div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {/* Role Badge */}
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${row.role === 'Student' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        row.role === 'IT Staff' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                            'bg-gray-50 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {row.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {/* Responsibility Score Visual */}
                                                <div className="w-24">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className={`text-xs font-bold ${row.responsibilityScore < 50 ? 'text-red-600' :
                                                            row.responsibilityScore < 80 ? 'text-orange-500' : 'text-green-600'
                                                            }`}>
                                                            {row.responsibilityScore}%
                                                        </span>
                                                        {row.responsibilityScore < 50 && (
                                                            <AlertCircle className="w-3 h-3 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${row.responsibilityScore < 50 ? 'bg-red-500' :
                                                                row.responsibilityScore < 80 ? 'bg-orange-400' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${row.responsibilityScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm max-w-[180px] truncate" title={row.dept}>
                                                {row.dept}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {row.dateOut.toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400 pl-4">{row.dateOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {row.dueDate.toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400 pl-4">{row.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                    row.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                                                        row.status === 'Lost' ? 'bg-gray-100 text-gray-600' :
                                                            row.status === 'Maintenance' ? 'bg-orange-50 text-orange-700' :
                                                                'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {row.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {row.status === 'Overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                    {row.status === 'Maintenance' && <Wrench className="w-3 h-3 mr-1" />}
                                                    {row.status === 'Lost' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4 rounded-r-xl text-right">
                                                <button className="text-gray-400 hover:text-[#8D8DC7] p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-gray-400">
                                            No records found matching your filters.
                                        </td>
                                    </tr>
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
            {renderContent()}
        </AdminLayout>
    );
};

export default ReportsPage;
