import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Wifi, MapPin, Signal, Battery, RefreshCw, Layers } from 'lucide-react';

import { useTranslation } from "react-i18next";

const TrackingPage = () => {
    const { t } = useTranslation(["admin", "common"]);

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('tracking.title')}</h1>
                <p className="text-gray-400">{t('tracking.subtitle')}</p>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-700 mt-4 md:mt-0">
                <RefreshCw className="w-4 h-4" /> {t('tracking.refresh')}
            </button>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* 1. The Map Visual */}
                <div className="lg:col-span-2 bg-[#1e293b] rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-6 left-6 z-10 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-600">
                        <div className="flex items-center text-green-400 text-sm font-bold mb-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            {t('tracking.map.online')}
                        </div>
                        <p className="text-xs text-gray-400">{t('tracking.map.grid')}</p>
                    </div>

                    {/* MOCK MAP UI */}
                    <div className="w-full h-full relative opacity-80 mt-10 ml-6">
                        {/* Floor Plan Lines (CSS Art) */}
                        <div className="absolute top-10 left-10 w-3/4 h-1/2 border-2 border-slate-600 rounded-xl"></div>
                        <div className="absolute top-10 left-10 w-1/4 h-full border-r-2 border-slate-600"></div>
                        <div className="absolute bottom-1/4 right-10 w-1/2 h-1/2 border-2 border-slate-600 rounded-xl"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-slate-600 text-xs text-center">{t('tracking.map.wifiZone')}</span>
                        </div>

                        {/* SENSORS (Interactive Dots) */}
                        {/* Sensor 1 */}
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 group cursor-pointer">
                            <div className="relative">
                                <span className="w-4 h-4 bg-green-500 rounded-full block animate-ping absolute opacity-75"></span>
                                <span className="w-4 h-4 bg-green-500 rounded-full block relative border-2 border-white shadow-lg shadow-green-500/50"></span>
                            </div>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {t('tracking.map.projector')}
                            </div>
                        </div>

                        {/* Sensor 2 */}
                        <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                            <div className="relative">
                                <span className="w-4 h-4 bg-green-500 rounded-full block animate-ping absolute opacity-75 delay-300"></span>
                                <span className="w-4 h-4 bg-green-500 rounded-full block relative border-2 border-white shadow-lg shadow-green-500/50"></span>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {t('tracking.map.laptopCart')}
                            </div>
                        </div>

                        {/* Sensor 3 (Offline/Issues) */}
                        <div className="absolute top-1/3 left-16 group cursor-pointer">
                            <div className="relative">
                                <span className="w-4 h-4 bg-orange-500 rounded-full block relative border-2 border-white shadow-lg shadow-orange-500/50"></span>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {t('tracking.map.camera')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Panel Info */}
                <div className="flex flex-col gap-6">
                    {/* Signal Strength */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Wifi className="w-5 h-5 text-[#8D8DC7] mr-2" /> {t('tracking.signal.title')}
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Signal className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-bold text-slate-900">{t('tracking.signal.zoneA')}</p>
                                        <p className="text-xs text-gray-500">{t('tracking.signal.strengthA')}</p>
                                    </div>
                                </div>
                                <span className="text-green-700 font-bold text-sm">{t('tracking.signal.active')}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Signal className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-bold text-slate-900">{t('tracking.signal.zoneB')}</p>
                                        <p className="text-xs text-gray-500">{t('tracking.signal.strengthB')}</p>
                                    </div>
                                </div>
                                <span className="text-gray-500 font-bold text-sm">{t('tracking.signal.idle')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Tags Summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Layers className="w-5 h-5 text-slate-700 mr-2" /> {t('tracking.tags.title')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-100 rounded-2xl text-center">
                                <p className="text-3xl font-extrabold text-slate-900">124</p>
                                <p className="text-xs text-gray-400 mt-1">{t('tracking.tags.total')}</p>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl text-center bg-orange-50/50">
                                <p className="text-3xl font-extrabold text-orange-500">3</p>
                                <p className="text-xs text-orange-400 mt-1">{t('tracking.tags.lowBattery')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TrackingPage;
