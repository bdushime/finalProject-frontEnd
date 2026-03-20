import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout'; // Your layout file
import StatsCard from './components/StatsCard';
import api from '@/utils/api';
import {
    Package,
    Wifi,
    AlertTriangle,
    Users,
    User,
    Settings,
    BookOpen,
    Activity,
    Loader2,
    FileBarChart
} from 'lucide-react';
import { useTranslation } from "react-i18next";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            activeBorrowed: 0,
            totalUsers: 0,
            atRiskItems: 0,
            systemStatus: "Checking..."
        },
        recentActivity: []
    });
    const { t, i18n } = useTranslation("admin");

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await api.get('/transactions/admin/dashboard-stats');
                const result = res.data;
                setData({
                    stats: result?.stats || { activeBorrowed: 0, totalUsers: 0, atRiskItems: 0, systemStatus: "Error" },
                    recentActivity: Array.isArray(result?.recentActivity) ? result.recentActivity : []
                });
            } catch (err) {
                console.error("Failed to load admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

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
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }).format(now);
    };

    const currentDate = getFormattedDate();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#8D8DC7]" />
            </div>
        );
    }

    const HeroSection = (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{t("dashboard.welcome")}</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
                        {currentDate} • {t("dashboard.systemStatus")}: {data.stats.systemStatus === "Checking..." ? t("dashboard.statusChecking") : data.stats.systemStatus}
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex gap-3">
                    {/* Buttons removed as per request */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <StatsCard
                    title={t("dashboard.activeBorrowed")}
                    value={data.stats.activeBorrowed}
                    change={t("dashboard.live")}
                    changeType="positive"
                    subtext={t("dashboard.studentsWithItems")}
                    icon={Package}
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title={t("dashboard.totalUsers")}
                    value={data.stats.totalUsers}
                    change={t("dashboard.stable")}
                    changeType="positive"
                    subtext={t("dashboard.registeredAccounts")}
                    icon={Wifi}
                    onClick={() => navigate('/admin/users')}
                />
                <StatsCard
                    title={t("dashboard.atRiskItems")}
                    value={data.stats.atRiskItems}
                    change={t("dashboard.actionReq")}
                    changeType={data.stats.atRiskItems > 0 ? "negative" : "positive"}
                    subtext={`${data.stats.overdueCount || 0} ${t("dashboard.overdue")}, ${data.stats.maintenanceCount || 0} ${t("dashboard.maintenance")}${data.stats.damagedCount > 0 ? `, ${data.stats.damagedCount} ${t("dashboard.status.damaged")}` : ""}`}
                    icon={AlertTriangle}
                    isAlert={data.stats.atRiskItems > 0}
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title={t("dashboard.availableEquip")}
                    value={data.stats.availableEquipment}
                    change={t("dashboard.stock")}
                    changeType="positive"
                    subtext={t("dashboard.readyForCheckout")}
                    icon={Activity}
                    onClick={() => navigate('/admin/data')}
                />
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div onClick={() => navigate('/admin/monitoring')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#8D8DC7] mb-4 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{t("dashboard.borrowRequests", "Borrow Requests")}</h4>
                    <p className="text-xs text-gray-500 font-medium">{t("dashboard.managePending", "Manage pending equipment requests")}</p>
                </div>
                <div onClick={() => navigate('/admin/reports')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <FileBarChart className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{t("dashboard.activityReports", "Activity Reports")}</h4>
                    <p className="text-xs text-gray-500 font-medium">{t("dashboard.viewAnalytics", "View analytics and transaction logs")}</p>
                </div>
                <div onClick={() => navigate('/admin/profile')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{t("auth.myProfile")}</h4>
                    <p className="text-xs text-gray-500 font-medium">{t("profile.subtitle", "Manage your account settings")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Left Column: Recent Activity Table */}
                <div className="xl:col-span-2 space-y-6 h-full">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{t("dashboard.recentTransactions")}</h3>
                            <button onClick={() => navigate('/admin/reports')} className="text-sm font-black uppercase tracking-widest text-[#8D8DC7] hover:underline px-4 py-2 bg-slate-50 rounded-xl transition-colors">{t("dashboard.viewAll")}</button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-50 bg-white">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4">{t("reports.user")}</th>
                                        <th className="px-6 py-4">{t("reports.equipment")}</th>
                                        <th className="px-6 py-4">{t("reports.date")}</th>
                                        <th className="px-6 py-4 text-center">{t("reports.statusFilter")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentActivity.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">{t("dashboard.noRecentActivity")}</td></tr>
                                    ) : (
                                        data.recentActivity.map((tx) => (
                                            <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">{tx.user?.username || t('dashboard.status.unknown')}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{tx.equipment?.name || t('dashboard.status.deletedItem')}</td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tx.status === 'Checked Out' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        tx.status === 'Returned' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                        {tx.status === 'Checked Out' ? t('dashboard.status.checkedOut') :
                                                            tx.status === 'Returned' ? t('dashboard.status.returned') :
                                                                tx.status === 'Overdue' ? t('dashboard.status.overdue') :
                                                                    tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-6 h-full">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">{t("dashboard.quickActions")}</h3>
                        <div className="space-y-4">
                            <button onClick={() => navigate('/admin/users')} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold transition-all active:scale-95 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-lg shadow-sm"><Users /></span> {t("dashboard.manageUsers")}
                            </button>
                            <button onClick={() => navigate('/admin/config')} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold transition-all active:scale-95 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-lg shadow-sm"><Settings /></span> {t("dashboard.systemConfig")}
                            </button>
                            <button onClick={() => navigate('/admin/courses')} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold transition-all active:scale-95 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-lg shadow-sm"><BookOpen /></span> {t("dashboard.manageCourses")}
                            </button>
                            <button onClick={() => navigate('/admin/reports')} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold transition-all active:scale-95 flex items-center gap-3">
                                <span className="p-2 bg-white rounded-lg shadow-sm"><FileBarChart className="w-5 h-5 text-indigo-500" /></span> {t("dashboard.generateReport")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;