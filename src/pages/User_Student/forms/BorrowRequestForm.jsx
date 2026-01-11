import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    QrCode,
    Package,
    GraduationCap,
    CheckCircle,
    ClipboardList,
    CalendarClock,
    Scan,
    ArrowRight,
    ChevronLeft,
    Camera,
    Loader2
} from "lucide-react";
import api from "@/utils/api";
import PropTypes from "prop-types";

export default function BorrowRequestForm({ onSuccess }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentIdParam = searchParams.get("equipmentId");
    const actionParam = searchParams.get("action");
    const scanMode = searchParams.get("scan") === "true";

    const videoRef = useRef(null);

    // --- STATE ---
    // Flow: null = choice screen, 'borrow' = borrow wizard, 'reserve' = reserve wizard
    const [flowType, setFlowType] = useState(actionParam || null);
    const [step, setStep] = useState(1);
    
    // Data States
    const [equipmentList, setEquipmentList] = useState([]); // For dropdown
    const [equipment, setEquipment] = useState(null);       // Selected item
    
    // Form Data
    const [formData, setFormData] = useState({
        equipmentId: equipmentIdParam || "",
        course: "",
        lecture: "",
        purpose: "",
        location: "",
        // Borrow fields
        sessionDateTime: "",
        // Reserve fields
        reservationDate: "",
        reservationTime: "",
        notes: "",
    });

    // UI States
    const [isScanning, setIsScanning] = useState(scanMode);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });
    const [timeSlots, setTimeSlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // --- 1. INITIAL DATA FETCHING ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Get all equipment for the dropdown
                const res = await api.get('/equipment');
                const availableItems = res.data.filter(item => item.status === 'Available');
                setEquipmentList(availableItems);

                // If ID is passed in URL, set it immediately
                if (equipmentIdParam) {
                    const found = res.data.find(e => e._id === equipmentIdParam);
                    if (found) {
                        setEquipment(found);
                        setFormData(prev => ({ ...prev, equipmentId: found._id }));
                    }
                }
            } catch (err) {
                console.error("Failed to load equipment list", err);
            }
        };
        loadInitialData();
    }, [equipmentIdParam]);

    // --- 2. HELPER: Time Slots (For Reservation) ---
    useEffect(() => {
        if (formData.reservationDate) {
            const slots = [];
            for (let hour = 8; hour <= 18; hour++) {
                slots.push({
                    time: `${hour.toString().padStart(2, "0")}:00`,
                    available: true,
                    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
                });
            }
            setTimeSlots(slots);
        }
    }, [formData.reservationDate]);

    // --- 3. CAMERA & PHOTO HANDLERS (UI ONLY) ---
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
            alert("Camera access denied or not available.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // --- 4. FORM LOGIC ---
    const handleEquipmentSelect = (id) => {
        const found = equipmentList.find(e => e._id === id);
        if (found) {
            setEquipment(found);
            setFormData(prev => ({ ...prev, equipmentId: id }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};
        
        // Step 1: Equipment Selection
        if (!formData.equipmentId) newErrors.equipmentId = "Please select equipment";
        
        // Step 2 Logic
        if (step === 2) {
            if (flowType === 'borrow') {
                if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
            } else if (flowType === 'reserve') {
                if (!formData.reservationDate) newErrors.reservationDate = "Date is required";
                if (!formData.reservationTime) newErrors.reservationTime = "Time is required";
            }
        }

        // Step 3 Logic
        if (step === 3) {
            if (!formData.course.trim()) newErrors.course = "Course is required";
            if (!formData.location.trim()) newErrors.location = "Location is required";

            if (flowType === 'borrow') {
                if (!formData.sessionDateTime) newErrors.sessionDateTime = "Return time is required";
            } else if (flowType === 'reserve') {
                // For reserve, purpose is asked in step 3
                if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 5. SUBMIT HANDLER (UPDATED) ---
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            if (flowType === 'borrow') {
                // === BORROW ACTION (Real) ===
                const payload = {
                    equipmentId: formData.equipmentId,
                    expectedReturnTime: formData.sessionDateTime,
                    destination: `${formData.location} (${formData.course})`,
                    purpose: formData.purpose,
                };
                
                await api.post('/transactions/checkout', payload);
                
                // 👇 UPDATED: Inform user about pending approval
                alert("Request submitted successfully! Please wait for IT approval.");
                navigate('/student/borrowed-items');

            } else {
                // === RESERVE ACTION (Real) ===
                const payload = {
                    equipmentId: formData.equipmentId,
                    reservationDate: formData.reservationDate,
                    reservationTime: formData.reservationTime,
                    location: formData.location,
                    course: formData.course,
                    purpose: formData.purpose
                };

                await api.post('/transactions/reserve', payload);
                
                alert("Reservation confirmed successfully!");
                navigate('/student/dashboard');
            }

        } catch (err) {
            console.error("Submit Error:", err);
            const msg = err.response?.data?.message || "Failed to submit.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // --- 6. RENDER HELPERS ---
    const currentSteps = flowType === "borrow" 
        ? [ { label: "Scan / Select", icon: Scan }, { label: "Details", icon: ClipboardList }, { label: "Time & Place", icon: GraduationCap }, { label: "Confirm", icon: CheckCircle } ]
        : [ { label: "Select Item", icon: Package }, { label: "Date & Time", icon: CalendarClock }, { label: "Class Details", icon: GraduationCap }, { label: "Confirm", icon: CheckCircle } ];

    // --- RENDER: CHOICE SCREEN ---
    if (!flowType) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Borrow Option */}
                    <button onClick={() => setFlowType("borrow")} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#126dd5] hover:shadow-xl transition-all text-left">
                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 text-[#126dd5] inline-block">
                            <Scan className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2">Borrow Now</h3>
                        <p className="text-slate-500 mb-6">For immediate pickup. Scan QR or select from list.</p>
                        <div className="text-[#126dd5] font-semibold flex items-center group-hover:gap-2 transition-all">
                            Start Borrowing <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </button>

                    {/* Reserve Option */}
                    <button onClick={() => setFlowType("reserve")} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all text-left">
                        <div className="mb-6 p-4 rounded-2xl bg-purple-50 text-purple-600 inline-block">
                            <CalendarClock className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2">Reserve for Later</h3>
                        <p className="text-slate-500 mb-6">Schedule equipment for a future class or event.</p>
                        <div className="text-purple-600 font-semibold flex items-center group-hover:gap-2 transition-all">
                            Make Reservation <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: WIZARD ---
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header / Nav */}
            <div className="mb-8 flex items-center justify-between">
                <button onClick={() => step > 1 ? setStep(s => s-1) : setFlowType(null)} className="flex items-center text-slate-500 hover:text-[#0b1d3a]">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </button>
                <div className="text-sm font-medium text-slate-500">Step {step} of 4</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 relative h-1 bg-slate-100 rounded-full">
                <div className="absolute h-full bg-[#126dd5] transition-all duration-300" style={{ width: `${(step/4)*100}%` }} />
            </div>

            {/* STEP 1: SELECT / SCAN */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                             {/* FAKE CAMERA UI - Does not block submission */}
                             <div className="w-full max-w-sm mx-auto aspect-video bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {isScanning ? (
                                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                                ) : (
                                    <div className="text-slate-500 flex flex-col items-center">
                                        <QrCode className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-sm">Camera Off</span>
                                    </div>
                                )}
                             </div>
                             <Button onClick={isScanning ? () => {setIsScanning(false); stopCamera();} : handleScanQR} variant="outline">
                                {isScanning ? "Stop Camera" : "Scan QR Code"}
                             </Button>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <Label>Select Equipment manually</Label>
                        <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="Choose item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {equipmentList.map(item => (
                                    <SelectItem key={item._id} value={item._id}>
                                        {item.name} <span className="text-slate-400 text-xs ml-2">({item.serialNumber})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.equipmentId && <p className="text-sm text-red-500">{errors.equipmentId}</p>}
                    </div>
                </div>
            )}

            {/* STEP 2: (Borrow: Details) OR (Reserve: Date/Time) */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' ? (
                        <>
                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Textarea 
                                    value={formData.purpose} 
                                    onChange={(e) => handleInputChange("purpose", e.target.value)} 
                                    placeholder="Why do you need this?" 
                                    className="h-32" 
                                />
                                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
                            </div>
                            
                            {/* FAKE PHOTO UPLOAD UI */}
                            <div className="space-y-2">
                                <Label>Condition Photos (Optional)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['front', 'back'].map(view => (
                                        <label key={view} className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(view, e)} />
                                            {conditionPhotos[view] ? (
                                                <img src={conditionPhotos[view]} alt={view} className="h-full w-full object-cover rounded-xl" />
                                            ) : (
                                                <>
                                                    <Camera className="h-6 w-6 text-slate-300 mb-2" />
                                                    <span className="text-xs text-slate-400 capitalize">{view} View</span>
                                                </>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        // Reserve Flow: Date Picker
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Reservation Date</Label>
                                <Input type="date" value={formData.reservationDate} onChange={(e) => handleInputChange("reservationDate", e.target.value)} />
                            </div>
                            {formData.reservationDate && (
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map(slot => (
                                        <button 
                                            key={slot.time} 
                                            onClick={() => handleInputChange("reservationTime", slot.time)}
                                            className={`p-2 text-sm rounded border ${formData.reservationTime === slot.time ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-300'}`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.reservationDate && <p className="text-sm text-red-500">{errors.reservationDate}</p>}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: (Borrow: Time/Loc) OR (Reserve: Class Info) */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Course Code</Label>
                            <Input value={formData.course} onChange={(e) => handleInputChange("course", e.target.value)} placeholder="CS101" />
                            {errors.course && <p className="text-sm text-red-500">{errors.course}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Classroom / Location</Label>
                            <Input value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="Room 304" />
                            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>
                    </div>

                    {flowType === 'borrow' ? (
                        <div className="space-y-2">
                            <Label>Return By (Max 24h)</Label>
                            <Input type="datetime-local" value={formData.sessionDateTime} onChange={(e) => handleInputChange("sessionDateTime", e.target.value)} />
                            {errors.sessionDateTime && <p className="text-sm text-red-500">{errors.sessionDateTime}</p>}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Purpose</Label>
                            <Textarea value={formData.purpose} onChange={(e) => handleInputChange("purpose", e.target.value)} />
                        </div>
                    )}
                </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-[#0b1d3a] mb-4">Confirm Request</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Item:</span> <span className="font-medium block">{equipment?.name}</span></div>
                            <div><span className="text-slate-500">Location:</span> <span className="font-medium block">{formData.location}</span></div>
                            <div>
                                <span className="text-slate-500">{flowType === 'borrow' ? 'Return By:' : 'Reserved For:'}</span>
                                <span className="font-medium block">
                                    {flowType === 'borrow' ? new Date(formData.sessionDateTime).toLocaleString() : `${formData.reservationDate} @ ${formData.reservationTime}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="mt-8 flex justify-end">
                {step < 4 ? (
                    <Button onClick={() => validateForm() && setStep(s => s+1)} className="bg-[#0b1d3a] h-12 px-8 rounded-xl">Continue</Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-[#126dd5] h-12 px-8 rounded-xl">
                        {submitting ? <Loader2 className="animate-spin" /> : "Confirm & Submit"}
                    </Button>
                )}
            </div>
        </div>
    );
}

BorrowRequestForm.propTypes = { onSuccess: PropTypes.func };