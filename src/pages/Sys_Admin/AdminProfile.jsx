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
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 text-center relative overflow-hidden h-full">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-900 to-[#8D8DC7] opacity-90"></div>

                        <div className="relative mb-4">
                            <div className="w-24 h-24 mx-auto rounded-full bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                                {formData.displayName.charAt(0)}
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{formData.displayName}</h2>
                        <span className="inline-block mt-3 px-4 py-1.5 bg-[#8D8DC7]/10 text-[#8D8DC7] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#8D8DC7]/20">
                            {formData.role}
                        </span>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4 text-sm text-slate-500 font-medium">
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
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <User className="w-6 h-6 text-[#8D8DC7]" />
                            </div>
                            {t('profile.personalInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.fullName')}</label>
                                <input
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/5 font-bold text-slate-800 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.phone')}</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/5 font-bold text-slate-800 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 bg-gray-100/50 text-slate-500 cursor-not-allowed font-bold"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] bg-rose-50 text-rose-500 font-black uppercase tracking-widest px-2 py-1 rounded-md border border-rose-100">{t('profile.locked')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Key className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                {t('profile.security')}
                            </h3>
                            <button className="px-5 py-2.5 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 text-sm font-black uppercase tracking-widest transition-all active:scale-95">
                                {t('profile.changePassword')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSave} className="px-10 py-5 bg-[#8D8DC7] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#7b7bb5] hover:shadow-xl hover:shadow-[#8D8DC7]/30 transition-all flex items-center gap-3 active:scale-95">
                            <Save className="w-6 h-6" />
                            {t('profile.save')}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
