import React from 'react';
import AdminLayout from './components/AdminLayout';
import UserProfileSettings from '@/components/common/UserProfileSettings';
import { useTranslation } from "react-i18next";

const AdminProfile = () => {
    const { t } = useTranslation(["admin", "common"]);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full text-slate-800">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">{t('profile.title', 'My Profile')}</h1>
                <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">{t('profile.subtitle', 'Manage your administrator account settings and preferences')}</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="mt-8 px-1">
                <UserProfileSettings />
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
