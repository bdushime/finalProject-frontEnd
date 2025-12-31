import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Shield, Lock, FileText, Users, AlertTriangle, CheckCircle, Search, Filter, Download, Activity, Globe, Smartphone, Clock, XCircle, AlertCircle } from 'lucide-react';

// --- MOCK DATA ---

const AUDIT_LOGS = [
    { id: "LOG-9921", user: "SysAdmin Dave", action: "User Role Modified", target: "Esther Howard (Student -> Admin)", ip: "192.168.1.55", time: "Oct 24, 10:42 AM", status: "Success", severity: "High" },
    { id: "LOG-9920", user: "Officer K.", action: "Override Equipment Return", target: "EQ-2024-002", ip: "10.0.0.12", time: "Oct 24, 09:15 AM", status: "Success", severity: "Medium" },
    { id: "LOG-9919", user: "Unknown", action: "Failed Login Attempt", target: "System", ip: "45.22.19.112", time: "Oct 24, 03:00 AM", status: "Failed", severity: "Critical" },
    { id: "LOG-9918", user: "Sarah Admin", action: "Data Export (CSV)", target: "Inventory Report", ip: "192.168.1.56", time: "Oct 23, 05:30 PM", status: "Success", severity: "Low" },
    { id: "LOG-9917", user: "SysAdmin Dave", action: "System Backup Created", target: "Full Database", ip: "192.168.1.55", time: "Oct 23, 08:00 AM", status: "Success", severity: "Low" },
];

const COMPLIANCE_ITEMS = [
    { id: 1, policy: "GDPR Data Retention", status: "Compliant", lastCheck: "2 hours ago", details: "All user data > 5 years anonymized." },
    { id: 2, policy: "Admin Access Review", status: "Warning", lastCheck: "5 days ago", details: "Quarterly review overdue by 2 days." },
    { id: 3, policy: "Encryption Standards", status: "Compliant", lastCheck: "1 day ago", details: "AES-256 enabled on all databases." },
    { id: 4, policy: "Equipment Return Rate", status: "Critical", lastCheck: "Live", details: "15% overdue items (Threshold: 10%)." },
    { id: 5, policy: "Failed Login Threshold", status: "Compliant", lastCheck: "Live", details: "0 lockouts in last 24h." },
];

const ACTIVE_SESSIONS = [
    { user: "SysAdmin Dave", role: "Super Admin", location: "New York, USA", device: "Chrome / Windows", ip: "192.168.1.55", loginTime: "2 hours ago" },
    { user: "Sarah Admin", role: "Inventory Manager", location: "London, UK", device: "Safari / macOS", ip: "172.16.0.4", loginTime: "45 mins ago" },
    { user: "Officer K.", role: "Security Officer", location: "Campus HQ", device: "Firefox / Android", ip: "10.0.0.12", loginTime: "10 mins ago" },
];

const SecurityPage = () => {
    const [activeTab, setActiveTab] = useState("Audit Logs");
    const [searchTerm, setSearchTerm] = useState("");

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Security & Compliance</h1>
                <p className="text-gray-400">Monitor access log, enforce policies, and track threats.</p>
            </div>

            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-700 mt-4 md:mt-0">
                <Download className="w-4 h-4" /> Export Audit Log
            </button>
        </div>
    );

    const renderAuditLogs = () => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search logs by user, IP, or action..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] bg-gray-50 text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
                        <Clock className="w-4 h-4" /> Date Range
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="p-4 pl-0">Timestamp</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Target / Details</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {AUDIT_LOGS.filter(l => l.user.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase())).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-500 text-sm font-mono border-l-4 border-transparent rounded-l-xl">
                                    {log.time}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-700">{log.user}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${log.severity === 'Critical' ? 'bg-red-50 text-red-700' :
                                            log.severity === 'High' ? 'bg-orange-50 text-orange-700' :
                                                'bg-blue-50 text-blue-700'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600 text-sm">{log.target}</td>
                                <td className="p-4 text-gray-500 text-xs font-mono">{log.ip}</td>
                                <td className="p-4 rounded-r-xl">
                                    {log.status === 'Success' ? (
                                        <span className="flex items-center text-green-600 text-xs font-bold gap-1">
                                            <CheckCircle className="w-3 h-3" /> Success
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 text-xs font-bold gap-1">
                                            <XCircle className="w-3 h-3" /> Failed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCompliance = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {COMPLIANCE_ITEMS.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-[#8D8DC7]/10 p-3 rounded-full">
                                <Shield className="w-6 h-6 text-[#8D8DC7]" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Compliant' ? 'bg-green-100 text-green-700' :
                                    item.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.policy}</h3>
                        <p className="text-gray-500 text-sm mb-4">{item.details}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 font-medium pt-4 border-t border-gray-50">
                        <Clock className="w-3 h-3 mr-1" /> Checked: {item.lastCheck}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderActiveSessions = () => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" /> Live Admin Sessions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {ACTIVE_SESSIONS.map((session, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-2xl p-5 hover:border-[#8D8DC7] transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                {session.user.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{session.user}</h4>
                                <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{session.role}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-500">
                                <Globe className="w-4 h-4 mr-2 text-gray-400" /> {session.location} ({session.ip})
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Smartphone className="w-4 h-4 mr-2 text-gray-400" /> {session.device}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" /> Login: {session.loginTime}
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-gray-50 text-red-600 font-medium py-2 rounded-lg text-sm hover:bg-red-50 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100">
                            Revoke Access
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-100 shadow-sm">
                    {["Audit Logs", "Compliance Dashboard", "Active Sessions"].map((tab) => (
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

                {/* Main Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === "Audit Logs" && renderAuditLogs()}
                    {activeTab === "Compliance Dashboard" && renderCompliance()}
                    {activeTab === "Active Sessions" && renderActiveSessions()}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SecurityPage;
