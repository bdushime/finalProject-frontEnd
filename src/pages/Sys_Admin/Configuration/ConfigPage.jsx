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
        systemName: 'Tracknity Equipment Tracker',
        timezone: 'Africa/Kigali',
        maintenanceMode: false,
        // Policies
        studentMaxHours: 4,
        studentMaxMins: 30,
        studentMaxItems: 3,
        staffDuration: '24 Hours',
        staffApproval: 'No',
        // Responsibility
        latePenalty: 5,
        damagePenalty: 10,
        // Alerts
        alertOverdue: true,
        alertLowStock: true,
        alertUnauthorized: true,
        alertMaintenance: false,

        // Email Defaults
        emailReceiptSubject: 'Equipment Checkout Confirmation',
        emailReceiptContent: '<p>Dear {student_name},</p><p>You have successfully checked out {item_count} items. Please return them by {return_date}.</p><p style="font-size:12px; color: #666;">Thank you for using Tracknity System.</p>',
        emailOverdueSubject: 'URGENT: Equipment Overdue',
        emailOverdueContent: '<p>Dear {student_name},</p><p>This is a reminder that you have items that are overdue. Please return them immediately to avoid penalties.</p>',

        locations: [
            { id: 1, name: 'Main Library - Floor 1', type: 'Study Zone' },
            { id: 2, name: 'IT Lab 2 - Science Block', type: 'Restricted Lab' },
            { id: 3, name: 'Media Center - West Wing', type: 'Equipment Room' }
        ],
        categories: [
            { id: 1, name: 'Projectors', code: 'P' },
            { id: 2, name: 'HDMI Cables', code: 'H' },
            { id: 3, name: 'Power Cords', code: 'P' },
            { id: 4, name: 'Adapters', code: 'A' },
            { id: 5, name: 'Extension Cords', code: 'E' }
        ]
    });

    // FETCH CONFIG
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/config');
                // Merge fetched config with default lists and new fields if they don't exist in response
                setConfig(prev => ({ ...prev, ...res.data }));
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

    // --- Interaction States & Handlers ---
    const [emailTab, setEmailTab] = useState('receipt');
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [newZone, setNewZone] = useState({ name: '', type: '' });
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', code: '' });

    const saveZone = () => {
        if (!newZone.name) return toast.error("Name is required");
        setConfig(prev => ({
            ...prev,
            locations: [{ id: Date.now(), ...newZone }, ...(prev.locations || [])]
        }));
        setNewZone({ name: '', type: '' });
        setIsAddingZone(false);
    };

    const saveCategory = () => {
        if (!newCategory.name || !newCategory.code) return toast.error("Name and Code required");
        setConfig(prev => ({
            ...prev,
            categories: [{ id: Date.now(), ...newCategory }, ...(prev.categories || [])]
        }));
        setNewCategory({ name: '', code: '' });
        setIsAddingCategory(false);
    };

    const handleDeleteItem = (listName, id) => {
        setConfig(prev => ({
            ...prev,
            [listName]: prev[listName].filter(item => item.id !== id)
        }));
    };

    const insertVariable = (variable) => {
        const fieldName = emailTab === 'receipt' ? "emailReceiptContent" : "emailOverdueContent";
        setConfig(prev => ({
            ...prev,
            [fieldName]: (prev[fieldName] || '') + variable
        }));
    };

    const configSections = [
        { id: 'general', title: 'General System Settings', description: 'Configure system name, timezone, default currency, and localization.', icon: Settings, color: 'bg-blue-50 text-blue-600' },
        { id: 'locations', title: 'Department & Locations', description: 'Manage campus departments, buildings, and storage locations.', icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'categories', title: 'Equipment Categories', description: 'Define equipment types, categories, and custom attributes.', icon: Tags, color: 'bg-purple-50 text-purple-600' },
        { id: 'policies', title: 'Checkout Policies', description: 'Set borrow durations, limits, and renewal rules per role.', icon: FileText, color: 'bg-orange-50 text-orange-600' },
        { id: 'responsibility', title: 'Responsibility Score', description: 'Configure scoring rules, penalties, and trust levels.', icon: Scale, color: 'bg-rose-50 text-rose-600' },
        { id: 'alerts', title: 'Alert Config', description: 'Manage system alerts, overdue notifications, and triggers.', icon: Bell, color: 'bg-amber-50 text-amber-600' },
        { id: 'email', title: 'Email Templates', description: 'Customize email notifications for checkouts, returns, and warnings.', icon: Mail, color: 'bg-indigo-50 text-indigo-600' },
        { id: 'qrcode', title: 'QR Code Settings', description: 'Adjust QR code generation formats and label sizes.', icon: QrCode, color: 'bg-slate-50 text-slate-600' },
        { id: 'branding', title: 'System Branding', description: 'Update logos, colors, and portal themes.', icon: PenTool, color: 'bg-pink-50 text-pink-600' }
    ];

    const renderContent = (id) => {
        switch (id) {
            case 'general':
                return (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Name</label>
                                    <input
                                        name="systemName"
                                        value={config.systemName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                                    <div className="relative">
                                        <select
                                            name="timezone"
                                            value={config.timezone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none font-medium text-slate-700"
                                        >
                                            <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight className="w-5 h-5 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Maintenance Mode</h4>
                                    <p className="text-xs text-blue-600/80 mt-0.5">Enable this to prevent students from logging in while you make changes.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="maintenanceMode" checked={config.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className={`ml-3 text-sm font-medium ${config.maintenanceMode ? 'text-blue-600' : 'text-slate-500'}`}>{config.maintenanceMode ? 'On' : 'Off'}</span>
                            </label>
                        </div>
                    </div>
                );
            case 'locations':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Campus IoT Zones</h3>
                            <button
                                onClick={() => setIsAddingZone(true)}
                                className="px-4 py-2 bg-[#8D8DC7] text-white text-sm font-medium rounded-lg hover:bg-[#7b7bb5] transition-colors shadow-sm shadow-indigo-200"
                            >
                                + Add Zone
                            </button>
                        </div>
                        <div className="space-y-3">
                            {isAddingZone && (
                                <div className="p-4 border-2 border-[#8D8DC7] rounded-2xl flex items-center justify-between bg-indigo-50/10 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#8D8DC7] flex items-center justify-center">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4 mr-4">
                                            <input
                                                placeholder="Zone Name (e.g. Design Lab)"
                                                value={newZone.name}
                                                onChange={e => setNewZone({ ...newZone, name: e.target.value })}
                                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-[#8D8DC7]"
                                                autoFocus
                                            />
                                            <input
                                                placeholder="Type (e.g. Lab)"
                                                value={newZone.type}
                                                onChange={e => setNewZone({ ...newZone, type: e.target.value })}
                                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:border-[#8D8DC7]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={saveZone} className="p-2 bg-[#8D8DC7] text-white rounded-lg hover:bg-[#7b7bb5]"><Save className="w-4 h-4" /></button>
                                        <button onClick={() => setIsAddingZone(false)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )}

                            {config.locations?.map((loc) => (
                                <div key={loc.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors group bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{loc.name}</h4>
                                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                                                {loc.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <PenTool className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem('locations', loc.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'categories':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Equipment Categories</h3>
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="px-4 py-2 bg-[#8D8DC7] text-white text-sm font-medium rounded-lg hover:bg-[#7b7bb5] transition-colors shadow-sm shadow-indigo-200"
                            >
                                + New Category
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isAddingCategory && (
                                <div className="p-4 border-2 border-[#8D8DC7] rounded-2xl flex items-center justify-between bg-indigo-50/10 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#8D8DC7] text-[#8D8DC7] font-bold flex items-center justify-center text-lg shrink-0">
                                            {newCategory.code || '?'}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                placeholder="Category Name"
                                                value={newCategory.name}
                                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                                className="w-full px-2 py-1 rounded bg-white/50 border border-transparent focus:bg-white focus:border-[#8D8DC7] outline-none text-sm font-bold"
                                                autoFocus
                                            />
                                            <input
                                                placeholder="Code (1 char)"
                                                maxLength={1}
                                                value={newCategory.code}
                                                onChange={e => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
                                                className="w-20 px-2 py-1 rounded bg-white/50 border border-transparent focus:bg-white focus:border-[#8D8DC7] outline-none text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-2">
                                        <button onClick={saveCategory} className="p-1.5 bg-[#8D8DC7] text-white rounded hover:bg-[#7b7bb5]"><Save className="w-3 h-3" /></button>
                                        <button onClick={() => setIsAddingCategory(false)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded"><X className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            )}

                            {config.categories?.map((cat) => (
                                <div key={cat.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5 transition-all bg-white group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-lg">
                                            {cat.code}
                                        </div>
                                        <h4 className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{cat.name}</h4>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem('categories', cat.id); }}
                                        className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'policies':
                return (
                    <div className="space-y-6">
                        {/* Student Policy */}
                        <div className="p-6 border border-slate-200 rounded-3xl bg-white space-y-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Student Borrowing Policy</h3>
                                    <p className="text-sm text-slate-500">Rules applied to general student accounts.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Borrow Duration</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 flex items-center gap-2">
                                            <input
                                                type="number"
                                                name="studentMaxHours"
                                                value={config.studentMaxHours}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />
                                            <span className="font-bold text-slate-400">Hours</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <input
                                                type="number"
                                                name="studentMaxMins"
                                                value={config.studentMaxMins}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />
                                            <span className="font-bold text-slate-400">Mins</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Max allowed: 5 Hours</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Per Checkout</label>
                                    <input
                                        type="number"
                                        name="studentMaxItems"
                                        value={config.studentMaxItems}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Staff Policy */}
                        <div className="p-6 border border-slate-200 rounded-3xl bg-white space-y-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Staff & Faculty Policy</h3>
                                    <p className="text-sm text-slate-500">Rules for teaching and admin staff.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borrow Duration</label>
                                    <div className="relative">
                                        <select
                                            name="staffDuration"
                                            value={config.staffDuration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 appearance-none font-medium text-slate-700"
                                        >
                                            <option value="24 Hours">24 Hours</option>
                                            <option value="48 Hours">48 Hours</option>
                                            <option value="1 Week">1 Week</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Required?</label>
                                    <div className="relative">
                                        <select
                                            name="staffApproval"
                                            value={config.staffApproval}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 appearance-none font-medium text-slate-700"
                                        >
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'responsibility':
                return (
                    <div className="space-y-8">
                        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                            <div className="mt-1 text-rose-600">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-800 text-lg">Score Impact Configuration</h3>
                                <p className="text-sm text-rose-600 mt-1">Adjust penalties for late returns or damaged items.</p>
                            </div>
                        </div>

                        <div className="space-y-8 px-2">
                            <div className="space-y-4">
                                <label className="flex justify-between items-center">
                                    <span className="font-bold text-slate-700 text-lg">Late Return Penalty</span>
                                    <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg text-sm">-{config.latePenalty} pts / hour late</span>
                                </label>
                                <input
                                    type="range"
                                    name="latePenalty"
                                    min="1"
                                    max="20"
                                    value={config.latePenalty}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex justify-between items-center">
                                    <span className="font-bold text-slate-700 text-lg">Damage Penalty (Minor)</span>
                                    <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg text-sm">-{config.damagePenalty} pts</span>
                                </label>
                                <input
                                    type="range"
                                    name="damagePenalty"
                                    min="5"
                                    max="50"
                                    value={config.damagePenalty}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'alerts':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">System Alerts</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'alertOverdue', title: 'Overdue Equipment Alert', desc: 'Notify admin when equipment is 24h overdue' },
                                { id: 'alertLowStock', title: 'Low Stock Warning', desc: 'Alert when inventory drops below 10%' },
                                { id: 'alertUnauthorized', title: 'Unauthorized Movement', desc: 'Trigger alarm if IoT tag leaves designated zone' },
                                { id: 'alertMaintenance', title: 'Maintenance Due', desc: 'Reminder for scheduled equipment checks' }
                            ].map((alert) => (
                                <div key={alert.id} className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-200 transition-colors bg-white shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">{alert.title}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{alert.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name={alert.id}
                                            checked={config[alert.id]}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#8D8DC7]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'email':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setEmailTab('receipt')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${emailTab === 'receipt' ? 'border-[#8D8DC7] bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <h4 className={`font-bold text-lg ${emailTab === 'receipt' ? 'text-[#8D8DC7]' : 'text-slate-700'}`}>Receipt Email</h4>
                                <p className="text-sm text-gray-500 mt-1">Sent after checkout</p>
                            </button>
                            <button
                                onClick={() => setEmailTab('overdue')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${emailTab === 'overdue' ? 'border-rose-400 bg-rose-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <h4 className={`font-bold text-lg ${emailTab === 'overdue' ? 'text-rose-500' : 'text-slate-700'}`}>Overdue Notice</h4>
                                <p className="text-sm text-gray-400 mt-1">Sent when late</p>
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editing: {emailTab === 'receipt' ? 'Checkout Receipt' : 'Overdue Warning'}</h4>
                                <div className="text-xs font-medium text-slate-400">Supported variables: {'{student_name}'}, {'{item_count}'}, {'{date}'}</div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Subject Line</label>
                                    <input
                                        name={emailTab === 'receipt' ? "emailReceiptSubject" : "emailOverdueSubject"}
                                        value={emailTab === 'receipt' ? (config.emailReceiptSubject || '') : (config.emailOverdueSubject || '')}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">HTML Content</label>
                                    <textarea
                                        name={emailTab === 'receipt' ? "emailReceiptContent" : "emailOverdueContent"}
                                        value={emailTab === 'receipt' ? (config.emailReceiptContent || '') : (config.emailOverdueContent || '')}
                                        onChange={handleChange}
                                        rows="8"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono text-sm text-slate-600 resize-none bg-white leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200" onClick={() => insertVariable('{student_name}')}>+ Name</button>
                                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200" onClick={() => insertVariable('{return_date}')}>+ Date</button>
                            </div>
                            <button className="text-[#8D8DC7] font-semibold text-sm hover:underline">Send Test {emailTab === 'receipt' ? 'Receipt' : 'Warning'}</button>
                        </div>
                    </div>
                );
            case 'qrcode':
                return (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-48 h-48 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50">
                                <QrCode className="w-20 h-20 text-slate-800" />
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                                <h3 className="font-bold text-slate-800 text-lg">QR Label Settings</h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label Size</label>
                                    <div className="relative">
                                        <select
                                            name="qrLabelSize"
                                            value={config.qrLabelSize || 'Small (2x2 cm)'}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10 appearance-none font-medium text-slate-700"
                                        >
                                            <option>Small (2x2 cm)</option>
                                            <option>Medium (4x4 cm)</option>
                                            <option>Large (6x6 cm)</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${config.qrIncludeLogo ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                        {config.qrIncludeLogo && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <input type="checkbox" name="qrIncludeLogo" checked={!!config.qrIncludeLogo} onChange={handleChange} className="hidden" />
                                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Include University Logo</span>
                                </label>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                            Print Sample Label
                        </button>
                    </div>
                );
            case 'branding':
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Logo</label>
                                <div className="h-48 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform"></div>
                                    <span className="text-slate-500 font-medium text-sm">Tap to upload replacement</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    {['#8D8DC7', '#80A4FF', '#74D4B5'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleChange({ target: { name: 'primaryColor', value: color } })}
                                            className={`w-12 h-12 rounded-full transition-transform hover:scale-110 focus:outline-none ring-4 ${config.primaryColor === color ? 'ring-purple-100' : 'ring-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors">
                                        <div className="text-xl">+</div>
                                    </button>
                                </div>
                                <input
                                    name="primaryColor"
                                    value={config.primaryColor || '#8D8DC7'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-medium text-slate-700 font-mono"
                                />
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