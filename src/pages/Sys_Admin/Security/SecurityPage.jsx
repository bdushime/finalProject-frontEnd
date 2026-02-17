import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; // Ensure path is correct (../components/AdminLayout)
import api from '@/utils/api';
import {
    Shield, Lock, FileText, Users, AlertTriangle, CheckCircle, Search,
    Filter, Download, Activity, Globe, Smartphone, Clock, XCircle, Loader2
} from 'lucide-react';

import { useTranslation } from "react-i18next";

const SecurityPage = () => {
    const { t } = useTranslation(["admin", "common"]);
    const [activeTab, setActiveTab] = useState("audit");
    const [searchTerm, setSearchTerm] = useState("");

    // Dynamic Data State
    const [data, setData] = useState({
        auditLogs: [],
        complianceItems: [],
        activeSessions: []
    });
    const [loading, setLoading] = useState(true);

    // FETCH REAL DATA 🚀
    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                const res = await api.get('/security');
                setData(res.data);
            } catch (err) {
                console.error("Failed to load security data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSecurityData();
    }, []);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('security.title')}</h1>
                <p className="text-gray-400">{t('security.subtitle')}</p>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-700 mt-4 md:mt-0">
                <Download className="w-4 h-4" /> {t('security.export')}
            </button>
        </div>
    );

    if (loading) {
        return (
            <AdminLayout heroContent={HeroSection}>
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#8D8DC7]" />
                </div>
            </AdminLayout>
        );
    }

    // --- RENDERERS ---

    const renderAuditLogs = () => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('security.audit.search')}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] bg-gray-50 text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="p-4 pl-0">{t('security.audit.timestamp')}</th>
                            <th className="p-4">{t('security.audit.user')}</th>
                            <th className="p-4">{t('security.audit.action')}</th>
                            <th className="p-4">{t('security.audit.target')}</th>
                            <th className="p-4">{t('security.audit.ip')}</th>
                            <th className="p-4">{t('security.audit.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.auditLogs
                            .filter(l => l.user.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 text-sm font-mono border-l-4 border-transparent rounded-l-xl">
                                        {log.time}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700">{log.user}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${log.severity === 'High' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">{log.target}</td>
                                    <td className="p-4 text-gray-500 text-xs font-mono">{log.ip}</td>
                                    <td className="p-4 rounded-r-xl">
                                        <span className="flex items-center text-green-600 text-xs font-bold gap-1">
                                            <CheckCircle className="w-3 h-3" /> {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        {data.auditLogs.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">{t('security.audit.noLogs')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCompliance = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.complianceItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-[#8D8DC7]/10 p-3 rounded-full">
                                <Shield className="w-6 h-6 text-[#8D8DC7]" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Compliant' ? 'bg-green-100 text-green-700' :
                                    item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.policy}</h3>
                        <p className="text-gray-500 text-sm mb-4">{item.details}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 font-medium pt-4 border-t border-gray-50">
                        <Clock className="w-3 h-3 mr-1" /> {t('security.compliance.checked')} {item.lastCheck}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderActiveSessions = () => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" /> {t('security.sessions.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.activeSessions.map((session, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-2xl p-5 hover:border-[#8D8DC7] transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg uppercase">
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
                                <Clock className="w-4 h-4 mr-2 text-gray-400" /> {t('security.sessions.login')} {session.loginTime}
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-gray-50 text-red-600 font-medium py-2 rounded-lg text-sm hover:bg-red-50 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100">
                            Revoke Access
                        </button>
                    </div>
                ))}
                {data.activeSessions.length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-10">{t('security.sessions.noSessions')}</div>
                )}
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-100 shadow-sm">
                    {[
                        { id: 'audit', label: t('security.tabs.audit') },
                        { id: 'compliance', label: t('security.tabs.compliance') },
                        { id: 'sessions', label: t('security.tabs.sessions') }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex-grow md:flex-grow-0 text-center ${activeTab === tab.id
                                    ? 'bg-[#8D8DC7] text-white shadow-lg shadow-[#8D8DC7]/20'
                                    : 'text-gray-500 hover:text-[#8D8DC7] hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === "audit" && renderAuditLogs()}
                    {activeTab === "compliance" && renderCompliance()}
                    {activeTab === "sessions" && renderActiveSessions()}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SecurityPage;