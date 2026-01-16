import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'System Administrator',
        email: 'admin@auca.ac.rw',
        phone: '+250 788 123 456',
        role: 'Super Admin',
        lastLogin: new Date().toLocaleString()
    });

    const handleSave = () => {
        setIsEditing(false);
        toast.success("Profile updated successfully");
    };

    const HeroSection = (
        <div className="flex justify-between items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-gray-400">Manage your administrative account details.</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="mx-auto space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-[#8D8DC7] flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-indigo-50">
                            {profile.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Shield className="w-3 h-3" /> {profile.role}
                            </span>
                        </div>
                        <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" /> {profile.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Last Login: {profile.lastLogin}</p>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>

                {/* Details Form */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Personal Information</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/10 font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={profile.email}
                                    disabled={true}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#8D8DC7] focus:ring-4 focus:ring-[#8D8DC7]/10 font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={profile.role}
                                    disabled={true}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-[#8D8DC7] text-white font-bold rounded-xl hover:bg-[#7878b6] shadow-lg shadow-indigo-200 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
