import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import { User, Mail, Shield, Smartphone, Key, Save } from 'lucide-react';
// import { toast } from 'sonner'; // Uncomment if sonner is available

import { useTranslation } from "react-i18next";

const AdminProfile = () => {
    const { t } = useTranslation(["admin", "common"]);
    // Mock Admin Data - In real app, fetch from localStorage or API
    const [formData, setFormData] = useState({
        displayName: 'System Administrator',
        email: 'admin@tracknity.com',
        phone: '+250 788 000 000',
        role: 'Super Admin',
        department: 'IT Department'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Mock save
        // toast.success("Profile updated successfully");
        console.log("Saving profile:", formData);
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('profile.title')}</h1>
                <p className="text-gray-400">{t('profile.subtitle')}</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-800 to-[#8D8DC7]/80"></div>

                        <div className="relative mb-4">
                            <div className="w-24 h-24 mx-auto rounded-full bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                                {formData.displayName.charAt(0)}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">{formData.displayName}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-[#8D8DC7]/10 text-[#8D8DC7] text-xs font-bold uppercase tracking-wider rounded-full border border-[#8D8DC7]/20">
                            {formData.role}
                        </span>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-sm text-slate-500">
                            <div className="flex items-center gap-3 justify-center">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span>{formData.department}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#8D8DC7]" />
                            {t('profile.personalInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.fullName')}</label>
                                <input
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/10 font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.phone')}</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/10 font-medium text-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-rose-500 font-bold">{t('profile.locked')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-[#8D8DC7]" />
                                {t('profile.security')}
                            </h3>
                            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-bold transition-colors">
                                {t('profile.changePassword')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSave} className="px-6 py-3 bg-[#8D8DC7] text-white rounded-xl font-bold hover:bg-[#7b7bb5] hover:shadow-lg hover:shadow-[#8D8DC7]/20 transition-all flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            {t('profile.save')}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
