import React from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationsWidget() {
    const { t } = useTranslation("student");

    return (
        <div className="bg-[#f0f9ff] rounded-[32px] p-6 h-full flex flex-col justify-between relative group hover:shadow-md transition-all shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-[#0b1d3a]">{t("notifications.title")}</h3>
                <div className="relative">
                    <Bell className="w-6 h-6 text-[#126dd5]/50" />
                </div>
            </div>

            <div className="mt-4 flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="text-sm">{t("dashboard.noNewNotifications")}</p>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-white/40 rounded-full blur-2xl -z-10"></div>
        </div>
    );
}
