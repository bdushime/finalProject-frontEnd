import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer } from "@/components/common/Page";
import api from "@/utils/api";
import { getPackageId, getPackageDevices, getDeviceId, getDeviceName } from "./data/packageUtils";

export default function PackageDetails() {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await api.get(`/packages/${packageId}`);
                const data = res.data?.data || res.data;
                setPkg(data);
                // Pre-select all devices by their ID (real API) or name (legacy)
                const devices = getPackageDevices(data);
                setSelectedItems(devices.map(getDeviceId));
            } catch (err) {
                console.error("Failed to load package:", err);
                setError(err.response?.status === 404
                    ? "This package is not available."
                    : "Failed to load package details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [packageId]);

    const devices = getPackageDevices(pkg);

    const toggleItem = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleRequest = () => {
        // Pass selected device IDs as the items param so BorrowRequestForm can use them
        const itemsParam = encodeURIComponent(selectedItems.join(","));
        navigate(`/student/borrow-request?packageId=${getPackageId(pkg)}&items=${itemsParam}`);
    };

    if (loading) {
        return (
            <StudentLayout>
                <PageContainer>
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#0b1d3a] gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-[#126dd5]" />
                        <p className="font-medium animate-pulse">Loading package details...</p>
                    </div>
                </PageContainer>
            </StudentLayout>
        );
    }

    if (error || !pkg) {
        return (
            <StudentLayout>
                <PageContainer>
                    <div className="max-w-md mx-auto mt-20 text-center">
                        <div className="p-4 rounded-full bg-slate-50 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0b1d3a] mb-2">{error || "Package not found"}</h3>
                        <Button onClick={() => navigate('/student/browse')} className="bg-[#0b1d3a] mt-4 hover:bg-[#1a3b6e]">
                            Back to Catalogue
                        </Button>
                    </div>
                </PageContainer>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <PageContainer>
                <button
                    onClick={() => navigate('/student/browse')}
                    className="flex items-center text-slate-500 hover:text-[#0b1d3a] transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalogue
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="h-2 bg-[#126dd5] w-full" />
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide bg-[#126dd5]/5 text-[#126dd5] border-[#126dd5]/10">
                                        Package
                                    </div>
                                </div>
                                <CardTitle className="text-3xl md:text-4xl font-bold text-[#0b1d3a] mb-2">
                                    {pkg.name}
                                </CardTitle>
                                <CardDescription className="text-base text-slate-500">
                                    {pkg.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-[#0b1d3a] mb-4 flex items-center gap-2">
                                        Included Items
                                        <span className="text-xs font-normal text-slate-400 ml-2">
                                            (Uncheck items you don&apos;t need)
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {devices.map((device) => {
                                            const id = getDeviceId(device);
                                            const name = getDeviceName(device);
                                            const isSelected = selectedItems.includes(id);
                                            return (
                                                <div
                                                    key={id}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                                        ? 'bg-[#126dd5]/5 border-[#126dd5]/30 shadow-sm'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    onClick={() => toggleItem(id)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleItem(id)}
                                                        className="mt-1 data-[state=checked]:bg-[#126dd5] data-[state=checked]:border-[#126dd5]"
                                                    />
                                                    <div>
                                                        <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-[#0b1d3a]' : 'text-slate-600'}`}>
                                                            {name}
                                                        </span>
                                                        {typeof device === 'object' && device.serialNumber && (
                                                            <p className="text-xs text-slate-400 mt-0.5">{device.serialNumber}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {devices.length === 0 && (
                                            <p className="text-sm text-slate-400 italic py-2">No devices assigned to this package yet.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50 sticky top-6">
                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                <CardTitle className="font-bold text-[#0b1d3a] text-lg">Request Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Selected Items:</span>
                                        <span className="font-bold text-[#0b1d3a]">{selectedItems.length}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#126dd5] transition-all duration-300"
                                            style={{ width: `${devices.length > 0 ? (selectedItems.length / devices.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-[#0b1d3a] hover:bg-[#1a3b6e] text-white font-bold h-12 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleRequest}
                                    disabled={selectedItems.length === 0}
                                >
                                    {selectedItems.length === 0 ? "Select Items" : "Request Selected"}
                                </Button>

                                <p className="text-[10px] text-center text-slate-400">
                                    Only selected items will be added to your request.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}
