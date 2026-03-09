import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/pages/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { format, endOfWeek, isBefore, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/components/ui/utils";
import {
    QrCode,
    Package,
    GraduationCap,
    CheckCircle2,
    ClipboardList,
    CalendarClock,
    Scan,
    ArrowRight,
    ChevronLeft,
    Camera,
    Loader2,
    Clock, // NEW
    AlertTriangle, // Used for the warning UI
    Calendar as CalendarIcon
} from "lucide-react";
import api from "@/utils/api";
import PropTypes from "prop-types";
import EquipmentScanAndPhotoUpload from "@/components/EquipmentScanAndPhotoUpload";

export default function BorrowRequestForm({ onSuccess }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const studentName = user?.fullName || user?.username || "Student";
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
    const totalSteps = flowType === 'borrow' ? 3 : 2;

    // Data States
    const [equipmentList, setEquipmentList] = useState([]);
    const [classroomList, setClassroomList] = useState([]); // <--- NEW: Store API classrooms
    const [equipment, setEquipment] = useState(null);       // Selected item object

    // Form Data
    const [formData, setFormData] = useState({
        equipmentId: equipmentIdParam || "",
        course: "",
        courseName: "", // NEW
        lecturer: "", // NEW
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
    const [statusModal, setStatusModal] = useState(null); // { type: 'success'|'pending', message: string }

    // Exception State
    const [isException, setIsException] = useState(false); // <--- NEW: Tracks Projector vs Screen conflict
    const [showRoomAlert, setShowRoomAlert] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

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
                try {
                    const roomRes = await api.get('/classrooms');
                    setClassroomList(roomRes.data);
                } catch (roomErr) {
                    console.warn("Could not load classrooms (Permission issue?)", roomErr);
                    // Fallback to local storage if API fails
                    const { getClassrooms } = await import("@/utils/classroomStorage");
                    setClassroomList(getClassrooms());
                }

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
                console.log("Debug Info - Token:", localStorage.getItem('token'));
                console.log("Debug Info - User:", localStorage.getItem('user'));
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

    // --- REAL-TIME EXCEPTION CHECK ---
    useEffect(() => {
        // Only run check if we are in the details step (3), we have an item, and a location is typed
        if (step === 2 && equipment && formData.location) {
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

                const foundRoom = classroomList.find(c => normalize(c.name) === inputLoc);

                if (foundRoom && foundRoom.hasScreen) {
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

        if (step === 2) {
            if (!formData.course.trim()) newErrors.course = "Course Code is required";
            if (!formData.courseName.trim()) newErrors.courseName = "Course Name is required";
            if (!formData.lecturer.trim()) newErrors.lecturer = "Lecturer Name is required";
            if (!formData.location.trim()) newErrors.location = "Location is required";

            if (flowType === 'borrow') {
                if (!formData.sessionDateTime) {
                    newErrors.sessionDateTime = "Return time is required";
                } else {
                    const now = new Date();
                    const returnTime = new Date(formData.sessionDateTime);
                    const diffHours = (returnTime - now) / (1000 * 60 * 60);

                    // Constraints
                    if (returnTime.getDate() !== now.getDate()) {
                        newErrors.sessionDateTime = "Borrowing is only allowed for today.";
                    } else if (diffHours <= 0) {
                        newErrors.sessionDateTime = "Return time must be in the future.";
                    } else if (diffHours > 5) {
                        newErrors.sessionDateTime = "Maximum borrowing duration is 5 hours.";
                    } else if (returnTime.getHours() >= 19) {
                        newErrors.sessionDateTime = "No borrowing is allowed after 7:00 PM.";
                    }
                }

                if (isException && !formData.purpose.trim()) {
                    newErrors.purpose = "Reason for exception is required.";
                } else if (!isException && !formData.purpose.trim()) {
                    newErrors.purpose = "Purpose is required.";
                }
            } else if (flowType === 'reserve') {
                if (!formData.reservationDate) {
                    newErrors.reservationDate = "Date is required";
                } else {
                    const now = new Date();
                    const resDate = new Date(formData.reservationDate);
                    if (resDate.getDate() !== now.getDate()) {
                        newErrors.reservationDate = "Reservations are only allowed for today.";
                    }
                }
                if (!formData.reservationTime) newErrors.reservationTime = "Time is required";
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
                destination: `${formData.location} (${formData.course} - ${formData.courseName}, Lecturer: ${formData.lecturer})`,
            };

            if (flowType === 'borrow') {
                // === BORROW ACTION ===
                payload.expectedReturnTime = formData.sessionDateTime;

                const res = await api.post('/transactions/checkout', payload);

                // Different feedback based on backend status
                if (res.data.status === 'Pending' || res.data.serverStatusMessage === 'pending_approval') {
                    setStatusModal({
                        type: 'pending',
                        message: "Request Flagged for Approval. Because this room has a screen, your request is pending review by IT Staff."
                    });
                } else {
                    setStatusModal({
                        type: 'success',
                        message: "Checkout Successful! You can pick up your equipment now."
                    });
                }

            } else {
                // === RESERVE ACTION ===
                payload.reservationDate = formData.reservationDate;
                payload.reservationTime = formData.reservationTime;
                payload.location = formData.location;

                await api.post('/transactions/reserve', payload);
                setStatusModal({
                    type: 'success',
                    message: "Reservation confirmed successfully!"
                });
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
        ? [
            { label: "Identification", icon: Scan },
            { label: "Details", icon: ClipboardList },
            { label: "Review", icon: CheckCircle2 }
        ]
        : [
            { label: "Select Item", icon: Package },
            { label: "Reservation", icon: CalendarClock }
        ];

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
        <div className="w-full py-4">
            {/* Steps Container */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    {currentSteps.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setStep(i + 1)}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === i + 1 ? 'bg-[#126dd5] text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                                </div>
                                <span className={`text-sm font-black tracking-tight ${step === i + 1 ? 'text-[#0b1d3a]' : 'text-slate-400 group-hover:text-slate-600'}`}>{s.label}</span>
                            </button>
                            {i < currentSteps.length - 1 && <div className="w-12 h-1 bg-slate-100 mx-3 rounded-full" />}
                        </div>
                    ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    Step {step} / {totalSteps}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="absolute h-full bg-[#126dd5] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(18,109,213,0.3)]"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            {/* STEP 1: SCAN / PHOTOS / SELECT */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' ? (
                        <div className="space-y-6">
                            <EquipmentScanAndPhotoUpload
                                onScan={(result) => {
                                    // fuzzy logic to find equipment by serial or name from code
                                    const found = equipmentList.find(e =>
                                        e.serialNumber === result ||
                                        e.name.toLowerCase().includes(result.toLowerCase())
                                    );
                                    if (found) {
                                        handleEquipmentSelect(found._id);
                                    }
                                }}
                                onPhotosChange={setConditionPhotos}
                            />

                            <div className="pt-4 border-t border-slate-100">
                                <Label className="text-slate-500 mb-2 block">Or select equipment manually</Label>
                                <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                    <SelectTrigger className="h-12 bg-white text-[#0b1d3a] font-medium">
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
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Label className="text-[#0b1d3a] font-semibold">Select Equipment to Reserve</Label>
                            <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                <SelectTrigger className="h-12 bg-white text-[#0b1d3a] font-medium">
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
                        </div>
                    )}
                    {errors.equipmentId && <p className="text-sm text-red-500">{errors.equipmentId}</p>}
                </div>
            )}

            {/* STEP 2: DETAILS & SUBMIT */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Course Code</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.course} onChange={(e) => handleInputChange("course", e.target.value)} placeholder="e.g. CS101" />
                            {errors.course && <p className="text-xs text-rose-500 font-bold px-1">{errors.course}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Course Name</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.courseName} onChange={(e) => handleInputChange("courseName", e.target.value)} placeholder="e.g. Introduction to Programming" />
                            {errors.courseName && <p className="text-xs text-rose-500 font-bold px-1">{errors.courseName}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Lecturer / Supervisor</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.lecturer} onChange={(e) => handleInputChange("lecturer", e.target.value)} placeholder="Dr. John Doe" />
                            {errors.lecturer && <p className="text-xs text-rose-500 font-bold px-1">{errors.lecturer}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Classroom / Location</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all"
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                placeholder="Room 304"
                            />
                            {errors.location && <p className="text-xs text-rose-500 font-bold px-1">{errors.location}</p>}

                            {isException && (
                                <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <p className="text-[11px] font-medium text-amber-800 leading-tight">
                                        This room already has a screen. IT approval required.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consolidated Purpose / Justification Field */}
                    <div className="space-y-2 animate-in fade-in">
                        <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                            {isException ? "Justification for Projector" : "Purpose of Usage"}
                        </Label>
                        <div className="p-0.5 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm ring-1 ring-slate-200 overflow-hidden focus-within:ring-[#126dd5] transition-all">
                            <Textarea
                                value={formData.purpose}
                                onChange={(e) => handleInputChange("purpose", e.target.value)}
                                placeholder={isException ? "Explain why a projector is needed here..." : "Please describe why you need this equipment..."}
                                className="border-none bg-transparent min-h-[100px] text-[#0b1d3a] font-medium resize-none focus-visible:ring-0 py-3 px-4"
                            />
                        </div>
                        {errors.purpose && <p className="text-xs text-rose-500 font-bold px-1">{errors.purpose}</p>}
                    </div>

                    {flowType === 'borrow' ? (
                        <div className="space-y-6">
                            <div className="space-y-6 p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden transition-all duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] px-1">Quick Duration Preset</Label>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {[2, 3, 3.5, 4, 4.5].map((hrs) => {
                                            const now = new Date().getTime();
                                            const currentH = formData.sessionDateTime ? (new Date(formData.sessionDateTime).getTime() - now) / (1000 * 60 * 60) : 0;
                                            const isActive = Math.abs(currentH - hrs) < 0.1;
                                            return (
                                                <button
                                                    key={hrs}
                                                    type="button"
                                                    onClick={() => {
                                                        const target = new Date();
                                                        target.setMinutes(target.getMinutes() + hrs * 60);
                                                        const localDate = target.toLocaleDateString('en-CA');
                                                        const localTime = target.toTimeString().substring(0, 5);
                                                        handleInputChange("sessionDateTime", `${localDate}T${localTime}:00`);
                                                    }}
                                                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${isActive ? 'bg-[#126dd5] border-[#126dd5] text-white shadow-lg shadow-blue-100 scale-105' : 'bg-slate-50 border-slate-100 text-[#0b1d3a] hover:bg-slate-100 hover:border-slate-200'}`}
                                                >
                                                    {hrs}h
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-4 mt-2">
                                        <div className="space-y-2">
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1">Expected Return</span>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-3 rounded-2xl border-2 border-blue-100 flex items-center gap-3 w-fit">
                                                    <Clock className="w-5 h-5 text-[#126dd5]" />
                                                    <Input
                                                        className="bg-transparent border-none text-[#0b1d3a] font-black text-xl h-8 w-28 p-0 focus-visible:ring-0 tabular-nums"
                                                        type="time"
                                                        value={formData.sessionDateTime ? formData.sessionDateTime.split('T')[1]?.substring(0, 5) : ""}
                                                        onChange={(e) => {
                                                            const date = new Date().toLocaleDateString('en-CA');
                                                            handleInputChange("sessionDateTime", `${date}T${e.target.value}:00`);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.sessionDateTime && <p className="text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{errors.sessionDateTime}</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Reservation Date</Label>
                                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-12 justify-start text-left font-medium rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all",
                                                    !formData.reservationDate && "text-slate-400"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 text-[#126dd5]" />
                                                {formData.reservationDate ? format(new Date(formData.reservationDate), "MMM dd") : <span>Pick date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.reservationDate ? new Date(formData.reservationDate) : null}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        handleInputChange("reservationDate", format(date, "yyyy-MM-dd"));
                                                        setDatePickerOpen(false);
                                                    }
                                                }}
                                                disabled={(date) => {
                                                    const today = startOfDay(new Date());
                                                    const sunday = endOfWeek(today, { weekStartsOn: 1 });
                                                    return isBefore(date, today) || date > sunday;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Pick Up Time</Label>
                                    <Select value={formData.reservationTime} onValueChange={(val) => handleInputChange("reservationTime", val)}>
                                        <SelectTrigger className="bg-white h-12 rounded-xl border-slate-200 focus:ring-[#126dd5]">
                                            <SelectValue placeholder="Select time" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {timeSlots.map(slot => (
                                                <SelectItem key={slot.time} value={slot.time}>{slot.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(errors.reservationDate || errors.reservationTime) && (
                                <div className="flex flex-col gap-1 px-1">
                                    {errors.reservationDate && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.reservationDate}</p>}
                                    {errors.reservationTime && <p className="text-[10px] text-rose-500 font-bold uppercase">{errors.reservationTime}</p>}
                                </div>
                            )}

                            {!isException && (
                                <p className="text-[10px] text-slate-400 italic px-1">Note: Current week reservations only (until Sunday).</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: FINAL REVIEW */}
            {step === 3 && flowType === 'borrow' && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                    <ClipboardList className="w-7 h-7 text-[#126dd5]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#0b1d3a] tracking-tight">Borrow Review</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Verify all details before final confirmation</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Student Info Bar */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#126dd5] flex items-center justify-center text-white font-black">
                                        {studentName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Student Account</p>
                                        <p className="text-[#0b1d3a] font-black text-sm">{studentName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Current Date</p>
                                    <p className="text-[#0b1d3a] font-black text-sm">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-1">Equipment Identification</label>
                                        <div className="p-6 bg-[#126dd5]/5 rounded-3xl border-2 border-[#126dd5]/10 flex items-center gap-5 h-[140px]">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                                <Package className="w-8 h-8 text-[#126dd5]" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[#0b1d3a] font-black text-xl leading-tight">{equipment?.name || "Ref: " + formData.equipmentId}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 font-bold">Serial:</span>
                                                    <code className="text-[#126dd5] font-black text-xs bg-white px-2 py-0.5 rounded border border-[#126dd5]/10">{equipment?.serialNumber || "#SCAN_TAG"}</code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-1">Destination & Course</label>
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-bold text-[10px] uppercase">Course</span>
                                                <span className="text-[#0b1d3a] font-bold text-sm tracking-tight">{formData.course} - {formData.courseName}</span>
                                            </div>
                                            <div className="h-px bg-slate-200" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-bold text-[10px] uppercase">Lecturer</span>
                                                <span className="text-[#0b1d3a] font-bold text-sm">{formData.lecturer || "Not Specified"}</span>
                                            </div>
                                            <div className="h-px bg-slate-200" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-bold text-[10px] uppercase">Classroom</span>
                                                <span className="text-[#0b1d3a] font-bold text-sm">{formData.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-1">Timing Summary</label>
                                        <div className="p-6 bg-[#126dd5]/5 rounded-3xl border-2 border-[#126dd5]/10 flex flex-col justify-center gap-3 h-[140px]">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">Start</span>
                                                        <span className="text-[#0b1d3a] font-black text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="w-8 h-px bg-[#126dd5]/20" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[#126dd5] text-[8px] font-black uppercase tracking-widest leading-none">Return By</span>
                                                        <span className="text-[#0b1d3a] font-black text-sm">{formData.sessionDateTime ? new Date(formData.sessionDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-[#126dd5] text-white px-3 py-1.5 rounded-xl font-black text-[10px] shadow-lg shadow-blue-100 ring-4 ring-white/50">
                                                    {formData.sessionDateTime ? (
                                                        (() => {
                                                            const diff = (new Date(formData.sessionDateTime) - new Date()) / (1000 * 60);
                                                            const h = Math.floor(diff / 60);
                                                            const m = Math.floor(diff % 60);
                                                            return `${h}h ${m}m`;
                                                        })()
                                                    ) : "0h 0m"}
                                                </div>
                                            </div>
                                            <div className="h-px bg-[#126dd5]/10 mx-2" />
                                            <div className="flex items-center gap-2 px-2">
                                                <Clock className="w-3.5 h-3.5 text-[#126dd5]" />
                                                <span className="text-slate-500 font-bold text-[10px] uppercase">Session Duration</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] px-1">Proof of Condition</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['front', 'back'].map(side => (
                                                <div key={side} className="aspect-video rounded-2xl border-2 border-white shadow-md overflow-hidden relative group">
                                                    {conditionPhotos[side] ? (
                                                        <img src={conditionPhotos[side]} alt={side} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            <Camera className="w-4 h-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-bold uppercase">{side}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="mt-8 flex justify-end gap-4">
                {step > 1 && (
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="h-12 px-6 rounded-xl border-slate-200 text-[#0b1d3a] font-bold"
                    >
                        Back
                    </Button>
                )}

                {step < totalSteps ? (
                    <Button
                        onClick={() => validateForm() && setStep(step + 1)}
                        className="bg-[#0b1d3a] hover:bg-[#1a3b6e] h-12 px-8 rounded-xl font-black shadow-lg shadow-slate-200 flex items-center gap-2 text-white"
                    >
                        {step === 2 ? "Review Details" : "Next Step"} <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`h-12 px-10 rounded-xl font-black shadow-xl transition-all active:scale-95 text-white flex gap-2 items-center ${isException ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#126dd5] hover:bg-[#0f5ab1] shadow-blue-200'}`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isException ? "Confirm for Approval" : "Finalize & Borrow"}</span>
                            </>
                        )}
                    </Button>
                )}
                {/* Status Modal Overlay */}
                {statusModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-[#0b1d3a]/60 backdrop-blur-md" onClick={() => navigate("/student/borrowed-items")} />
                        <div className="relative bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300 border border-slate-100">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'success' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                {statusModal.type === 'success' ? (
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                ) : (
                                    <Clock className="w-10 h-10 text-amber-500" />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-[#0b1d3a] mb-3 font-serif">
                                {statusModal.type === 'success' ? 'Confirmed!' : 'Under Review'}
                            </h3>
                            <p className="text-slate-500 mb-8 text-sm px-2 leading-relaxed">
                                {statusModal.message}
                            </p>
                            <Button
                                onClick={() => navigate("/student/borrowed-items")}
                                className="w-full bg-[#0b1d3a] hover:bg-[#126dd5] h-14 rounded-2xl font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                            >
                                Track My Items
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}


BorrowRequestForm.propTypes = { onSuccess: PropTypes.func };