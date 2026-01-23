import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer } from "@/components/common/Page";
import { mockPackages } from "./data/mockPackages";

export default function PackageDetails() {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const pkg = mockPackages.find(p => p.id === packageId);

    // Default to all items selected
    const [selectedItems, setSelectedItems] = useState(pkg ? pkg.items : []);

    const toggleItem = (item) => {
        setSelectedItems(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    if (!pkg) {
        return (
            <StudentLayout>
                <PageContainer>
                    <div className="max-w-md mx-auto mt-20 text-center">
                        <div className="p-4 rounded-full bg-slate-50 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0b1d3a] mb-2">Package not found</h3>
                        <Button onClick={() => navigate('/student/browse')} className="bg-[#0b1d3a]">
                            Back to Catalogue
                        </Button>
                    </div>
                </PageContainer>
            </StudentLayout>
        );
    }

    const handleRequest = () => {
        // Construct URL with selected items
        // Since we are mocking, we'll just pass them as a query param list
        const itemsParam = encodeURIComponent(selectedItems.join(','));
        navigate(`/student/borrow-request?packageId=${pkg.id}&items=${itemsParam}`);
    };

    return (
        <StudentLayout>
            <PageContainer>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/student/browse')}
                    className="flex items-center text-slate-500 hover:text-[#0b1d3a] transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalogue
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: MAIN DETAILS */}
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
                                            (Uncheck items you don't need)
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {pkg.items.map((item, idx) => {
                                            const isSelected = selectedItems.includes(item);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                                            ? 'bg-[#126dd5]/5 border-[#126dd5]/30 shadow-sm'
                                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    onClick={() => toggleItem(item)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleItem(item)}
                                                        className="mt-1 data-[state=checked]:bg-[#126dd5] data-[state=checked]:border-[#126dd5]"
                                                    />
                                                    <div>
                                                        <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-[#0b1d3a]' : 'text-slate-600'}`}>
                                                            {item}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: ACTION PANEL */}
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
                                            style={{ width: `${(selectedItems.length / pkg.items.length) * 100}%` }}
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
