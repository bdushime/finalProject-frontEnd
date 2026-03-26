import MainLayout from "./layout/MainLayout";
import UserProfileSettings from "@/components/common/UserProfileSettings";
import { useTranslation } from "react-i18next";

export default function SecurityProfile() {
    const { t } = useTranslation(["security", "common"]);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4 relative z-10 w-full text-slate-800">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-slate-100 tracking-tight">{t('profile.title', 'My Profile')}</h1>
                <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">{t('profile.personal.desc', 'Manage your security account details')}</p>
            </div>
        </div>
    );

    return (
        <MainLayout heroContent={HeroSection}>
            <div className="max-w-6xl mx-auto mt-4 px-2">
                <UserProfileSettings />
            </div>
        </MainLayout>
    );
}
