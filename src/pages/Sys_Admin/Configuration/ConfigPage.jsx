import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
    Settings, MapPin, Tags, FileText, Scale,
    Bell, Mail, MessageSquare, QrCode, PenTool,
    ChevronRight, ArrowLeft, X, Save, CheckCircle
} from 'lucide-react';

const ConfigPage = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle Escape Key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleOpen = (sectionId) => {
        setActiveSection(sectionId);
        // Small delay to allow render before animating in
        setTimeout(() => setIsAnimating(true), 10);
    };

    const handleClose = () => {
        setIsAnimating(false);
        // Wait for animation to finish before removing from DOM
        setTimeout(() => setActiveSection(null), 300);
    };

    const configSections = [
        {
            id: 'general',
            title: 'General System Settings',
            description: 'Configure system name, timezone, default currency, and localization.',
            icon: Settings,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            id: 'locations',
            title: 'Department & Locations',
            description: 'Manage campus departments, buildings, and storage locations.',
            icon: MapPin,
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            id: 'categories',
            title: 'Equipment Categories',
            description: 'Define equipment types, categories, and custom attributes.',
            icon: Tags,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            id: 'policies',
            title: 'Checkout Policies',
            description: 'Set loan durations, limits, and renewal rules per role.',
            icon: FileText,
            color: 'bg-orange-50 text-orange-600',
        },
        {
            id: 'responsibility',
            title: 'Responsibility Score',
            description: 'Configure scoring rules, penalties, and trust levels.',
            icon: Scale,
            color: 'bg-rose-50 text-rose-600',
        },
        {
            id: 'alerts',
            title: 'Alert Config',
            description: 'Manage system alerts, overdue notifications, and triggers.',
            icon: Bell,
            color: 'bg-amber-50 text-amber-600',
        },
        {
            id: 'email',
            title: 'Email Templates',
            description: 'Customize email notifications for checkouts, returns, and warnings.',
            icon: Mail,
            color: 'bg-indigo-50 text-indigo-600',
        },
        {
            id: 'sms',
            title: 'SMS Settings',
            description: 'Configure SMS gateway and message templates (Optional).',
            icon: MessageSquare,
            color: 'bg-cyan-50 text-cyan-600',
        },
        {
            id: 'qr',
            title: 'QR Code Settings',
            description: 'Adjust QR code generation formats and label sizes.',
            icon: QrCode,
            color: 'bg-slate-100 text-slate-600',
        },
        {
            id: 'branding',
            title: 'System Branding',
            description: 'Update logos, colors, and portal themes.',
            icon: PenTool,
            color: 'bg-pink-50 text-pink-600',
        }
    ];

    const renderContent = (id) => {
        switch (id) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">System Name</label>
                            <input type="text" defaultValue="Tracknity" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Timezone</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                                    <option>Africa/Kigali (GMT+2)</option>
                                    <option>UTC</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Currency</label>
                                <select className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                                    <option>RWF (Rwandan Franc)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Academic Year Start</label>
                            <input type="date" defaultValue="2024-09-01" className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-800 text-sm mb-1">Maintenance Mode</h4>
                            <p className="text-xs text-blue-600 mb-3">Enable this to prevent students from logging in while you make changes.</p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className="w-10 h-6 bg-slate-200 rounded-full relative transition-colors"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 transition-transform"></div></div>
                                <span className="text-sm font-medium text-slate-600">Maintenance Mode Off</span>
                            </label>
                        </div>
                    </div>
                );
            case 'policies':
                return (
                    <div className="space-y-6">
                        <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                            <h3 className="font-bold text-slate-800">Student Borrowing Limits</h3>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Max Items per Student</span>
                                <input type="number" defaultValue="3" className="w-20 px-2 py-1 border rounded text-center" />
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Default Loan Duration (Days)</span>
                                <input type="number" defaultValue="3" className="w-20 px-2 py-1 border rounded text-center" />
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-600">Max Renewals Allowed</span>
                                <input type="number" defaultValue="1" className="w-20 px-2 py-1 border rounded text-center" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-800">Restrictions</h3>
                            {['Require Approval for High-Value Items', 'Block borrowing if Score < 50%', 'Allow Overnight Checkout'].map(item => (
                                <label key={item} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'responsibility':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Scale className="h-5 w-5 text-rose-600" />
                                <h3 className="font-bold text-rose-800">Score Impact Logic</h3>
                            </div>
                            <p className="text-xs text-rose-600">Configure how student reliability scores are calculated automatically.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-700">
                                    <span>Late Return Penalty (per day)</span>
                                    <span className="text-rose-600 font-bold">-5 pts</span>
                                </label>
                                <input type="range" className="w-full accent-rose-500" min="1" max="20" defaultValue="5" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-700">
                                    <span>Damage Penalty (Minor)</span>
                                    <span className="text-rose-600 font-bold">-10 pts</span>
                                </label>
                                <input type="range" className="w-full accent-rose-500" min="5" max="50" defaultValue="10" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-700">
                                    <span>On-Time Return Bonus</span>
                                    <span className="text-emerald-600 font-bold">+2 pts</span>
                                </label>
                                <input type="range" className="w-full accent-emerald-500" min="1" max="10" defaultValue="2" />
                            </div>
                        </div>
                    </div>
                );
            case 'locations':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-800">All Locations</h3>
                            <button className="text-xs font-bold text-blue-600 hover:underline">+ Add New</button>
                        </div>
                        {['Main Campus - IT Lab', 'Main Campus - Media Center', 'Science Building - Storage A', 'Science Building - Storage B'].map((loc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{loc}</span>
                                </div>
                                <button className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                            </div>
                        ))}
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-slate-300 shadow-sm">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Coming Soon</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            The advanced settings for <span className="font-medium text-slate-900">{activeSectionData?.title}</span> are under development.
                        </p>
                    </div>
                );
        }
    }

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Configuration</h1>
                <p className="text-gray-400">Manage all system settings and preferences from one central hub.</p>
            </div>
        </div>
    );

    const activeSectionData = configSections.find(s => s.id === activeSection);
    const ActiveIcon = activeSectionData?.icon;

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="relative">
                {/* Main Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => handleOpen(section.id)}
                                className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden`}
                            >
                                <div className={`w-12 h-12 rounded-2xl ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#8D8DC7] transition-colors">{section.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{section.description}</p>

                                <div className="flex items-center text-xs font-semibold text-gray-400 group-hover:text-[#8D8DC7] transition-colors">
                                    Configure
                                    <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Centered Modal Overlay (Backdrop) */}
                {activeSection && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                            }`}
                        onClick={handleClose}
                    >
                        {/* Modal Panel */}
                        <div
                            className={`bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
                                }`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-xl ${activeSectionData.color} flex items-center justify-center mr-3`}>
                                        <ActiveIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{activeSectionData.title}</h2>
                                        <p className="text-xs text-gray-500">Configuration Panel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="p-8 overflow-y-auto flex-1">
                                {renderContent(activeSection)}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end space-x-3 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl bg-[#8D8DC7] text-white font-medium hover:bg-[#7b7bb5] shadow-lg shadow-[#8D8DC7]/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ConfigPage;
