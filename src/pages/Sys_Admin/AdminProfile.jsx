import React from 'react';
import AdminLayout from './components/AdminLayout';
import UserProfileSettings from '@/components/common/UserProfileSettings';
import { useTranslation } from "react-i18next";

const AdminProfile = () => {
    const { t } = useTranslation(["admin", "common"]);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full text-white">
            <div>
                <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">{t('profile.title', 'My Profile')}</h1>
                <p className="text-slate-300 max-w-2xl text-[15px] leading-relaxed opacity-90">{t('profile.subtitle', 'Manage your administrator account settings and preferences')}</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="mt-4 px-1">
                <UserProfileSettings />
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
