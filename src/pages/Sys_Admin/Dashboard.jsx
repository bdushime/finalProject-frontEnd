import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout'; // Your layout file
import StatsCard from './components/StatsCard';
import api from '@/utils/api';
import {
    Package,
    Wifi,
    AlertTriangle,
    UserX,
    Clock,
    ChevronDown,
    QrCode,
    ShieldAlert,
    Activity,
    Loader2
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
                setData(res.data);
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
                    trend="positive"
                    subtext={t("dashboard.studentsWithItems")}
                    icon={Package}
                    dark
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title={t("dashboard.totalUsers")}
                    value={data.stats.totalUsers}
                    change={t("dashboard.stable")}
                    trend="positive"
                    subtext={t("dashboard.registeredAccounts")}
                    icon={Wifi}
                    dark
                    onClick={() => navigate('/admin/users')}
                />
                <StatsCard
                    title={t("dashboard.atRiskItems")}
                    value={data.stats.atRiskItems}
                    change={t("dashboard.actionReq")}
                    trend={data.stats.atRiskItems > 0 ? "negative" : "positive"}
                    subtext={t("dashboard.overdueItemsDesc")}
                    icon={AlertTriangle}
                    dark
                    isAlert={data.stats.atRiskItems > 0}
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title={t("dashboard.availableEquip")}
                    value={data.stats.availableEquipment}
                    change={t("dashboard.stock")}
                    trend="positive"
                    subtext={t("dashboard.readyForCheckout")}
                    icon={Activity} // Changed icon
                    onClick={() => navigate('/admin/data')}
                />
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Left Column: Recent Activity Table */}
                <div className="xl:col-span-2 space-y-6 h-full">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg font-bold text-slate-900">{t("dashboard.recentTransactions")}</h3>
                            <button onClick={() => navigate('/admin/reports')} className="text-sm text-[#8D8DC7] font-medium hover:underline">{t("dashboard.viewAll")}</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3">{t("reports.user")}</th>
                                        <th className="px-4 py-3">{t("reports.equipment")}</th>
                                        <th className="px-4 py-3">{t("reports.date")}</th>
                                        <th className="px-4 py-3">{t("reports.statusFilter")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentActivity.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">{t("dashboard.noRecentActivity")}</td></tr>
                                    ) : (
                                        data.recentActivity.map((tx) => (
                                            <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{tx.user?.username || 'Unknown'}</td>
                                                <td className="px-4 py-3">{tx.equipment?.name || 'Deleted Item'}</td>
                                                <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'Checked Out' ? 'bg-blue-100 text-blue-700' :
                                                        tx.status === 'Returned' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {tx.status}
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

                {/* Right Column: Quick Actions (Static for now) */}
                <div className="space-y-6 h-full">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">{t("dashboard.quickActions")}</h3>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/admin/users')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                👥 {t("dashboard.manageUsers")}
                            </button>
                            <button onClick={() => navigate('/admin/config')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                ⚙️ {t("dashboard.systemConfig")}
                            </button>
                            <button onClick={() => navigate('/admin/reports')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                📊 {t("dashboard.generateReport")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;