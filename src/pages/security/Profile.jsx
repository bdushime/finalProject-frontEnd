import MainLayout from "./layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useTranslation } from "react-i18next";

export default function SecurityProfile() {
    const { t } = useTranslation(["security", "common"]);
    const HeroSection = (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{t('profile.title')}</h1>
                    <p className="text-gray-400 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
                        {t('profile.personal.desc')}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <MainLayout heroContent={HeroSection}>
            <div className="max-w-6xl mx-auto space-y-8 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Account Profile Card */}
                    <Card className="border border-slate-100 shadow-sm bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-2 pt-8">
                            <div className="flex flex-col items-center">
                                <div className="relative group p-1 bg-slate-50 rounded-full border-2 border-dashed border-slate-200 hover:border-[#8D8DC7] transition-colors cursor-pointer mb-4">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                        <AvatarFallback className="bg-slate-900 text-[#8D8DC7] text-3xl font-black">SO</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                        <span className="text-white text-xs font-bold uppercase tracking-widest">{t('profile.account.uploadAvatar')}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Security Officer</h3>
                                <p className="text-sm font-medium text-[#8D8DC7] uppercase tracking-widest mt-1">Official ID: #SO-2024</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-8 pt-4">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.account.title')}</span>
                                    <Badge className="bg-green-100 text-green-700 border-none font-bold uppercase text-[10px] tracking-widest">Active</Badge>
                                </div>
                                <p className="text-xs text-center text-slate-400 font-medium px-4">
                                    {t('profile.account.desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details Card */}
                    <Card className="lg:col-span-2 border border-slate-100 shadow-sm bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-slate-900">{t('profile.personal.title')}</CardTitle>
                                </div>
                                <Badge variant="outline" className="rounded-full px-4 py-1 text-[#8D8DC7] border-[#8D8DC7]/20 bg-[#8D8DC7]/5 font-bold">
                                    Last updated: Today
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <Label htmlFor="first" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.personal.firstName')}</Label>
                                    <Input
                                        id="first"
                                        placeholder="John"
                                        className="h-14 border-slate-100 rounded-2xl focus:border-[#8D8DC7] focus:ring-[#8D8DC7]/10 bg-slate-50/50 text-slate-900 font-medium px-5"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="last" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.personal.lastName')}</Label>
                                    <Input
                                        id="last"
                                        placeholder="Doe"
                                        className="h-14 border-slate-100 rounded-2xl focus:border-[#8D8DC7] focus:ring-[#8D8DC7]/10 bg-slate-50/50 text-slate-900 font-medium px-5"
                                    />
                                </div>
                                <div className="space-y-2.5 sm:col-span-2">
                                    <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.personal.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="officer@security.com"
                                        className="h-14 border-slate-100 rounded-2xl focus:border-[#8D8DC7] focus:ring-[#8D8DC7]/10 bg-slate-50/50 text-slate-900 font-medium px-5"
                                    />
                                </div>
                            </div>
                            <div className="mt-12 flex items-center justify-end gap-4">
                                <Button
                                    variant="ghost"
                                    className="text-slate-500 font-bold hover:bg-slate-50 px-8 h-14 rounded-2xl transition-all"
                                >
                                    {t('common:actions.cancel')}
                                </Button>
                                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-14 rounded-2xl shadow-xl shadow-slate-900/10 transition-transform active:scale-95 font-bold">
                                    {t('profile.personal.saveChanges')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
