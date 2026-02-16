import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; // Check path
import api from '@/utils/api';
import { Database, Download, Upload, Trash2, Archive, RefreshCw, HardDrive, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from "react-i18next";

const DataPage = () => {
    const { t } = useTranslation(["admin", "common"]);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);

    // FETCH BACKUPS
    useEffect(() => {
        const fetchBackups = async () => {
            try {
                const res = await api.get('/data/backups');
                setBackups(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBackups();
    }, []);

    // CREATE BACKUP
    const handleCreateBackup = async () => {
        setIsCreatingBackup(true);
        try {
            const res = await api.post('/data/backups');
            setBackups([res.data, ...backups]);
            toast.success(t('data.messages.backupSuccess'));
        } catch (err) {
            toast.error(t('data.messages.backupFailure'));
        } finally {
            setIsCreatingBackup(false);
        }
    };

    // EXPORT DATA
    const handleExport = async (type) => {
        try {
            const res = await api.get(`/data/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_export.csv`);
            document.body.appendChild(link);
            link.click();
            toast.success(`${type} ${t('data.messages.exportSuccess')}`);
        } catch (err) {
            toast.error(t('data.messages.exportFailure'));
        }
    };

    // CLEANUP
    const handleCleanup = async () => {
        if (!window.confirm(t('data.cleanup.confirm'))) return;
        try {
            const res = await api.delete('/data/cleanup');
            toast.success(res.data.message);
        } catch (err) {
            toast.error(t('data.messages.cleanupFailure'));
        }
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('data.title')}</h1>
                <p className="text-gray-400">{t('data.subtitle')}</p>
            </div>
            <div className="mt-6 md:mt-0">
                <button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center"
                >
                    {isCreatingBackup ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Database className="w-5 h-5 mr-2" />}
                    {isCreatingBackup ? t('data.backups.backingUp') : t('data.backups.create')}
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">

                {/* 1. Backups Table */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-xl"><HardDrive className="w-6 h-6 text-blue-600" /></div>
                        <div><h2 className="text-xl font-bold text-slate-900">{t('data.backups.title')}</h2></div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4 pl-0">{t('data.backups.filename')}</th>
                                    <th className="p-4">{t('data.backups.type')}</th>
                                    <th className="p-4">{t('data.backups.size')}</th>
                                    <th className="p-4">{t('data.backups.date')}</th>
                                    <th className="p-4">{t('data.backups.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                                ) : backups.map((backup) => (
                                    <tr key={backup.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-0 font-medium text-slate-700 font-mono text-sm">{backup.name}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{backup.type}</span></td>
                                        <td className="p-4 text-sm text-gray-600">{backup.size}</td>
                                        <td className="p-4 text-sm text-gray-500 flex items-center gap-2"><Clock className="w-3 h-3" /> {backup.date}</td>
                                        <td className="p-4"><span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1" /> {backup.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Export Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-xl"><Download className="w-6 h-6 text-indigo-600" /></div>
                            <h3 className="text-lg font-bold text-slate-900">{t('data.export.title')}</h3>
                        </div>

                        <div className="space-y-4 flex-grow">
                            {/* Equipment Export */}
                            <div onClick={() => handleExport('equipment')} className="p-4 border border-gray-100 rounded-xl hover:border-[#8D8DC7]/30 transition-colors cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#8D8DC7]" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{t('data.export.equipmentTitle')}</p>
                                        <p className="text-xs text-gray-500">{t('data.export.equipmentDesc')}</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">{t('data.export.csv')}</button>
                            </div>

                            {/* User Export */}
                            <div onClick={() => handleExport('users')} className="p-4 border border-gray-100 rounded-xl hover:border-[#8D8DC7]/30 transition-colors cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#8D8DC7]" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{t('data.export.usersTitle')}</p>
                                        <p className="text-xs text-gray-500">{t('data.export.usersDesc')}</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">{t('data.export.csv')}</button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Cleanup Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-50 rounded-xl"><Trash2 className="w-6 h-6 text-red-500" /></div>
                            <h2 className="text-xl font-bold text-slate-900">{t('data.cleanup.title')}</h2>
                        </div>

                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-red-50/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FileText className="w-5 h-5" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{t('data.cleanup.clearLogs')}</h4>
                                    <p className="text-xs text-gray-500 mb-3">{t('data.cleanup.clearLogsDesc')}</p>
                                    <button onClick={handleCleanup} className="text-xs font-bold text-red-500 hover:underline">{t('data.cleanup.execute')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DataPage;