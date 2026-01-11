import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Scan, Camera, CheckCircle, Package, Clock, QrCode, AlertTriangle, Loader2 } from "lucide-react";
import api from "@/utils/api";

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
    
    // Camera State
    const [isScanning, setIsScanning] = useState(false);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });
    const videoRef = useRef(null);

    // --- 1. FETCH ACTIVE LOANS ---
    useEffect(() => {
        const fetchActiveLoans = async () => {
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
                console.error("Failed to load active loans:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveLoans();
    }, [initialEquipmentId]);

    // Cleanup Camera on Unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleScanQR = async () => {
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera denied:", err);
            setIsScanning(false);
            alert("Camera not accessible.");
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
            stopCamera();
            setStep(3);
        } else if (step === 3) {
            // --- SUBMIT RETURN ---
            setSubmitting(true);
            try {
                const payload = {
                    equipmentId: selectedId,
                    condition: "Good" // You can add a dropdown for this later
                };
                
                await api.post('/transactions/checkin', payload);
                alert("Return processed successfully!");
                navigate("/student/borrowed-items");
            } catch (err) {
                console.error("Return failed:", err);
                alert(err.response?.data?.message || "Return failed. Try again.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Find the full transaction object for the selected ID
    const selectedTransaction = activeItems.find(t => t.equipment._id === selectedId);

    if (loading) return <div className="p-10 text-center">Loading returnable items...</div>;

    const steps = [
        { label: "Select Item", icon: Package },
        { label: "Verify", icon: Scan },
        { label: "Confirm", icon: CheckCircle },
    ];

    return (
        <StudentLayout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <button onClick={() => step > 1 ? setStep(s => s-1) : navigate('/student/borrowed-items')} className="flex items-center text-slate-500">
                        <ChevronLeft className="w-4 h-4 mr-1"/> Back
                    </button>
                    <div className="text-sm text-slate-500">Step {step} of 3</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 relative h-1 bg-slate-100 rounded-full">
                    <div className="absolute h-full bg-[#126dd5] transition-all" style={{ width: `${((step-1)/2)*100}%` }} />
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#0b1d3a]">{steps[step-1].label}</h2>

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

                    {/* STEP 2: VERIFY (Mock Camera) */}
                    {step === 2 && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label>Scan QR Code (Optional)</Label>
                                <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                                    {isScanning ? (
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <QrCode className="w-12 h-12 mx-auto mb-2"/>
                                            <p>Camera Off</p>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={isScanning ? () => {setIsScanning(false); stopCamera();} : handleScanQR} variant="outline" className="w-full">
                                    {isScanning ? "Stop Camera" : "Start Scanning"}
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <Label>Condition Photo (Optional)</Label>
                                <label className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload('front', e)} />
                                    {conditionPhotos.front ? (
                                        <img src={conditionPhotos.front} className="h-full w-full object-cover rounded-xl" />
                                    ) : (
                                        <>
                                            <Camera className="w-8 h-8 text-slate-300 mb-2" />
                                            <span className="text-xs text-slate-400">Click to upload</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {step === 3 && selectedTransaction && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold mb-4">Confirm Return</h3>
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
                            className="bg-[#0b1d3a] hover:bg-[#126dd5] h-12 px-8 rounded-xl"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : (step === 3 ? "Confirm Return" : "Next Step")}
                        </Button>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}