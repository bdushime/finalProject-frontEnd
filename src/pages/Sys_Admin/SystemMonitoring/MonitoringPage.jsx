import React from 'react';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import { Activity, Server, Cpu, Zap, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data for Performance Chart
const performanceData = [
    { time: '10:00', cpu: 20, memory: 40 },
    { time: '10:05', cpu: 35, memory: 42 },
    { time: '10:10', cpu: 25, memory: 41 },
    { time: '10:15', cpu: 45, memory: 45 },
    { time: '10:20', cpu: 60, memory: 48 },
    { time: '10:25', cpu: 55, memory: 50 },
    { time: '10:30', cpu: 40, memory: 45 },
    { time: '10:35', cpu: 30, memory: 42 },
    { time: '10:40', cpu: 28, memory: 40 },
    { time: '10:45', cpu: 50, memory: 46 },
    { time: '10:50', cpu: 70, memory: 55 },
    { time: '10:55', cpu: 65, memory: 52 },
];

const errorLogs = [
    { id: 1, type: "Error", message: "Database connection timeout", source: "Auth Service", time: "10:42 AM", user: "System" },
    { id: 2, type: "Warning", message: "API rate limit approaching", source: "External API", time: "10:30 AM", user: "N/A" },
    { id: 3, type: "Error", message: "Failed to generate report PDF", source: "Report Service", time: "10:15 AM", user: "admin@auca.ac.rw" },
    { id: 4, type: "Warning", message: "High memory usage detected", source: "Server Node 2", time: "09:55 AM", user: "System" },
    { id: 5, type: "Warning", message: "Invalid login attempt detected", source: "Security", time: "09:40 AM", user: "192.168.1.56" },
];

const MonitoringPage = () => {

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Monitoring</h1>
                <p className="text-gray-400">Real-time health status, performance metrics, and logs.</p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-3">
                <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl text-green-400 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-bold">All Systems Operational</span>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">

                {/* 1. KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="System Uptime"
                        value="99.98%"
                        change="Stable"
                        trend="positive"
                        subtext="Last downtime: 32 days ago"
                        icon={Activity}
                        dark={false}
                    />
                    <StatsCard
                        title="Avg. CPU Load"
                        value="45%"
                        change="+5%"
                        trend="negative"
                        subtext="4 Cores Active"
                        icon={Cpu}
                        dark={false}
                    />
                    <StatsCard
                        title="Memory Usage"
                        value="6.2 GB"
                        change="-2%"
                        trend="positive"
                        subtext="Total: 16 GB Available"
                        icon={Server}
                        dark={false}
                    />
                    <StatsCard
                        title="Error Rate"
                        value="0.05%"
                        change="-0.01%"
                        trend="positive"
                        subtext="Last 24 hours"
                        icon={AlertCircle}
                        dark={false}
                        isAlert={false}
                    />
                </div>

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Performance Chart */}
                    <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">System Performance Metrics</h3>
                                <p className="text-sm text-gray-400">Real-time CPU & Memory utilization</p>
                            </div>
                            <div className="flex gap-4 text-xs font-bold text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-1 bg-[#8D8DC7] rounded-full"></div> CPU
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-1 bg-indigo-200 rounded-full"></div> Memory
                                </div>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8D8DC7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8D8DC7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stroke="#8D8DC7" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
                                    <Area type="monotone" dataKey="memory" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Server Status List */}
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-800 text-white">
                        <h3 className="text-lg font-bold mb-4">Server Node Status</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(node => (
                                <div key={node} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${node === 2 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                                        <div>
                                            <p className="font-bold text-sm">Node-US-East-{Math.floor(Math.random() * 100)}</p>
                                            <p className="text-xs text-gray-400">192.168.1.1{node}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${node === 2 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-green-400/20 text-green-400'}`}>
                                        {node === 2 ? 'Warning' : 'Online'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <h3 className="text-lg font-bold mb-4">Storage health</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-gray-400">
                                        <span>Primary SSD</span>
                                        <span>72%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div className="bg-[#8D8DC7] h-2 rounded-full" style={{ width: '72%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-gray-400">
                                        <span>Backup Drive</span>
                                        <span>45%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Recent Error Logs */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-xl">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Recent Error Logs</h2>
                                <p className="text-sm text-gray-500">Critical system alerts and warnings.</p>
                            </div>
                        </div>
                        <button className="text-sm text-[#8D8DC7] font-bold hover:underline">View All Logs</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4 pl-0">Status</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {errorLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-0">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${log.type === 'Error' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {log.type === 'Error' ? <AlertCircle className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{log.message}</td>
                                        <td className="p-4 text-sm text-gray-500">{log.source}</td>
                                        <td className="p-4 text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {log.time}</td>
                                        <td className="p-4 text-sm text-gray-500">{log.user}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-xs text-gray-500 hover:text-slate-800 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default MonitoringPage;
