
import React from 'react';
import AdminLayout from './components/AdminLayout';
import StatsCard from './components/StatsCard';
import DashboardCharts from './components/DashboardCharts';
import RecentActivityTable from './components/RecentActivityTable';
import QuickActions from './components/QuickActions';
import SystemSnapshots from './components/SystemSnapshots';
import { Package, Wifi, Activity, AlertTriangle, QrCode, ShieldAlert, UserX, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const HeroSection = (
        <div>
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Admin,</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
                        {currentDate} • System Status: Online
                    </p>
                </div>

                <div className="mt-6 md:mt-0 flex gap-3">
                    {/* Time Filter */}
                    <button className="bg-slate-800 text-gray-300 font-medium py-3 px-6 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Today
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </button>

                    <button
                        onClick={() => navigate('/admin/equipment')}
                        className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-8 rounded-2xl shadow-lg shadow-[#8D8DC7]/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center">
                        <QrCode className="w-5 h-5 mr-2" />
                        Scan & Check-out
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {/* 1. Operations: Active Borrowed */}
                <StatsCard
                    title="Active Borrowed"
                    value="124"
                    change="+12"
                    trend="positive"
                    subtext="Students with equipment"
                    icon={Package}
                    dark
                    onClick={() => navigate('/admin/reports')}
                />

                {/* 2. Health: IOT Sensors */}
                <StatsCard
                    title="IOT Sensors Online"
                    value="98.5%"
                    change="+2%"
                    trend="positive"
                    subtext="Real-time tracking active"
                    icon={Wifi}
                    dark
                    onClick={() => navigate('/admin/tracking')}
                />

                {/* 3. Risk: At-Risk Equipment */}
                <StatsCard
                    title="At-Risk Items"
                    value="7"
                    change="+2"
                    trend="negative"
                    subtext="Overdue or Out-of-Zone"
                    icon={AlertTriangle}
                    dark
                    isAlert
                    onClick={() => navigate('/admin/reports')}
                />

                {/* 4. Governance: Low Responsibility */}
                <div
                    onClick={() => navigate('/admin/users')}
                    className="bg-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500">Low Responsibility</p>
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <UserX className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">6</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-2">
                        <span className="text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded mr-2">Review</span>
                        Users flagged
                    </div>
                    {/* Decorative gradient */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-50 rounded-full opacity-50"></div>
                </div>
            </div>

            {/* Quick Summary Strip (Optional per feedback for Incident summary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
                <div
                    onClick={() => navigate('/admin/security')}
                    className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition-colors"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-slate-700 rounded-lg mr-3">
                            <ShieldAlert className="w-5 h-5 text-[#8D8DC7]" />
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm font-medium">Security Incidents Today</p>
                            <p className="text-white font-bold text-lg">0</p>
                        </div>
                    </div>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">No Issues</span>
                </div>

                <div
                    onClick={() => navigate('/admin/monitoring')}
                    className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition-colors"
                >
                    <div className="flex items-center">
                        <div className="p-2 bg-slate-700 rounded-lg mr-3">
                            <Activity className="w-5 h-5 text-[#8D8DC7]" />
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm font-medium">System Health</p>
                            <p className="text-white font-bold text-lg">99.9%</p>
                        </div>
                    </div>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Optimal</span>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Left Column (Charts & Tables) */}
                <div className="xl:col-span-2 space-y-6 h-full">
                    {/* Live Activity Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg font-bold text-slate-900">Live Tracking & Check-outs</h3>
                            <button
                                onClick={() => navigate('/admin/reports')}
                                className="text-sm text-[#8D8DC7] font-medium hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <RecentActivityTable />
                    </div>

                    {/* Charts Section - Moved here to balance height */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <DashboardCharts />
                    </div>
                </div>

                {/* Right Column (Quick Actions & System Overview) */}
                <div className="space-y-6 h-full">
                    <QuickActions />
                    <SystemSnapshots />
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
