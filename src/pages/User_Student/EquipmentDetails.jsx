import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, QrCode, Loader2, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/common/Page";
import api from "@/utils/api"; 

export default function EquipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State for Real Data
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fetch Specific Item
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Call the new endpoint we created
                const res = await api.get(`/equipment/${id}`);
                setEquipment(res.data);
            } catch (err) {
                console.error("Error fetching details:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    // --- LOADING STATE ---
    if (loading) {
        return (
            <StudentLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#126dd5]" />
                    <p>Loading equipment details...</p>
                </div>
            </StudentLayout>
        );
    }

    // --- ERROR STATE ---
    if (error || !equipment) {
        return (
            <StudentLayout>
                <PageContainer>
                    <div className="max-w-md mx-auto mt-20 text-center">
                        <div className="p-4 rounded-full bg-slate-50 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0b1d3a] mb-2">Equipment not found</h3>
                        <p className="text-slate-500 mb-8">The item you are looking for does not exist or has been removed.</p>
                        <Button onClick={() => navigate('/student/browse')} className="bg-[#0b1d3a]">
                            Back to Catalogue
                        </Button>
                    </div>
                </PageContainer>
            </StudentLayout>
        );
    }

    // --- REAL UI ---
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
                            <div className="h-2 bg-[#0b1d3a] w-full" /> {/* Decorative Top Bar */}
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Dynamic Status Badge */}
                                            <Badge className={`uppercase tracking-wide ${
                                                equipment.status === 'Available' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                                                equipment.status === 'Checked Out' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' :
                                                'bg-slate-100 text-slate-500 hover:bg-slate-100'
                                            }`}>
                                                {equipment.status}
                                            </Badge>
                                            {/* Category Badge */}
                                            <span className="text-xs font-bold text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded-md">
                                                {equipment.category || "General"}
                                            </span>
                                        </div>
                                        <CardTitle className="text-3xl md:text-4xl font-bold text-[#0b1d3a] mb-2">
                                            {equipment.name}
                                        </CardTitle>
                                        <CardDescription className="text-base text-slate-500 font-mono">
                                            Serial Number: {equipment.serialNumber || "N/A"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-[#0b1d3a] mb-3 flex items-center gap-2">
                                        Description
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        {equipment.description || "No specific description provided for this item."}
                                    </p>
                                </div>

                                {/* Specifications Grid (If exists in DB) */}
                                {equipment.specs && Object.keys(equipment.specs).length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-[#0b1d3a] mb-3">Technical Specifications</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(equipment.specs).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                                                    <span className="text-xs text-slate-400 font-bold uppercase">{key}</span>
                                                    <span className="font-medium text-[#0b1d3a]">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: ACTION PANEL */}
                    <div className="space-y-6">
                        <Card className="border border-slate-200 shadow-lg shadow-slate-200/50 sticky top-6">
                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                <CardTitle className="font-bold text-[#0b1d3a] text-lg">Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Location */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#126dd5]">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-bold">Location</div>
                                        <div className="font-medium text-[#0b1d3a]">{equipment.location || "IT Department"}</div>
                                    </div>
                                </div>

                                {/* Condition */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase font-bold">Condition</div>
                                        <div className="font-medium text-[#0b1d3a] capitalize">{equipment.condition || "Good"}</div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-3">
                                    {/* REQUEST BUTTON - GOES TO FORM */}
                                    <Button 
                                        className="w-full bg-[#0b1d3a] hover:bg-[#1a3b6e] text-white font-bold h-12 rounded-xl shadow-md transition-all active:scale-95"
                                        disabled={equipment.status !== 'Available'}
                                        onClick={() => navigate(`/student/borrow-request?equipmentId=${equipment._id}`)}
                                    >
                                        {equipment.status === 'Available' ? 'Proceed to Request' : 'Item Unavailable'}
                                    </Button>

                                    {/* QR Code Button (Future Feature) */}
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                        disabled={true} 
                                    >
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Scan QR Code
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400">QR Scanning coming in v2.0</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}