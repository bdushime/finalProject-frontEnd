
import React from 'react';
import { Plus, CheckSquare, LogOut, FileText, Settings, Users, QrCode, Wifi, Wrench } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { label: 'Scan QR Code', icon: QrCode, color: 'bg-[#8D8DC7] text-white', hover: 'hover:bg-[#7b7bb5]', path: '/admin/scan' },
        { label: 'Log Maintenance', icon: Wrench, color: 'bg-orange-50 text-orange-700 border border-orange-100', hover: 'hover:bg-orange-100', path: '/admin/reports' }, // Using Reports as placeholder for Maintenance Log for now
        { label: 'Add Equipment', icon: Plus, color: 'bg-white text-slate-900 border border-gray-200', hover: 'hover:border-[#8D8DC7] hover:text-[#8D8DC7]', path: '/admin/equipment' },
        { label: 'Track Signal', icon: Wifi, color: 'bg-white text-slate-900 border border-gray-200', hover: 'hover:border-[#8D8DC7] hover:text-[#8D8DC7]', path: '/admin/tracking' },
    ];

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${action.color} ${action.hover} shadow-sm group`}
                    >
                        <action.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-center">{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">IoT Control</h4>
                <div className="space-y-2">
                    <button className="w-full flex items-center p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                        <Wifi className="w-4 h-4 mr-3 text-gray-400" />
                        Locate Device via Sensor
                    </button>
                    <button className="w-full flex items-center p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                        <QrCode className="w-4 h-4 mr-3 text-gray-400" />
                        Generate New QR Labels
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;
