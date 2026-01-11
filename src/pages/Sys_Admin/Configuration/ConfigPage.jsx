import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; // Check Path
import api from '@/utils/api';
import { Settings, MapPin, Tags, FileText, Scale, Bell, Mail, MessageSquare, QrCode, PenTool, ChevronRight, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ConfigPage = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Config State
    const [config, setConfig] = useState({
        systemName: 'Tracknity',
        timezone: 'Africa/Kigali',
        currency: 'RWF',
        maintenanceMode: false,
        studentLimit: 3,
        loanDuration: 3,
        maxRenewals: 1,
        latePenalty: 5,
        damagePenalty: 10
    });

    // FETCH CONFIG
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/config');
                setConfig(res.data);
            } catch (err) {
                console.error("Failed to load config", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // SAVE CONFIG
    const handleSave = async () => {
        try {
            await api.put('/config', config);
            toast.success("Settings saved successfully!");
            handleClose();
        } catch (err) {
            toast.error("Failed to save settings.");
        }
    };

    // UI Helpers
    const handleOpen = (sectionId) => {
        setActiveSection(sectionId);
        setTimeout(() => setIsAnimating(true), 10);
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => setActiveSection(null), 300);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const configSections = [
        { id: 'general', title: 'General Settings', description: 'System name, timezone, & maintenance.', icon: Settings, color: 'bg-blue-50 text-blue-600' },
        { id: 'policies', title: 'Checkout Policies', description: 'Loan durations & limits.', icon: FileText, color: 'bg-orange-50 text-orange-600' },
        { id: 'responsibility', title: 'Responsibility Score', description: 'Scoring rules & penalties.', icon: Scale, color: 'bg-rose-50 text-rose-600' },
        // ... (Keep other static sections or implement them similarly)
        { id: 'locations', title: 'Locations', description: 'Manage storage areas.', icon: MapPin, color: 'bg-emerald-50 text-emerald-600' }
    ];

    const renderContent = (id) => {
        switch (id) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">System Name</label>
                            <input name="systemName" value={config.systemName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Timezone</label>
                                <select name="timezone" value={config.timezone} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                                    <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Currency</label>
                                <select name="currency" value={config.currency} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white">
                                    <option value="RWF">RWF (Rwandan Franc)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-800 text-sm">Maintenance Mode</h4>
                                <p className="text-xs text-blue-600">Prevent non-admin logins.</p>
                            </div>
                            <input type="checkbox" name="maintenanceMode" checked={config.maintenanceMode} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                        </div>
                    </div>
                );
            case 'policies':
                return (
                    <div className="space-y-6">
                        <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                            <h3 className="font-bold text-slate-800">Student Limits</h3>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-sm text-slate-600">Max Items</span>
                                <input type="number" name="studentLimit" value={config.studentLimit} onChange={handleChange} className="w-20 px-2 py-1 border rounded text-center" />
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-600">Loan Duration (Days)</span>
                                <input type="number" name="loanDuration" value={config.loanDuration} onChange={handleChange} className="w-20 px-2 py-1 border rounded text-center" />
                            </div>
                        </div>
                    </div>
                );
            case 'responsibility':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                            <h3 className="font-bold text-rose-800">Score Logic</h3>
                            <p className="text-xs text-rose-600">Automatic score deductions.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-700">
                                    <span>Late Penalty (per day)</span>
                                    <span className="text-rose-600 font-bold">-{config.latePenalty} pts</span>
                                </label>
                                <input type="range" name="latePenalty" min="1" max="20" value={config.latePenalty} onChange={handleChange} className="w-full accent-rose-500" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="text-center py-10 text-gray-400">Settings for this section coming soon.</div>;
        }
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Configuration</h1>
                <p className="text-gray-400">Manage all system settings globally.</p>
            </div>
        </div>
    );

    const activeSectionData = configSections.find(s => s.id === activeSection);
    const ActiveIcon = activeSectionData?.icon;

    if (loading) return <AdminLayout heroContent={HeroSection}><div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#8D8DC7]" /></div></AdminLayout>;

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button key={section.id} onClick={() => handleOpen(section.id)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
                            <div className={`w-12 h-12 rounded-2xl ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#8D8DC7]">{section.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{section.description}</p>
                            <div className="flex items-center text-xs font-semibold text-gray-400 group-hover:text-[#8D8DC7]">Configure <ChevronRight className="w-4 h-4 ml-1" /></div>
                        </button>
                    );
                })}
            </div>

            {/* Modal */}
            {activeSection && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
                    <div className={`bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-xl ${activeSectionData.color} flex items-center justify-center mr-3`}><ActiveIcon className="w-5 h-5" /></div>
                                <div><h2 className="text-xl font-bold text-slate-900">{activeSectionData.title}</h2></div>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1">{renderContent(activeSection)}</div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end space-x-3">
                            <button onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-white">Cancel</button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[#8D8DC7] text-white font-medium hover:bg-[#7b7bb5] flex items-center gap-2">
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ConfigPage;