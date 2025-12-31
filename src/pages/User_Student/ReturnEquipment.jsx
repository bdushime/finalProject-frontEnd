import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    Scan,
    Camera,
    CheckCircle,
    Package,
    Clock,
    QrCode,
    AlertTriangle
} from "lucide-react";
import { borrowedItems } from "./data/mockData";

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ReturnEquipment() {
    const query = useQuery();
    const navigate = useNavigate();
    const initialId = query.get("itemId");

    const activeItems = borrowedItems.filter((item) => item.status === "active" || item.status === "overdue");

    // State
    const [step, setStep] = useState(1);
    const [selectedId, setSelectedId] = useState(initialId || (activeItems[0]?.id ?? ""));
    const [isScanning, setIsScanning] = useState(false);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });
    const [scanError, setScanError] = useState("");

    const videoRef = useRef(null);
    const selectedItem = activeItems.find((item) => item.id === selectedId);

    // Camera cleanup
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleScanQR = async () => {
        setScanError("");
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setScanError("Camera access denied. Please allow camera permissions.");
            setIsScanning(false);
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

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
            if (step === 2) stopCamera(); // Cleanup when leaving scan step
        } else {
            navigate("/student/borrowed-items");
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedId) {
            setStep(2);
        } else if (step === 2) {
            // Optional: Validate that photos/scan are done? For now allow skipping for demo.
            stopCamera();
            setStep(3);
        } else if (step === 3) {
            // Submit
            alert(`Return processed successfully for ${selectedItem?.equipmentName}!`);
            navigate("/student/borrowed-items");
        }
    };

    const steps = [
        { label: "Select Item", icon: Package },
        { label: "Verify & Condition", icon: Scan },
        { label: "Confirm Return", icon: CheckCircle },
    ];

    const getDaysRemaining = (dueDate) => {
        if (!dueDate) return null;
        const diff = new Date(dueDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <StudentLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header / Nav */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-sm font-medium text-slate-500 hover:text-[#0b1d3a] transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {step === 1 ? "Back to My Items" : "Previous step"}
                        </button>
                        <div className="text-sm font-medium text-slate-500">
                            Step {step} of 3
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-[#126dd5] -translate-y-1/2 rounded-full transition-all duration-300"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        <div className="relative flex justify-between">
                            {steps.map((s, idx) => {
                                const isActive = step === idx + 1;
                                const isCompleted = step > idx + 1;
                                const Icon = s.icon;
                                return (
                                    <div key={s.label} className="flex flex-col items-center gap-2">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white ${isActive
                                                    ? "border-[#126dd5] text-[#126dd5] shadow-lg shadow-blue-500/20 scale-110"
                                                    : isCompleted
                                                        ? "border-[#126dd5] bg-[#126dd5] text-white"
                                                        : "border-slate-200 text-slate-300"
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                        </div>
                                        <span className={`text-xs font-semibold hidden sm:block transition-colors ${isActive || isCompleted ? "text-[#0b1d3a]" : "text-slate-400"
                                            }`}>
                                            {s.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[#0b1d3a] mb-2">{steps[step - 1].label}</h2>
                        <p className="text-slate-500">
                            {step === 1 && "Select the equipment you are returning."}
                            {step === 2 && "Scan the item's QR code and document its condition."}
                            {step === 3 && "Review summary and confirm return."}
                        </p>
                    </div>

                    {/* STEP 1: SELECT */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4">
                            {activeItems.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No active items to return.</p>
                                    <Button variant="link" onClick={() => navigate('/student/borrowed-items')}>
                                        Go back to dashboard
                                    </Button>
                                </div>
                            ) : (
                                activeItems.map((item) => (
                                    <label
                                        key={item.id}
                                        className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedId === item.id
                                                ? "border-[#126dd5] bg-blue-50/50"
                                                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="item"
                                            className="h-5 w-5 text-[#126dd5] border-slate-300 focus:ring-[#126dd5]"
                                            checked={selectedId === item.id}
                                            onChange={() => setSelectedId(item.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-[#0b1d3a]">{item.equipmentName}</h3>
                                                <Badge variant="outline" className={
                                                    item.status === 'overdue'
                                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                }>
                                                    {item.status === 'overdue' ? 'Overdue' : 'Active'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span>ID: {item.equipmentId}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}

                            {activeItems.length > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        onClick={handleNext}
                                        disabled={!selectedId}
                                        className="rounded-xl px-8 bg-[#0b1d3a] hover:bg-[#126dd5] text-white"
                                    >
                                        Next Step
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: VERIFY (Scan + Photos) */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Left: Scanner */}
                            <div className="space-y-6">
                                <Label className="text-lg font-bold text-[#0b1d3a]">1. Scan QR Code</Label>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex flex-col items-start space-y-4">
                                        <div className="w-full max-w-sm aspect-square bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                                            {isScanning ? (
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <QrCode className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="font-semibold text-[#0b1d3a]">Camera is off</p>
                                                    <p className="text-sm text-slate-500">Scan the equipment tag</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={isScanning ? () => { setIsScanning(false); stopCamera(); } : handleScanQR}
                                                className={`rounded-xl px-6 text-white ${isScanning ? "bg-rose-500 hover:bg-rose-600" : "bg-[#0b1d3a] hover:bg-[#126dd5]"}`}
                                            >
                                                {isScanning ? "Stop Camera" : "Start Scanning"}
                                            </Button>
                                            {isScanning && <span className="text-xs text-slate-400 animate-pulse">Scanning...</span>}
                                        </div>
                                        {scanError && <p className="text-sm text-red-600">{scanError}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Condition Photos */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <Label className="text-lg font-bold text-[#0b1d3a]">2. Condition Photos</Label>
                                    <p className="text-slate-500 text-sm">
                                        Take photos of the equipment to verify its condition.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Front */}
                                    <label className="relative h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 hover:bg-slate-50 hover:border-[#126dd5]/50 transition-all group cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => handlePhotoUpload('front', e)}
                                        />
                                        {conditionPhotos.front ? (
                                            <>
                                                <img src={conditionPhotos.front} alt="Front View" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-white/90 p-2 rounded-full">
                                                        <Camera className="h-6 w-6 text-[#0b1d3a]" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-6 w-6 text-slate-400 mb-2 group-hover:text-[#126dd5] transition-colors" />
                                                <span className="font-semibold text-[#0b1d3a] text-sm">Front View</span>
                                            </>
                                        )}
                                    </label>

                                    {/* Back */}
                                    <label className="relative h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 hover:bg-slate-50 hover:border-[#126dd5]/50 transition-all group cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => handlePhotoUpload('back', e)}
                                        />
                                        {conditionPhotos.back ? (
                                            <>
                                                <img src={conditionPhotos.back} alt="Back View" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-white/90 p-2 rounded-full">
                                                        <Camera className="h-6 w-6 text-[#0b1d3a]" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-6 w-6 text-slate-400 mb-2 group-hover:text-[#126dd5] transition-colors" />
                                                <span className="font-semibold text-[#0b1d3a] text-sm">Back View</span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleNext}
                                        className="rounded-xl px-8 bg-[#0b1d3a] hover:bg-[#126dd5] text-white"
                                    >
                                        Review & Confirm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {step === 3 && selectedItem && (
                        <div className="max-w-2xl">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
                                <h3 className="text-xl font-bold text-[#0b1d3a] mb-6">Return Summary</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-[#126dd5]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0b1d3a]">{selectedItem.equipmentName}</p>
                                                <p className="text-sm text-slate-500">{selectedItem.equipmentId}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                            Ready to Return
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border border-slate-100 rounded-2xl">
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Due Date</p>
                                            <p className="font-semibold text-[#0b1d3a]">{new Date(selectedItem.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-4 border border-slate-100 rounded-2xl">
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Days Remaining</p>
                                            <p className={`font-semibold ${getDaysRemaining(selectedItem.dueDate) < 0 ? 'text-rose-600' : 'text-[#0b1d3a]'}`}>
                                                {getDaysRemaining(selectedItem.dueDate)} Days
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                        <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                                        <p className="text-sm text-blue-800">
                                            By confirming, you certify that the equipment is in the same condition as when checked out.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="rounded-xl h-12 px-6 border-slate-200"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="rounded-xl h-12 px-8 bg-[#0b1d3a] hover:bg-[#126dd5] text-white shadow-lg shadow-blue-900/10"
                                >
                                    Confirm Return
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}

