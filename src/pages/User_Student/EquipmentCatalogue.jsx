import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from "./components/BackButton";
import { Package, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/common/Page";
import api from "@/utils/api";
import { mockPackages } from "./data/mockPackages";
import { useTranslation } from "react-i18next";

export default function EquipmentCatalogue() {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState("all");
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("single");
    const { t } = useTranslation("student");

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await api.get('/equipment');
                setEquipmentList(res.data);
            } catch (err) {
                console.error("Failed to load equipment:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    const filteredEquipment = equipmentList.filter((item) => {
        const status = item.status?.toLowerCase() || "";
        if (availability === "all") return true;
        if (availability === "available") return status === "available";
        if (availability === "reserved") return status === "reserved";
        if (availability === "checked-out") return status === "checked out" || status === "checked-out";
        return true;
    });

    const getStatusLabel = (status) => {
        if (status === "available") return t("equipment.available");
        if (status === "reserved") return t("equipment.reserved");
        return t("equipment.checkedOut");
    };

    return (
        <StudentLayout>
            <PageContainer>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <BackButton to="/student/dashboard" className="mb-4" />
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">{t("equipment.title")}</h1>
                        <p className="text-slate-500 mt-1">{t("equipment.subtitle")}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* TABS */}
                        <div className="p-1 bg-slate-100 rounded-xl flex items-center">
                            <button
                                onClick={() => setViewMode('single')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'single'
                                    ? 'bg-white text-[#0b1d3a] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {t("equipment.singleItems")}
                            </button>
                            <button
                                onClick={() => setViewMode('packages')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'packages'
                                    ? 'bg-white text-[#0b1d3a] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {t("equipment.packages")}
                            </button>
                        </div>

                        <Select value={availability} onValueChange={setAvailability}>
                            <SelectTrigger className="w-full md:w-[200px] h-11 rounded-xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-[#126dd5]/20 text-[#0b1d3a] font-medium">
                                <SelectValue placeholder={t("equipment.availability")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all">{t("equipment.allItems")}</SelectItem>
                                <SelectItem value="available">{t("equipment.availableNow")}</SelectItem>
                                <SelectItem value="reserved">{t("equipment.reserved")}</SelectItem>
                                <SelectItem value="checked-out">{t("equipment.checkedOut")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-[#126dd5]" />
                        <p>{t("equipment.loadingCatalog")}</p>
                    </div>
                ) : (
                    viewMode === 'single' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEquipment.map((item) => {
                                const status = item.status?.toLowerCase() || "";
                                return (
                                    <div
                                        key={item._id}
                                        className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#126dd5]/30 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#126dd5] transition-colors">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${status === "available"
                                                ? "bg-[#126dd5]/5 text-[#126dd5] border-[#126dd5]/10"
                                                : status === "reserved"
                                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                                    : "bg-rose-50 text-rose-600 border-rose-100"
                                                }`}>
                                                {getStatusLabel(status)}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-base font-bold text-[#0b1d3a] leading-tight mb-1">{item.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {item.serialNumber ? `SN: ${item.serialNumber}` : `ID: ${item._id.substring(0, 6)}...`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-3 mt-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'available' ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                                                {item.location || t("equipment.itDepartment")}
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    variant={status === "available" ? "default" : "outline"}
                                                    className={`w-full h-9 rounded-lg text-xs font-semibold shadow-none transition-all ${status === "available"
                                                        ? "bg-[#0b1d3a] hover:bg-[#2c3e50] text-white"
                                                        : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                                        }`}
                                                    onClick={() => status === "available" && navigate(`/student/equipment/${item._id}`)}
                                                    disabled={status !== "available"}
                                                >
                                                    {status === "available" ? t("equipment.viewDetails") : t("equipment.unavailable")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {mockPackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#126dd5]/30 hover:shadow-md transition-all duration-300 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#126dd5] transition-colors">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide bg-[#126dd5]/5 text-[#126dd5] border-[#126dd5]/10">
                                            {t("equipment.package")}
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <h3 className="text-base font-bold text-[#0b1d3a] leading-tight mb-1">{pkg.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{pkg.description}</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("equipment.includes")}</p>
                                            {pkg.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                                    <div className="w-1 h-1 rounded-full bg-[#126dd5]"></div>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto">
                                        <Button
                                            className="w-full h-9 rounded-lg text-xs font-semibold shadow-none transition-all bg-[#0b1d3a] hover:bg-[#2c3e50] text-white"
                                            onClick={() => navigate(`/student/package/${pkg.id}`)}
                                        >
                                            {t("equipment.viewPackage")}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Empty State */}
                {!loading && filteredEquipment.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Package className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0b1d3a]">{t("equipment.noEquipmentFound")}</h3>
                        <p className="text-slate-500 text-sm">{t("equipment.tryAdjustFilters")}</p>
                    </div>
                )}
            </PageContainer>
        </StudentLayout>
    );
}