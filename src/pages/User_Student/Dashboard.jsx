import StudentLayout from "@/components/layout/StudentLayout";
import StatsOverview from "./components/Dashboard/StatsOverview";
import ActivityChart from "./components/Dashboard/ActivityChart";
import TimeTracker from "./components/Dashboard/TimeTracker";
import RecentActivityList from "./components/Dashboard/RecentActivityList";
import NotificationsWidget from "./components/Dashboard/NotificationsWidget";
import { ChevronDown, Clock, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { dashboardStats } from "./data/mockData";

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <StudentLayout>
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-white via-white to-[#f0f9ff] -z-10 pointer-events-none" />

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light text-[#0b1d3a] tracking-tight mb-2">
                            Welcome, <span className="font-medium">Juls</span>
                        </h1>

                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <div className="px-6 py-3 bg-[#0b1d3a] text-white rounded-full text-sm font-bold flex items-center gap-8 shadow-lg shadow-[#0b1d3a]/20">
                                Active Loans <span className="text-[#126dd5] text-xs font-normal">3 Items</span>
                            </div>
                            <div className="px-6 py-3 bg-[#f0f9ff] text-[#126dd5] border border-[#126dd5]/20 rounded-full text-sm font-bold flex items-center gap-8">
                                Returns Due <span className="text-emerald-600 text-xs font-normal">Today</span>
                            </div>
                            <div className="px-6 py-3 border border-slate-200 text-slate-400 rounded-full text-sm font-medium flex items-center gap-2 bg-white/50 backdrop-blur-sm">
                                Score <span className="ml-4 h-1 w-16 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="w-[90%] h-full bg-[#126dd5]"></div>
                                </span>
                                <span className="text-slate-800 ml-2">90%</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Right Stats */}
                    <StatsOverview stats={dashboardStats} />
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">

                    {/* Column 1: Available Devices (Top) & Notifications (Bottom) */}
                    <div className="md:col-span-4 xl:col-span-3 flex flex-col gap-6">
                        {/* Available Devices Card - Linked to /student/browse (Equipments) */}
                        <div
                            onClick={() => navigate('/student/browse')}
                            className="bg-[#f0f9ff] rounded-[32px] p-6 flex flex-col relative h-[380px] shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-medium text-[#0b1d3a]">Available Devices</span>
                                <button className="text-xs font-bold text-[#126dd5] hover:opacity-80 transition-opacity flex items-center gap-1">
                                    View All <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                                {/* Text List of Devices */}
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#126dd5]/30 transition-all">
                                    <span className="font-semibold text-[#0b1d3a] text-sm">Projector 1</span>
                                    <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#126dd5] px-2 py-1 rounded-md">Available</span>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#126dd5]/30 transition-all">
                                    <span className="font-semibold text-[#0b1d3a] text-sm">MacBook Air M1</span>
                                    <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#126dd5] px-2 py-1 rounded-md">3 Left</span>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#126dd5]/30 transition-all">
                                    <span className="font-semibold text-[#0b1d3a] text-sm">HDMI Cable</span>
                                    <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#126dd5] px-2 py-1 rounded-md">12+</span>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#126dd5]/30 transition-all">
                                    <span className="font-semibold text-[#0b1d3a] text-sm">Sony Camera</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Low Stock</span>
                                </div>
                            </div>
                        </div>

                        {/* Notifications moved here (Bottom Left) 
                            Expanded to min-h-[260px] as requested in audio to fit content better.
                        */}
                        <div className="min-h-[260px] cursor-pointer" onClick={() => navigate('/student/notifications')}>
                            <NotificationsWidget />
                        </div>
                    </div>

                    {/* Column 2: Charts & Calendar (Middle) */}
                    <div className="md:col-span-4 xl:col-span-5 flex flex-col gap-6">
                        {/* Weekly Borrowing (Chart) -> Linked to Reports */}
                        <div className="h-[320px] cursor-pointer hover:opacity-95 transition-opacity" onClick={() => navigate('/student/reports')}>
                            <ActivityChart />
                        </div>
                        {/* Calendar */}
                        <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100 flex-1 min-h-[280px]">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-semibold text-[#0b1d3a] text-lg">October 2025</span>
                                <div className="flex gap-2">
                                    <button className="text-xs font-medium px-3 py-1 bg-[#f0f9ff] text-[#126dd5] rounded-full">Month</button>
                                    <button className="text-xs font-medium px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded-full">Week</button>
                                </div>
                            </div>

                            {/* Calendar Row */}
                            <div className="grid grid-cols-7 text-center gap-y-6">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="text-xs text-slate-400 font-bold">{d}</div>)}

                                <div className="text-sm text-slate-400">24</div>
                                <div className="text-sm text-slate-400">25</div>
                                <div className="text-sm font-bold text-white bg-[#126dd5] h-9 w-9 rounded-full flex items-center justify-center mx-auto shadow-md shadow-blue-500/30 ring-4 ring-[#f0f9ff]">26</div>
                                <div className="text-sm text-slate-400">27</div>
                                <div className="text-sm text-[#0b1d3a] font-semibold bg-[#f0f9ff] h-9 w-9 rounded-full flex items-center justify-center mx-auto">28</div>
                                <div className="text-sm text-slate-400">29</div>
                                <div className="text-sm text-slate-400 opacity-50">30</div>
                            </div>

                            <div className="mt-8 bg-[#0b1d3a] rounded-[24px] p-5 text-white flex items-center justify-between shadow-xl shadow-[#0b1d3a]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                <div className="relative z-10">
                                    <div className="text-sm font-bold mb-1">Equipment Return Due</div>
                                    <div className="text-xs text-white/50 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Today, 5:00 PM
                                    </div>
                                </div>
                                <div className="p-3 bg-white/10 rounded-full relative z-10">
                                    <Clock className="w-5 h-5 text-[#f0f9ff]" />
                                </div>
                                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#126dd5]/30 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Timer & Recent Activity (Right) */}
                    <div className="md:col-span-4 xl:col-span-4 flex flex-col gap-6">
                        {/* Timer -> Linked to Borrowed Items 
                             Increased height to 270px as requested 
                         */}
                        <div className="h-[270px] cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => navigate('/student/borrowed-items')}>
                            <TimeTracker />
                        </div>
                        {/* Recent Activity -> Linked to Notifications */}
                        <div className="flex-1 min-h-[380px]">
                            <RecentActivityList />
                        </div>
                    </div>

                </div>

                {/* Copyright Footer - Darker Border */}
                <div className="text-center pt-8 border-t border-slate-200 text-[#0b1d3a]/40 text-xs font-medium">
                    &copy; 2025 University Equipment Tracker. All rights reserved.
                </div>
            </div>
        </StudentLayout>
    );
}

