import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Database, Download, Upload, Trash2, Archive, RefreshCw, HardDrive, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const DataPage = () => {
    // Mock Data for Backups
    const [backups, setBackups] = useState([
        { id: 1, name: "Full_Backup_2024_10_25.sql", size: "1.2 GB", date: "Oct 25, 2024 - 02:00 AM", type: "Full", status: "Success" },
        { id: 2, name: "Incremental_Backup_2024_10_24.sql", size: "450 MB", date: "Oct 24, 2024 - 02:00 AM", type: "Incremental", status: "Success" },
        { id: 3, name: "Full_Backup_2024_10_23.sql", size: "1.1 GB", date: "Oct 23, 2024 - 02:00 AM", type: "Full", status: "Success" },
    ]);

    const [isCreatingBackup, setIsCreatingBackup] = useState(false);

    const handleCreateBackup = () => {
        setIsCreatingBackup(true);
        // Simulate API call
        setTimeout(() => {
            const newBackup = {
                id: Date.now(),
                name: `Manual_Backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}.sql`,
                size: "0.2 MB",
                date: "Just now",
                type: "Manual",
                status: "Success"
            };
            setBackups([newBackup, ...backups]);
            setIsCreatingBackup(false);
            alert("Backup created successfully!");
        }, 2000);
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Data Management</h1>
                <p className="text-gray-400">Manage database backups, exports, imports, and system cleanup.</p>
            </div>
            <div className="mt-6 md:mt-0">
                <button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-6 rounded-2xl shadow-lg shadow-[#8D8DC7]/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center"
                >
                    {isCreatingBackup ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <Database className="w-5 h-5 mr-2" />
                    )}
                    {isCreatingBackup ? "Backing up..." : "Create New Backup"}
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="space-y-6">

                {/* 1. Database Backup & Restore Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <HardDrive className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Database Backups</h2>
                                <p className="text-sm text-gray-500">View and restore previous system snapshots.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4 pl-0">Filename</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Date Created</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {backups.map((backup) => (
                                    <tr key={backup.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-0 font-medium text-slate-700 font-mono text-sm">{backup.name}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{backup.type}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{backup.size}</td>
                                        <td className="p-4 text-sm text-gray-500 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {backup.date}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                {backup.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="text-sm text-[#8D8DC7] hover:underline font-medium">Restore</button>
                                                <button className="text-sm text-red-500 hover:underline font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Export & Import Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Export Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Download className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Export Data</h3>
                                <p className="text-sm text-gray-500">Download system data in various formats.</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                            <div className="p-4 border border-gray-100 rounded-xl hover:border-[#8D8DC7]/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#8D8DC7]" />
                                        <div>
                                            <p className="font-semibold text-slate-800">All Equipment Data</p>
                                            <p className="text-xs text-gray-500">Includes history and status</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg group-hover:bg-[#8D8DC7] group-hover:text-white transition-colors">CSV</button>
                                </div>
                            </div>

                            <div className="p-4 border border-gray-100 rounded-xl hover:border-[#8D8DC7]/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#8D8DC7]" />
                                        <div>
                                            <p className="font-semibold text-slate-800">User Records</p>
                                            <p className="text-xs text-gray-500">Profiles and activity logs</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg group-hover:bg-[#8D8DC7] group-hover:text-white transition-colors">JSON</button>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors">
                            Export All System Data
                        </button>
                    </div>

                    {/* Import Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 rounded-xl">
                                <Upload className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Import Data</h3>
                                <p className="text-sm text-gray-500">Restore data from external files.</p>
                            </div>
                        </div>

                        <div className="flex-grow flex flex-col justify-center items-center border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-[#8D8DC7] transition-colors cursor-pointer bg-gray-50/50">
                            <Upload className="w-10 h-10 text-gray-300 mb-3" />
                            <p className="text-slate-600 font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400">CSV, JSON, or SQL files (Max 50MB)</p>
                        </div>
                        <button className="w-full mt-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors" disabled>
                            Start Import
                        </button>
                    </div>
                </div>

                {/* 3. Cleanup & Archive Tools */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-xl">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Data Cleanup & Archiving</h2>
                                <p className="text-sm text-gray-500">Manage storage and remove obsolete data.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-red-50/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Clear System Logs</h4>
                                    <p className="text-xs text-gray-500 mb-3">Remove logs older than 90 days.</p>
                                    <button className="text-xs font-bold text-red-500 hover:underline">Execute Cleanup</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-orange-50/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <Archive className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Archive Old Records</h4>
                                    <p className="text-xs text-gray-500 mb-3">Move inactive records to cold storage.</p>
                                    <button className="text-xs font-bold text-orange-500 hover:underline">Run Archiver</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-yellow-50/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Delete Temporary Files</h4>
                                    <p className="text-xs text-gray-500 mb-3">Free up cache and temp storage.</p>
                                    <button className="text-xs font-bold text-slate-600 hover:underline">Clear Cache</button>
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
