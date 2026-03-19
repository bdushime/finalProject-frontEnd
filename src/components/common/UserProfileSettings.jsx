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

    // Password change states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdData, setPwdData] = useState({ newPassword: '', confirmPassword: '' });
    const [pwdLoading, setPwdLoading] = useState(false);

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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwdData.newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }
        if (pwdData.newPassword !== pwdData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            setPwdLoading(true);
            await api.put(`/users/${formData.id}`, { password: pwdData.newPassword });
            toast.success("Password updated successfully");
            setShowPasswordModal(false);
            setPwdData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Password update failed', err);
            toast.error(t('common:actions.error', 'Update Failed'));
        } finally {
            setPwdLoading(false);
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 py-1">
            {/* Profile Card Summary */}
            <div className="xl:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center relative overflow-hidden h-full flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#0b1d3a] to-blue-900 opacity-90 transition-all duration-500 hover:h-36"></div>

                    <div className="relative mt-4 mb-2">
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-[#0b1d3a] text-2xl font-bold bg-gradient-to-tr from-slate-200 to-white">
                            {initials}
                        </div>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">{formData.fullName}</h2>
                    <span className={`inline-block mt-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${activeRoleColor}`}>
                        {formData.role}
                    </span>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-500 font-medium w-full px-2">
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
            <div className="xl:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2.5 tracking-tight">
                            <div className="p-1.5 bg-blue-50 rounded-lg shadow-inner outline outline-1 outline-blue-100 z-10 transition-transform group-hover:scale-110">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            {t('admin:profile.personalInfo', 'Personal Information')}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('admin:profile.fullName', 'Full Name')}</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-medium text-slate-800 text-sm transition-all hover:bg-slate-50"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('admin:profile.phone', 'Phone Number')}</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-medium text-slate-800 text-sm transition-all hover:bg-slate-50"
                                        placeholder="e.g. +250 788 123 456"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('admin:profile.email', 'Email Address')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed font-medium text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-amber-50 text-amber-600 font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-amber-100">{t('admin:profile.locked', 'Locked')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional fields / Security divider */}
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5 tracking-tight">
                                <div className="p-1.5 bg-slate-100 rounded-lg shadow-inner outline outline-1 outline-slate-200 z-10">
                                    <Key className="w-3.5 h-3.5 text-slate-600" />
                                </div>
                                {t('admin:profile.security', 'Security & Access')}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px] text-xs text-slate-500 font-medium">
                                    Your password needs to be at least 8 characters long and include numbers and letters.
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 py-2 font-semibold uppercase tracking-wider text-[10px] bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 whitespace-nowrap"
                                >
                                    {t('admin:profile.changePassword', 'Change Password')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('admin:profile.save', 'Save Changes')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Key className="w-5 h-5 text-slate-600" />
                            </div>
                            Update Password
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">Enter a new secure password for your account.</p>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={pwdData.newPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-medium text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={pwdData.confirmPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-medium text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={pwdLoading}
                                    className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
