import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Scan, CheckCircle, Package, QrCode, AlertTriangle } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";
import QRScanner from "@/components/common/QRScanner";
import Loader from "@/components/common/Loader";
import EquipmentScanAndPhotoUpload from "@/components/EquipmentScanAndPhotoUpload";

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ReturnEquipment() {
    const query = useQuery();
    const navigate = useNavigate();
    const initialEquipmentId = query.get("itemId");

    // State
    const [step, setStep] = useState(1);
    const [activeItems, setActiveItems] = useState([]);
    const [selectedId, setSelectedId] = useState(""); // This is the EQUIPMENT ID
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [photoError, setPhotoError] = useState("");

    // Camera State
    const [isScanning, setIsScanning] = useState(false);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });

    // Compression utility
    const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                } else {
                    if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    };

    // --- 1. FETCH ACTIVE BORROWS ---
    useEffect(() => {
        const fetchActiveBorrows = async () => {
            try {
                const res = await api.get('/transactions/my-borrowed');
                setActiveItems(res.data);

                // If URL has ID, select it automatically
                if (initialEquipmentId) {
                    const exists = res.data.find(t => t.equipment._id === initialEquipmentId);
                    if (exists) setSelectedId(initialEquipmentId);
                } else if (res.data.length > 0) {
                    // Default to first item
                    setSelectedId(res.data[0].equipment._id);
                }
            } catch (err) {
                console.error("Failed to load active borrows:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveBorrows();
    }, [initialEquipmentId]);

    const handleScanSuccess = (decodedText) => {
        setIsScanning(false);
        const match = activeItems.find(t => t.equipment._id === decodedText || t.equipment.serialNumber === decodedText);

        if (match) {
            setSelectedId(match.equipment._id);
            toast.success("Item matched: " + match.equipment.name);
            setStep(3); // skip to confirm
        } else {
            toast.error("This item is not in your active borrows list.");
        }
    };

    const handlePhotoUpload = (view, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConditionPhotos(prev => ({ ...prev, [view]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = async () => {
        if (step === 1 && selectedId) {
            setStep(2);
        } else if (step === 2) {
            if (isProjector) {
                if (!conditionPhotos.front || !conditionPhotos.back) {
                    setPhotoError("Both front and back photos are required for returning a projector.");
                    return;
                }
            }
            setPhotoError("");
            setIsScanning(false);
            setStep(3);
        } else if (step === 3) {
            // --- SUBMIT RETURN ---
            setSubmitting(true);
            try {
                const compressedPhotos = {};
                if (conditionPhotos.front) compressedPhotos.front = await compressImage(conditionPhotos.front);
                if (conditionPhotos.back) compressedPhotos.back = await compressImage(conditionPhotos.back);

                const payload = {
                    conditionPhotos: compressedPhotos,
                    condition: "Good"
                };

                await api.put(`/transactions/${selectedTransaction._id}/request-return`, payload);
                setShowSuccess(true);
            } catch (err) {
                console.error("Return failed:", err);
                toast.error(err.response?.data?.message || "Return failed. Try again.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Find the full transaction object for the selected ID
    const selectedTransaction = activeItems.find(t => t.equipment._id === selectedId);

    const isProjector = useMemo(() => {
        if (!selectedTransaction) return false;
        const name = selectedTransaction.equipment?.name || "";
        const categoryName = selectedTransaction.equipment?.category?.name || selectedTransaction.equipment?.category || "";
        return name.toLowerCase().includes("projector") || categoryName.toLowerCase().includes("projector");
    }, [selectedTransaction]);

    if (loading) {
        return (
            <StudentLayout>
                <PageContainer>
                    <BackButton to="/student/borrowed-items" className="mb-4" />
                    <div className="flex items-center gap-2 text-slate-400 py-8">
                        <Loader variant="inline" />
                    </div>
                </PageContainer>
            </StudentLayout>
        );
    }

    const steps = [
        { label: "Select Item", icon: Package },
        { label: "Verify", icon: Scan },
        { label: "Confirm", icon: CheckCircle },
    ];

    return (
        <StudentLayout>
            <PageContainer>
                {/* Header — aligned with My Borrowed Items / Equipment Catalogue */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        {step > 1 ? (
                            <BackButton onClick={() => setStep((s) => s - 1)} className="mb-4" />
                        ) : (
                            <BackButton to="/student/borrowed-items" className="mb-4" />
                        )}
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">Return Equipment</h1>
                        <p className="text-slate-500 mt-1">Select an item and complete verification to return it.</p>
                    </div>
                    <p className="text-sm text-slate-500 md:pt-12 shrink-0">Step {step} of 3</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 relative h-1 bg-slate-100 rounded-full">
                    <div className="absolute h-full bg-[#126dd5] transition-all" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#0b1d3a]">{steps[step - 1].label}</h2>

                    {/* STEP 1: SELECT */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {activeItems.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-xl">No active items to return.</div>
                            ) : (
                                activeItems.map(t => (
                                    <label key={t._id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${selectedId === t.equipment._id ? 'border-[#126dd5] bg-blue-50' : 'border-slate-100'}`}>
                                        <input
                                            type="radio"
                                            name="item"
                                            className="w-5 h-5 text-[#126dd5]"
                                            checked={selectedId === t.equipment._id}
                                            onChange={() => setSelectedId(t.equipment._id)}
                                        />
                                        <div>
                                            <h3 className="font-bold text-[#0b1d3a]">{t.equipment.name}</h3>
                                            <p className="text-xs text-slate-500">{t.equipment.serialNumber}</p>
                                        </div>
                                        <Badge className="ml-auto bg-blue-100 text-blue-700">Due: {new Date(t.expectedReturnTime).toLocaleDateString()}</Badge>
                                    </label>
                                ))
                            )}
                        </div>
                    )}

                    {/* STEP 2: VERIFY (Camera & QR) */}
                    {step === 2 && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4 bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex flex-col">
                                <div>
                                    <Label className="text-sm font-bold text-[#0b1d3a]">Scan QR Code (Optional)</Label>
                                    <p className="text-xs text-slate-500 mt-1 mb-3">Verification scan to instantly identify this item's details.</p>
                                </div>
                                <div className="mx-auto w-full max-w-[300px] aspect-square bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner mb-4 relative">
                                    {isScanning ? (
                                        <QRScanner onScanSuccess={handleScanSuccess} compact />
                                    ) : (
                                        <div className="text-center text-slate-500 animate-fade-in">
                                            <QrCode className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
                                            <p className="text-sm font-semibold">Camera Off</p>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={() => setIsScanning(!isScanning)} variant="outline" className="w-full max-w-[300px] mx-auto h-11 rounded-xl">
                                    {isScanning ? "Cancel Scanning" : "Start Scanning"}
                                </Button>
                            </div>

                            <div className="space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div>
                                    <Label className="text-sm font-bold text-[#0b1d3a]">
                                        {isProjector ? "Condition Photos (Required)" : "Condition Photos (Optional)"}
                                    </Label>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">
                                        {isProjector 
                                            ? "Please take front and back photos of the projector to submit your return." 
                                            : "Capture a photo of the item's current state to expedite check-in."}
                                    </p>
                                </div>
                                <EquipmentScanAndPhotoUpload
                                    hideScanner={true}
                                    requireBothPhotos={isProjector}
                                    onPhotosChange={setConditionPhotos}
                                    equipment={selectedTransaction?.equipment}
                                />
                                {photoError && (
                                    <p className="text-xs text-rose-500 font-bold mt-2 bg-rose-50 p-3 rounded-xl border border-rose-100">{photoError}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {step === 3 && selectedTransaction && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold mb-4 text-[#0b1d3a]">Confirm Return</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Package className="w-6 h-6 text-[#126dd5]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0b1d3a]">{selectedTransaction.equipment.name}</p>
                                    <p className="text-xs text-slate-500">{selectedTransaction.equipment.serialNumber}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p>I certify that this item is being returned in good condition.</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleNext}
                            disabled={submitting || (step === 1 && !selectedId)}
                            className={
                                step === 3
                                    ? "bg-white text-[#0b1d3a] border-2 border-[#0b1d3a] hover:bg-slate-50 h-12 px-8 rounded-xl font-semibold"
                                    : "bg-[#0b1d3a] text-white hover:bg-[#126dd5] h-12 px-8 rounded-xl"
                            }
                        >
                            {submitting ? <Loader variant="inline" /> : (step === 3 ? "Confirm Return" : "Next Step")}
                        </Button>
                    </div>
                </div>
            </PageContainer>

            {/* SUCCESS MODAL */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-[#0b1d3a]/60 backdrop-blur-md" onClick={() => navigate("/student/borrowed-items")} />
                    <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300 border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2 font-serif">Return Successful!</h3>
                        <p className="text-slate-500 mb-8 text-sm px-4">
                            Thank you for returning the equipment. IT Staff will verify the condition shortly.
                        </p>
                        <Button
                            onClick={() => navigate("/student/borrowed-items")}
                            className="w-full bg-[#0b1d3a] hover:bg-[#126dd5] h-12 rounded-2xl font-bold shadow-lg shadow-blue-900/10"
                        >
                            Back to Items
                        </Button>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
