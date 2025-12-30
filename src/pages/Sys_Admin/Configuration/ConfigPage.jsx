import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
    Settings, MapPin, Tags, FileText, Scale,
    Bell, Mail, MessageSquare, QrCode, PenTool,
    ChevronRight, ArrowLeft, X
} from 'lucide-react';

// We will import the actual forms here later
// import GeneralSettings from './components/GeneralSettings';
// import LocationManager from './components/LocationManager';

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
            borderColor: 'border-blue-100'
        },
        {
            id: 'locations',
            title: 'Department & Locations',
            description: 'Manage campus departments, buildings, and storage locations.',
            icon: MapPin,
            color: 'bg-emerald-50 text-emerald-600',
            borderColor: 'border-emerald-100'
        },
        {
            id: 'categories',
            title: 'Equipment Categories',
            description: 'Define equipment types, categories, and custom attributes.',
            icon: Tags,
            color: 'bg-purple-50 text-purple-600',
            borderColor: 'border-purple-100'
        },
        {
            id: 'policies',
            title: 'Checkout Policies',
            description: 'Set loan durations, limits, and renewal rules per role.',
            icon: FileText,
            color: 'bg-orange-50 text-orange-600',
            borderColor: 'border-orange-100'
        },
        {
            id: 'responsibility',
            title: 'Responsibility Score',
            description: 'Configure scoring rules, penalties, and trust levels.',
            icon: Scale,
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'border-rose-100'
        },
        {
            id: 'alerts',
            title: 'Alert Config',
            description: 'Manage system alerts, overdue notifications, and triggers.',
            icon: Bell,
            color: 'bg-amber-50 text-amber-600',
            borderColor: 'border-amber-100'
        },
        {
            id: 'email',
            title: 'Email Templates',
            description: 'Customize email notifications for checkouts, returns, and warnings.',
            icon: Mail,
            color: 'bg-indigo-50 text-indigo-600',
            borderColor: 'border-indigo-100'
        },
        {
            id: 'sms',
            title: 'SMS Settings',
            description: 'Configure SMS gateway and message templates (Optional).',
            icon: MessageSquare,
            color: 'bg-cyan-50 text-cyan-600',
            borderColor: 'border-cyan-100'
        },
        {
            id: 'qr',
            title: 'QR Code Settings',
            description: 'Adjust QR code generation formats and label sizes.',
            icon: QrCode,
            color: 'bg-slate-100 text-slate-600',
            borderColor: 'border-slate-200'
        },
        {
            id: 'branding',
            title: 'System Branding',
            description: 'Update logos, colors, and portal themes.',
            icon: PenTool,
            color: 'bg-pink-50 text-pink-600',
            borderColor: 'border-pink-100'
        }
    ];

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
                                <p className="text-sm text-gray-500 mb-4">{section.description}</p>

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
                                        <p className="text-xs text-gray-500">Configuration</p>
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
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-full">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <PenTool className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Editor Coming Soon</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        We are actively building the settings form for <br />
                                        <span className="font-medium text-slate-900">{activeSectionData.title}</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl flex justify-end space-x-3 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl bg-[#8D8DC7] text-white font-medium hover:bg-[#7b7bb5] shadow-lg shadow-[#8D8DC7]/20 transition-all active:scale-95"
                                >
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
