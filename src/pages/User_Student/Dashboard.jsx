import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import StatsOverview from "./components/Dashboard/StatsOverview";
import ActivityChart from "./components/Dashboard/ActivityChart";
import TimeTracker from "./components/Dashboard/TimeTracker";
import NotificationsWidget from "./components/Dashboard/NotificationsWidget";
import api from "@/utils/api";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("student");
    const { t: tCommon } = useTranslation("common");

    // --- STATE ---
    const [user, setUser] = useState({ name: "Student", score: 0 });
    const [borrows, setBorrows] = useState([]);
    const [history, setHistory] = useState([]);
    const [devices, setDevices] = useState([]);
    const [stats, setStats] = useState({ activeBorrows: 0, pending: 0, overdue: 0 });
    const [calendarData, setCalendarData] = useState({ month: "", days: [] });

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A. Profile
                const profileRes = await api.get('/users/profile');
                setUser({
                    name: profileRes.data.fullName || profileRes.data.username,
                    score: profileRes.data.responsibilityScore || 100,
                });

                // B. Borrows & History
                const borrowsRes = await api.get('/transactions/my-borrowed');
                setBorrows(borrowsRes.data);

                const historyRes = await api.get('/transactions/my-history');
                setHistory(historyRes.data);

                // C. Available Devices
                const equipRes = await api.get('/equipment');
                const available = equipRes.data.filter(item => item.status === 'Available').slice(0, 5);
                setDevices(available);

                // D. Stats
                setStats({
                    activeBorrows: borrowsRes.data.length,
                    pending: borrowsRes.data.filter(l => l.status === 'Pending').length,
                    overdue: borrowsRes.data.filter(l => new Date() > new Date(l.expectedReturnTime)).length
                });

            } catch (err) {
                console.error("Dashboard Data Error:", err);
            }
        };

        fetchData();
        fetchData();
    }, []);

    // --- HELPERS ---

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t("dashboard.greeting.morning");
        if (hour < 18) return t("dashboard.greeting.afternoon");
        return t("dashboard.greeting.evening");
    };

    const getFormattedDate = () => {
        const now = new Date();
        const lang = i18n.language;

        if (lang === 'rw') {
            const rwMonths = [
                'Mutarama', 'Gashyantare', 'Werurwe', 'Mata',
                'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama',
                'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
            ];
            const rwDays = [
                'Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu',
                'Kuwa kane', 'Kuwa gatanu', 'Kuwa gatandatu'
            ];
            return `${rwDays[now.getDay()]}, ${rwMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        }

        const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        }).format(now);
    };

    const formattedDate = getFormattedDate();
    // 1. Chart Data Calculator (Counts items per day: Sun-Sat)
    const getChartData = () => {
        const days = [0, 0, 0, 0, 0, 0, 0]; // Index 0=Sun, 6=Sat
        const now = new Date();
        // Calculate start of this week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        history.forEach(item => {
            const d = new Date(item.createdAt);
            // If item is from this week
            if (d >= startOfWeek) {
                days[d.getDay()]++;
            }
        });
        return days;
    };

    // 2. Calendar Generator
    const generateCalendar = () => {
        const date = new Date();
        const lang = i18n.language;
        let monthName;

        if (lang === 'rw') {
            const rwMonths = [
                'Mutarama', 'Gashyantare', 'Werurwe', 'Mata',
                'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama',
                'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'
            ];
            monthName = `${rwMonths[date.getMonth()]} ${date.getFullYear()}`;
        } else {
            const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
            monthName = date.toLocaleString(locale, { month: 'long', year: 'numeric' });
        }

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // Day index (0-6)
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        // Create array with empty slots for days before the 1st
        let emptySlots = firstDay === 0 ? 6 : firstDay - 1;
        const daysArray = [];
        for (let i = 0; i < emptySlots; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

        setCalendarData({ month: monthName, days: daysArray });
    };

    // Re-generate calendar when language changes
    useEffect(() => {
        generateCalendar();
    }, [i18n.language]);

    return (
        <StudentLayout>
            <div className="fixed inset-0 bg-gradient-to-br from-white via-white to-[#f0f9ff] -z-10 pointer-events-none" />

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light text-[#0b1d3a] tracking-tight mb-2">
                            {getGreeting()}, <span className="font-medium">{user.name}</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-light">{formattedDate}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <div className="px-6 py-3 bg-[#0b1d3a] text-white rounded-full text-sm font-bold flex items-center gap-8 shadow-lg shadow-[#0b1d3a]/20">
                                {t("dashboard.activeBorrows")} <span className="text-[#126dd5] text-xs font-normal">{stats.activeBorrows} {t("dashboard.items")}</span>
                            </div>
                            <div className="px-6 py-3 border border-slate-200 text-slate-400 rounded-full text-sm font-medium flex items-center gap-2 bg-white/50 backdrop-blur-sm">
                                {tCommon("nav.score")}
                                <span className="ml-4 h-1 w-16 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#126dd5] transition-all duration-1000" style={{ width: `${user.score}%` }}></div>
                                </span>
                                <span className="text-slate-800 ml-2">{user.score}%</span>
                            </div>
                        </div>
                    </div>

                    <StatsOverview stats={stats} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">

                    {/* Left: Available Devices */}
                    <div className="md:col-span-4 xl:col-span-3 flex flex-col gap-6">
                        <div onClick={() => navigate('/student/browse')} className="bg-[#f0f9ff] rounded-[32px] p-6 flex flex-col relative h-[380px] shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-medium text-[#0b1d3a]">{t("dashboard.availableDevices")}</span>
                                <button className="text-xs font-bold text-[#126dd5]">{t("dashboard.viewAll")}</button>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                                {devices.length > 0 ? (
                                    devices.map((device) => (
                                        <div key={device._id} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#126dd5]/30 transition-all">
                                            <span className="font-semibold text-[#0b1d3a] text-sm truncate max-w-[120px]">{device.name}</span>
                                            <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#126dd5] px-2 py-1 rounded-md">{tCommon("status.available")}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 text-sm mt-10">{t("dashboard.noDevicesAvailable")}</div>
                                )}
                            </div>
                        </div>
                        <div onClick={() => navigate('/student/notifications')} className="min-h-[260px] cursor-pointer">
                            <NotificationsWidget />
                        </div>
                    </div>

                    {/* Middle: Chart & Calendar */}
                    <div className="md:col-span-4 xl:col-span-5 flex flex-col gap-6">
                        <div className="h-[320px] cursor-pointer hover:opacity-95 transition-opacity" onClick={() => navigate('/student/reports', { state: { filter: 'This Week' } })}>
                            <ActivityChart count={getChartData().reduce((a, b) => a + b, 0)} weeklyData={getChartData()} />
                        </div>

                        {/* DYNAMIC CALENDAR */}
                        <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100 flex-1 min-h-[280px]">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-semibold text-[#0b1d3a] text-lg">{calendarData.month}</span>
                                <button className="text-xs font-medium px-3 py-1 bg-[#f0f9ff] text-[#126dd5] rounded-full">{t("dashboard.today")}</button>
                            </div>
                            <div className="grid grid-cols-7 text-center gap-y-4">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-xs text-slate-400 font-bold">{d}</div>)}
                                {calendarData.days.map((day, idx) => (
                                    <div key={idx} className={`text-sm flex items-center justify-center h-8 w-8 rounded-full mx-auto 
                                        ${day === new Date().getDate() ? 'bg-[#126dd5] text-white font-bold shadow-md' : 'text-slate-500'}
                                        ${!day ? 'opacity-0' : ''}`}>
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Timer & Recent Activity */}
                    <div className="md:col-span-4 xl:col-span-4 flex flex-col gap-6">
                        <div className="h-[270px] cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => navigate('/student/borrowed-items')}>
                            <TimeTracker activeBorrow={borrows[0] || null} />
                        </div>
                        {/* RECENT ACTIVITY */}
                        <div className="bg-[#0b1d3a] rounded-[32px] p-6 flex-1 min-h-[380px] text-white overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">{t("dashboard.recentActivity")}</h3>
                                <ArrowUpRight className="w-4 h-4 text-white opacity-50" />
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide flex-1">
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 
${item.status === 'Returned' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    item.status === 'Borrowed' ? 'bg-[#126dd5]/20 text-[#126dd5]' : 'bg-slate-700 text-slate-400'}`}>
                                                {item.status === 'Returned' ? <CheckCircle size={18} /> :
                                                    item.status === 'Overdue' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate text-white/90">{item.equipment?.name || tCommon("misc.equipment")}</p>
                                                <p className="text-xs text-white/40">{item.status} • {new Date(item.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-white/40 text-sm text-center mt-10">{t("dashboard.noRecentActivity")}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-200 text-[#0b1d3a]/40 text-xs font-medium">
                    {t("dashboard.copyright", { year: new Date().getFullYear() })}
                </div>
            </div>
        </StudentLayout>
    );
}