import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { Shield, Lock, CheckCircle, History, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { useTranslation } from "react-i18next";

export default function Score() {
    const [score, setScore] = useState(100);
    const [stats, setStats] = useState({ total: 0, onTimePercent: 100 });
    const [loading, setLoading] = useState(true);
    const [isRequestingUnblock, setIsRequestingUnblock] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const { t } = useTranslation("student");

    const isBlocked = score <= 50;

    // --- FETCH REAL DATA ---
    useEffect(() => {
        const fetchScoreData = async () => {
            try {
                // 1. Get User Profile (for Score)
                const userRes = await api.get('/users/profile');
                setScore(userRes.data.responsibilityScore || 100);

                // 2. Get History (to calc stats)
                const historyRes = await api.get('/transactions/my-history');
                const history = historyRes.data;

                // Calculate simple stats
                const totalCheckouts = history.length;
                const onTimeReturns = history.filter(t => t.status === 'Returned').length;

                const percent = totalCheckouts > 0
                    ? Math.round((onTimeReturns / totalCheckouts) * 100)
                    : 100;

                setStats({ total: totalCheckouts, onTimePercent: percent });

            } catch (err) {
                console.error("Error fetching score:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScoreData();
    }, []);

    const handleRequestUnblock = () => {
        setIsRequestingUnblock(true);
        setTimeout(() => {
            setIsRequestingUnblock(false);
            setRequestSent(true);
        }, 1500);
    };

    const getScoreColor = (s) => {
        if (s >= 80) return "text-emerald-500";
        if (s >= 50) return "text-amber-500";
        return "text-rose-500";
    };

    const getScoreLabel = (s) => {
        if (s >= 80) return t("score.excellent");
        if (s >= 50) return t("score.fair");
        return t("score.poor");
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" /> {t("score.loading")}
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <PageContainer>
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title={t("score.title")}
                    subtitle={t("score.subtitle")}
                    showBack={false}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Score Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className={`border-2 overflow-hidden ${isBlocked ? 'border-rose-100 bg-rose-50/30' : 'border-slate-200 bg-white'}`}>
                            <CardContent className="p-8 sm:p-12 text-center">
                                <div className="mb-8 relative inline-flex items-center justify-center">
                                    {/* Circular Background */}
                                    <svg className="w-64 h-64 transform -rotate-90">
                                        <circle
                                            cx="128" cy="128" r="120"
                                            stroke="currentColor" strokeWidth="12" fill="transparent"
                                            className="text-slate-100"
                                        />
                                        <circle
                                            cx="128" cy="128" r="120"
                                            stroke="currentColor" strokeWidth="12" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 120}
                                            strokeDashoffset={2 * Math.PI * 120 * (1 - score / 100)}
                                            className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.span
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`text-6xl font-bold ${getScoreColor(score)}`}
                                        >
                                            {score}
                                        </motion.span>
                                        <span className={`text-lg font-medium mt-2 ${getScoreColor(score)}`}>
                                            {getScoreLabel(score)}
                                        </span>
                                    </div>
                                </div>

                                <div className="max-w-md mx-auto">
                                    {isBlocked ? (
                                        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
                                            <div className="flex flex-col items-center gap-3 mb-4">
                                                <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
                                                    <Lock className="h-6 w-6 text-rose-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-rose-700">{t("score.accessRestricted")}</h3>
                                            </div>
                                            <p className="text-slate-600 mb-6">
                                                {t("score.blockedMessage")}
                                            </p>
                                            {requestSent ? (
                                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-800">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="font-semibold">{t("score.requestSentAdmin")}</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={handleRequestUnblock}
                                                    disabled={isRequestingUnblock}
                                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 shadow-lg shadow-rose-200"
                                                >
                                                    {isRequestingUnblock ? t("score.sendingRequest") : t("score.requestUnblock")}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-slate-500">
                                                {t("score.goodStanding")}
                                            </p>
                                            <div className="flex justify-center gap-4">
                                                <div className="text-center px-6 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="block text-2xl font-bold text-[#0b1d3a]">{stats.total}</span>
                                                    <span className="text-xs text-slate-400 uppercase font-bold">{t("score.checkouts")}</span>
                                                </div>
                                                <div className="text-center px-6 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="block text-2xl font-bold text-emerald-600">{stats.onTimePercent}%</span>
                                                    <span className="text-xs text-slate-400 uppercase font-bold">{t("score.onTime")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* How it Works Card */}
                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-[#126dd5]" />
                                    {t("score.howItWorks")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-slate-600">
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <p><span className="font-semibold text-[#0b1d3a]">{t("score.standardReturn")}:</span> +5 {t("score.points")}</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    <p><span className="font-semibold text-rose-600">{t("score.lateReturn")}:</span> -10 {t("score.points")}</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    <p><span className="font-semibold text-rose-600">{t("score.damageLoss")}:</span> {t("score.immediatePenalty")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* RESTORED: Need Details Card */}
                        <Card className="border border-slate-200 shadow-sm bg-blue-50/50">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-[#0b1d3a] mb-2 flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    {t("score.needDetails")}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    {t("score.viewHistoryDesc")}
                                </p>
                                <Link to="/student/report">
                                    <Button className="w-full bg-white border border-blue-200 text-[#126dd5] hover:bg-blue-50">
                                        {t("score.viewFullReport")}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}