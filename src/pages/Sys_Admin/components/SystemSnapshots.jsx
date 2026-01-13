
import React from 'react';
import { Database, HardDrive, Server, AlertOctagon, Wrench, Shield, FileCheck, AlertCircle } from 'lucide-react';

const SystemSnapshots = () => {
    return (
        <div className="space-y-6">

            {/* 1. System Attention Indicators */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                    System Attention
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                        <div className="flex items-center text-red-700 font-medium">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                            Sensors Offline
                        </div>
                        <span className="font-bold text-slate-900">2</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                        <div className="flex items-center text-orange-700 font-medium">
                            <Wrench className="w-4 h-4 mr-3 text-orange-500" />
                            Maintenance Needed
                        </div>
                        <span className="font-bold text-slate-900">5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center text-gray-600 font-medium">
                            <AlertOctagon className="w-4 h-4 mr-3 text-gray-400" />
                            Config Warnings
                        </div>
                        <span className="font-bold text-slate-900">0</span>
                    </div>
                </div>
            </div>

            {/* 2. Policy & Configuration Snapshot */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-[#8D8DC7] mr-2" />
                    Active Policies
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-100 rounded-xl text-center">
                        <p className="text-xs text-gray-400 mb-1">Checkout Policy</p>
                        <p className="text-slate-900 font-bold text-sm">Standard</p>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-xl text-center">
                        <p className="text-xs text-gray-400 mb-1">Alert Rules</p>
                        <p className="text-green-600 font-bold text-sm">Enabled</p>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-xl text-center">
                        <p className="text-xs text-gray-400 mb-1">Resp. Score</p>
                        <p className="text-slate-900 font-bold text-sm">Active</p>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-xl text-center">
                        <p className="text-xs text-gray-400 mb-1">Restricted</p>
                        <p className="text-slate-900 font-bold text-sm">3 Cats</p>
                    </div>
                </div>
            </div>

            {/* 3. Data & System Health */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Server className="w-5 h-5 text-[#8D8DC7] mr-2" />
                        System Health
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center">
                                <Database className="w-4 h-4 mr-2" />
                                Last Backup
                            </span>
                            <span className="text-green-400 font-medium">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center">
                                <HardDrive className="w-4 h-4 mr-2" />
                                Storage
                            </span>
                            <span className="text-white font-medium">45% Used</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center">
                                <FileCheck className="w-4 h-4 mr-2" />
                                Uptime
                            </span>
                            <span className="text-green-400 font-medium">99.9%</span>
                        </div>
                    </div>
                </div>
                {/* Subtle glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D8DC7] opacity-10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            </div>

        </div>
    );
};

export default SystemSnapshots;
