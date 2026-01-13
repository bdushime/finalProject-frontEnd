import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; // Check path
import StatsCard from '../components/StatsCard'; // Check path
import api from '@/utils/api';
import { Activity, Server, Cpu, Zap, AlertCircle, Clock, Shield, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonitoringPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        systemStatus: { uptime: "-", cpuLoad: "-", memoryUsage: "-", errorRate: "-" },
        errorLogs: []
    });

    // Chart Data State (Live Updating)
    const [chartData, setChartData] = useState([]);

    // 1. FETCH INITIAL DATA
    useEffect(() => {
        const fetchMonitoringData = async () => {
            try {
                const res = await api.get('/monitoring');
                setData(res.data);
            } catch (err) {
                console.error("Monitoring Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMonitoringData();
    }, []);

    // 2. SIMULATE LIVE CHART UPDATES
    useEffect(() => {
        // Initialize with 10 points
        const initialData = Array.from({ length: 12 }, (_, i) => ({
            time: new Date(Date.now() - (11 - i) * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: Math.floor(Math.random() * 40) + 20, // Random 20-60
            memory: Math.floor(Math.random() * 20) + 30  // Random 30-50
        }));
        setChartData(initialData);

        const interval = setInterval(() => {
            setChartData(currentData => {
                const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const newPoint = {
                    time: newTime,
                    cpu: Math.floor(Math.random() * 40) + 20,
                    memory: Math.floor(Math.random() * 20) + 30
                };
                // Remove first, add new to end (Sliding window)
                return [...currentData.slice(1), newPoint];
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

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

    if (loading) {
        return (
            <AdminLayout heroContent={HeroSection}>
                <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#8D8DC7]" /></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">

                {/* 1. KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="System Uptime"
                        value={data.systemStatus.uptime}
                        change="Stable"
                        trend="positive"
                        subtext="Last downtime: 32 days ago"
                        icon={Activity}
                        dark={false}
                    />
                    <StatsCard
                        title="Avg. CPU Load"
                        value={data.systemStatus.cpuLoad}
                        change="+5%"
                        trend="negative"
                        subtext="4 Cores Active"
                        icon={Cpu}
                        dark={false}
                    />
                    <StatsCard
                        title="Memory Usage"
                        value={data.systemStatus.memoryUsage}
                        change="-2%"
                        trend="positive"
                        subtext="Total: 16 GB Available"
                        icon={Server}
                        dark={false}
                    />
                    <StatsCard
                        title="Error Rate"
                        value={data.systemStatus.errorRate}
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
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                    <Area type="monotone" dataKey="cpu" stroke="#8D8DC7" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                                    <Area type="monotone" dataKey="memory" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Server Status List (Static/Mock for visual balance) */}
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
                                {data.errorLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-0">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${log.type === 'Error' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
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