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
    Loader2,
    AlertTriangle // Used for the warning UI
} from "lucide-react";
import api from "@/utils/api";
import PropTypes from "prop-types";
import { toast } from "sonner";

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
    const [equipmentList, setEquipmentList] = useState([]);
    const [classroomList, setClassroomList] = useState([]); // <--- NEW: Store API classrooms
    const [equipment, setEquipment] = useState(null);       // Selected item object

    // Form Data
    const [formData, setFormData] = useState({
        equipmentId: equipmentIdParam || "",
        course: "",
        lecture: "", // Optional, merged into destination usually
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

    // Exception State
    const [isException, setIsException] = useState(false); // <--- NEW: Tracks Projector vs Screen conflict

    // --- 1. INITIAL DATA FETCHING ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Get all equipment
                const eqRes = await api.get('/equipment');
                // Filter only available items for borrowing
                const availableItems = eqRes.data.filter(item => item.status === 'Available');
                setEquipmentList(availableItems);

                // 2. Get Classrooms (For validation)
                const roomRes = await api.get('/classrooms');
                setClassroomList(roomRes.data);

                // 3. Pre-select if ID is in URL
                if (equipmentIdParam) {
                    const found = eqRes.data.find(e => e._id === equipmentIdParam);
                    if (found) {
                        setEquipment(found);
                        setFormData(prev => ({ ...prev, equipmentId: found._id }));
                    }
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
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

    // --- 3. CAMERA & PHOTO HANDLERS ---
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
            toast.error("Camera access denied or not available.");
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

    // --- REAL-TIME EXCEPTION CHECK ---
    useEffect(() => {
        // Only run check if we are in the details step (3), we have an item, and a location is typed
        if (step === 3 && equipment && formData.location) {
            const checkException = () => {
                // 1. Is Equipment a Projector?
                const isProjector = equipment.name.toLowerCase().includes('projector') ||
                    (equipment.category && equipment.category.toLowerCase().includes('projector'));

                if (!isProjector) {
                    setIsException(false);
                    return;
                }

                // 2. Does Room have a screen?
                // Normalize input: "Room 101" -> "room101" to match database fuzzy search
                const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');
                const inputLoc = normalize(formData.location);

                // Find matching room in the loaded list
                const targetClassroom = classroomList.find(c => normalize(c.name) === inputLoc);

                if (targetClassroom && targetClassroom.hasScreen) {
                    setIsException(true); // <--- CONFLICT DETECTED
                } else {
                    setIsException(false);
                }
            };

            // Debounce the check (wait 300ms after typing stops)
            const timer = setTimeout(checkException, 300);
            return () => clearTimeout(timer);
        }
    }, [formData.location, equipment, step, classroomList]);

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};

        // Step 1: Equipment Selection
        if (!formData.equipmentId) newErrors.equipmentId = "Please select equipment";

        // Step 2 Logic
        if (step === 2) {
            if (flowType === 'borrow' && !isException) {
                // Standard borrow purpose validation
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

                // 👇 EXCEPTION VALIDATION: Block if no reason provided
                if (isException && !formData.purpose.trim()) {
                    newErrors.purpose = "You must provide a reason for using a projector in a screen room.";
                }
            } else if (flowType === 'reserve') {
                if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 5. SUBMIT HANDLER ---
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            // Prepare payload
            const payload = {
                equipmentId: formData.equipmentId,
                // If it's an exception, prepend a note so IT staff sees it easily
                purpose: isException ? `[EXCEPTION: Projector in Screen Room] ${formData.purpose}` : formData.purpose,
                destination: `${formData.location} (${formData.course})`,
            };

            if (flowType === 'borrow') {
                // === BORROW ACTION ===
                payload.expectedReturnTime = formData.sessionDateTime;

                const res = await api.post('/transactions/checkout', payload);

                // Different alerts based on backend status
                // We check both 'Pending' and 'pending_approval' to be safe
                if (res.data.status === 'Pending' || res.data.serverStatusMessage === 'pending_approval') {
                    toast.warning("Request Flagged for Approval — Because this room has a screen, your request is PENDING review by IT Staff.");
                } else {
                    toast.success("Checkout Successful! You can pick up your equipment.");
                }

                navigate('/student/borrowed-items');

            } else {
                // === RESERVE ACTION ===
                payload.reservationDate = formData.reservationDate;
                payload.reservationTime = formData.reservationTime;
                payload.location = formData.location; // Fallback if destination logic changes

                await api.post('/transactions/reserve', payload);
                toast.success("Reservation confirmed successfully!");
                navigate('/student/dashboard');
            }

        } catch (err) {
            console.error("Submit Error:", err);
            const msg = err.response?.data?.message || "Failed to submit.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // --- 6. RENDER HELPERS ---
    const currentSteps = flowType === "borrow"
        ? [{ label: "Scan / Select", icon: Scan }, { label: "Details", icon: ClipboardList }, { label: "Time & Place", icon: GraduationCap }, { label: "Confirm", icon: CheckCircle }]
        : [{ label: "Select Item", icon: Package }, { label: "Date & Time", icon: CalendarClock }, { label: "Class Details", icon: GraduationCap }, { label: "Confirm", icon: CheckCircle }];

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
                <button onClick={() => step > 1 ? setStep(s => s - 1) : setFlowType(null)} className="flex items-center text-slate-500 hover:text-[#0b1d3a]">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </button>
                <div className="text-sm font-medium text-slate-500">Step {step} of 4</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 relative h-1 bg-slate-100 rounded-full">
                <div className="absolute h-full bg-[#126dd5] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
            </div>

            {/* STEP 1: SELECT / SCAN */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
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
                            <Button onClick={isScanning ? () => { setIsScanning(false); stopCamera(); } : handleScanQR} variant="outline">
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

            {/* STEP 2: DETAILS */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' ? (
                        <>
                            <div className="space-y-2">
                                <Label>Standard Use Case</Label>
                                <Textarea
                                    value={formData.purpose}
                                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                                    placeholder="Briefly describe usage (e.g., Presentation for CS101)"
                                    className="h-32"
                                />
                                {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
                            </div>

                            {/* Optional Photo Upload */}
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
                        /* Reserve Date Picker */
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

            {/* STEP 3: TIME & PLACE (Contains Exception Logic) */}
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
                            <Input
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                placeholder="Room 304"
                            />
                            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>
                    </div>

                    {/* 👇👇👇 EXCEPTION ALERT UI 👇👇👇 */}
                    {isException && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="text-amber-600 w-6 h-6 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <h4 className="font-bold text-amber-800 text-sm">Restricted Setup Detected</h4>
                                <p className="text-amber-700 text-xs">
                                    The room you selected ({formData.location}) already has a screen installed.
                                    To borrow a projector for this room, you must provide a specific reason for IT Staff approval.
                                </p>
                                <Label className="text-amber-900 font-bold mt-2 block">Reason for Exception:</Label>
                                <Textarea
                                    className="bg-white border-amber-300 focus:border-amber-500"
                                    placeholder="e.g. The built-in screen is broken, or I need dual projection..."
                                    value={formData.purpose} // Re-using purpose field specifically for this
                                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                                />
                                {errors.purpose && <p className="text-sm text-red-600 font-bold">{errors.purpose}</p>}
                            </div>
                        </div>
                    )}
                    {/* 👆👆👆 END EXCEPTION UI 👆👆👆 */}

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

                            {/* Show warning in confirmation if exception */}
                            {isException && (
                                <div className="col-span-2 bg-amber-100 text-amber-800 p-2 rounded text-xs font-bold text-center border border-amber-200">
                                    ⚠️ Requires IT Approval (Projector in Screen Room)
                                </div>
                            )}

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
                    <Button onClick={() => validateForm() && setStep(s => s + 1)} className="bg-[#0b1d3a] h-12 px-8 rounded-xl">Continue</Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`h-12 px-8 rounded-xl ${isException ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#126dd5]'}`}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : isException ? "Submit for Approval" : "Confirm & Submit"}
                    </Button>
                )}
            </div>
        </div>
    );
}

BorrowRequestForm.propTypes = { onSuccess: PropTypes.func };