import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Smartphone, Key, Save, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";
import api from '@/utils/api';

export default function UserProfileSettings() {
    const { t } = useTranslation(["common", "admin", "itstaff"]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        fullName: '',
        username: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        school: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get('/users/profile');
                const data = res.data;
                setFormData({
                    id: data._id,
                    fullName: data.fullName || data.username || 'User',
                    username: data.username || '',
                    email: data.email || '',
                    phone: data.phoneNumber || data.phone || '',
                    role: data.role || 'User',
                    department: data.department || '',
                    school: data.school || ''
                });
            } catch (err) {
                console.error('Failed to load profile', err);
                toast.error(t('common:actions.error', 'An error occurred while loading profile.'));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [t]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                // Do not update email or role from profile directly
            };
            await api.put(`/users/${formData.id}`, payload);
            toast.success(t('common:actions.saved', 'Profile updated successfully'));

            // Also update local storage so name reflects elsewhere
            const cachedUser = JSON.parse(localStorage.getItem('user'));
            if (cachedUser) {
                cachedUser.fullName = formData.fullName;
                cachedUser.username = formData.username; // fallback
                localStorage.setItem('user', JSON.stringify(cachedUser));
            }
        } catch (err) {
            console.error('Save failed', err);
            toast.error(t('common:actions.error', 'Update Failed'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0b1d3a]" />
                <p className="font-medium animate-pulse">{t('common:misc.loading', 'Loading Profile...')}</p>
            </div>
        );
    }

    const initials = formData.fullName?.substring(0, 2).toUpperCase() || "US";
    const roleColors = {
        'Student': 'bg-gray-100 text-gray-800 border-gray-200',
        'IT_Staff': 'bg-blue-100 text-[#0b1d3a] border-blue-200',
        'Security': 'bg-red-100 text-red-800 border-red-200',
        'Admin': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    const activeRoleColor = roleColors[formData.role] || 'bg-slate-100 text-slate-700 border-slate-200';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 py-4">
            {/* Profile Card Summary */}
            <div className="xl:col-span-1">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden h-full flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#0b1d3a] to-blue-900 opacity-90 transition-all duration-500 hover:h-36"></div>

                    <div className="relative mt-8 mb-4">
                        <div className="w-28 h-28 mx-auto rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-[#0b1d3a] text-4xl font-black bg-gradient-to-tr from-slate-200 to-white">
                            {initials}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{formData.fullName}</h2>
                    <span className={`inline-block mt-3 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${activeRoleColor}`}>
                        {formData.role}
                    </span>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 text-sm text-slate-500 font-medium w-full px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="truncate flex-1 text-left">{formData.email}</span>
                        </div>
                        {formData.department && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="truncate flex-1 text-left">{formData.department}</span>
                            </div>
                        )}
                        {formData.school && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="truncate flex-1 text-left">{formData.school}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="xl:col-span-2">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-full flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 bg-blue-50 rounded-xl shadow-inner outline outline-1 outline-blue-100 z-10">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            {t('admin:profile.personalInfo', 'Personal Information')}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin:profile.fullName', 'Full Name')}</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all hover:bg-slate-50"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin:profile.phone', 'Phone Number')}</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all hover:bg-slate-50"
                                        placeholder="e.g. +250 788 123 456"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin:profile.email', 'Email Address')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed font-bold"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-amber-50 text-amber-600 font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-amber-100">{t('admin:profile.locked', 'Locked')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional fields / Security divider */}
                        <div className="pt-8 border-t border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                                <div className="p-2.5 bg-slate-100 rounded-xl shadow-inner outline outline-1 outline-slate-200 z-10">
                                    <Key className="w-5 h-5 text-slate-600" />
                                </div>
                                {t('admin:profile.security', 'Security & Access')}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px] text-sm text-slate-500 font-medium">
                                    Your password needs to be at least 8 characters long and include numbers and letters.
                                </div>
                                <button className="px-5 py-3 font-semibold uppercase tracking-wider text-xs bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 whitespace-nowrap">
                                    {t('admin:profile.changePassword', 'Change Password')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {t('admin:profile.save', 'Save Changes')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
