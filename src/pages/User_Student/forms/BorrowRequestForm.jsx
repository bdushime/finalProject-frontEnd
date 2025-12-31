import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<<<<<<< HEAD
import { QrCode, MapPin, Calendar } from "lucide-react";
import { getEquipmentById } from "@/components/lib/equipmentData";
import CategoryBadge from "../components/CategoryBadge";
=======
import {
    QrCode,
    MapPin,
    Calendar,
    Package,
    Clock,
    BookOpen,
    GraduationCap,
    FileText,
    CheckCircle,
    ClipboardList,
    CalendarClock,
    Scan,
    ArrowRight,
    Search,
    ChevronLeft,
    Camera,
} from "lucide-react";
import { equipmentData, getEquipmentById } from "@/components/lib/equipmentData";
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776
import PropTypes from "prop-types";

// Mock available equipment for browsing
const availableEquipment = [
    { id: "PRJ-001", name: "Epson Projector", type: "Projector", available: true, location: "Room 101" },
    { id: "PRJ-002", name: "BenQ Projector", type: "Projector", available: true, location: "Room 102" },
    { id: "PRJ-003", name: "Sony Projector", type: "Projector", available: false, location: "Room 103" },
    { id: "RMT-001", name: "Presentation Remote", type: "Remote", available: true, location: "Room 101" },
    { id: "RMT-002", name: "Laser Pointer Remote", type: "Remote", available: true, location: "Room 102" },
    { id: "MIC-001", name: "Wireless Microphone", type: "Audio", available: true, location: "Room 201" },
];

// Mock time slots for reservation
const generateTimeSlots = (date) => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
        const isAvailable = Math.random() > 0.3;
        slots.push({
            time: `${hour.toString().padStart(2, "0")}:00`,
            available: isAvailable,
            label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
        });
    }
    return slots;
};

export default function BorrowRequestForm({ onSuccess }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentId = searchParams.get("equipmentId");
    const actionParam = searchParams.get("action");
    const scanMode = searchParams.get("scan") === "true";

    const videoRef = useRef(null);

    // Flow state: null = choice screen, 'borrow' = borrow wizard, 'reserve' = reserve wizard
    const [flowType, setFlowType] = useState(actionParam || null);
    const [step, setStep] = useState(1);
    const [scanResult, setScanResult] = useState(null);
    // Score Check - For demo, using mock score. In real app, fetch from context/API.
    // CHANGE THIS VALUE TO TEST BLOCKING (e.g. 45)
    const studentScore = 92;

    useEffect(() => {
        if (studentScore <= 50) {
            // Redirect to score page if blocked
            navigate('/student/score');
        }
    }, [studentScore, navigate]);
    const [equipment, setEquipment] = useState(null);
    const [formData, setFormData] = useState({
        equipmentId: equipmentId || "",
        course: "",
        lecture: "",
        purpose: "",
        location: "",
        sessionDateTime: "",
        reservationDate: "",
        reservationTime: "",
        notes: "",
    });
    const [isScanning, setIsScanning] = useState(scanMode);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [timeSlots, setTimeSlots] = useState([]);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });

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

    useEffect(() => {
        if (equipmentId) {
            const eq = getEquipmentById(equipmentId);
            setEquipment(eq);
            setFormData((prev) => ({ ...prev, equipmentId: equipmentId }));
        }
    }, [equipmentId]);

    useEffect(() => {
        if (formData.reservationDate) {
            setTimeSlots(generateTimeSlots(formData.reservationDate));
        }
    }, [formData.reservationDate]);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleScanQR = async () => {
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
            setErrors((prev) => ({
                ...prev,
                scan: "Camera access denied. Please allow camera permissions.",
            }));
            setIsScanning(false);
        }
    };

    // Step definitions for each flow
    const borrowSteps = [
        { label: "Scan Equipment", icon: Scan, description: "Scan QR code" },
        { label: "Request Details", icon: ClipboardList, description: "Why you need it" },
        { label: "Session Info", icon: GraduationCap, description: "Class details" },
        { label: "Review", icon: CheckCircle, description: "Confirm request" },
    ];

    const reserveSteps = [
        { label: "Select Equipment", icon: Package, description: "Browse available" },
        { label: "Pick Date & Time", icon: CalendarClock, description: "Choose slot" },
        { label: "Session Info", icon: GraduationCap, description: "Class details" },
        { label: "Review", icon: CheckCircle, description: "Confirm reservation" },
    ];

    const currentSteps = flowType === "borrow" ? borrowSteps : reserveSteps;

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const selectEquipment = (eq) => {
        setEquipment(eq);
        setFormData((prev) => ({ ...prev, equipmentId: eq.id }));
    };

    const handleEquipmentSelect = (eqId) => {
        const eq = availableEquipment.find((e) => e.id === eqId);
        if (eq) {
            setEquipment(eq);
            setFormData((prev) => ({ ...prev, equipmentId: eq.id }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.equipmentId) newErrors.equipmentId = "Please select equipment";
        if (!formData.purpose || !formData.purpose.trim()) newErrors.purpose = "Purpose is required";
        if (!formData.course || !formData.course.trim()) newErrors.course = "Course is required";
        if (!formData.lecture || !formData.lecture.trim()) newErrors.lecture = "Lecture/Section is required";
        if (!formData.location || !formData.location.trim()) newErrors.location = "Classroom is required";

        if (flowType === "borrow") {
            if (!formData.sessionDateTime) newErrors.sessionDateTime = "Session date and time is required";
        } else {
            if (!formData.reservationDate) newErrors.reservationDate = "Please select a date";
            if (!formData.reservationTime) newErrors.reservationTime = "Please select a time slot";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) {
            if (!formData.equipmentId) setStep(1);
            else if (flowType === "reserve" && (!formData.reservationDate || !formData.reservationTime)) setStep(2);
            else if (!formData.purpose || !formData.course || !formData.lecture || !formData.location) setStep(3);
            return;
        }

        const submitData = {
            ...formData,
            action: flowType,
        };

        console.log("Submitting request:", submitData);
        if (onSuccess) {
            onSuccess(submitData);
        } else {
            if (flowType === "reserve") {
                alert(
                    `Reservation submitted successfully for ${equipment?.name || formData.equipmentId}! You will be notified once it is confirmed.`
                );
            } else {
                alert(
                    `Borrow request submitted successfully for ${equipment?.name || formData.equipmentId}! You will be notified once it is reviewed.`
                );
            }
            navigate("/student/equipment");
        }
    };

    const toLocalDatetime = (d) => {
        const tzOffset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - tzOffset * 60000);
        return local.toISOString().slice(0, 16);
    };

    const minDateTimeStr = toLocalDatetime(new Date());
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateTimeStr = toLocalDatetime(maxDate);

    const today = new Date().toISOString().split("T")[0];
    const maxReservationDate = new Date();
    maxReservationDate.setDate(maxReservationDate.getDate() + 30);
    const maxReservationDateStr = maxReservationDate.toISOString().split("T")[0];

    // Filter equipment for reservation browse
    const filteredEquipment = availableEquipment.filter((eq) => {
        const matchesSearch =
            eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            eq.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === "all" || eq.type.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const handleBack = () => {
        if (step > 1) {
            setStep((s) => s - 1);
        } else {
            setFlowType(null);
            setStep(1);
            setFormData({
                equipmentId: "",
                course: "",
                lecture: "",
                purpose: "",
                location: "",
                sessionDateTime: "",
                reservationDate: "",
                reservationTime: "",
                notes: "",
            });
            setEquipment(null);
            setErrors({});
        }
    };

    // ============ CHOICE SCREEN ============
    if (!flowType) {
        return (
            <div className="max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Borrow Now Option */}
                    <button
                        onClick={() => setFlowType("borrow")}
                        className="group relative bg-white p-8 rounded-3xl border border-slate-200 text-left transition-all hover:border-[#126dd5] hover:shadow-xl hover:shadow-blue-900/5 intro-card-delay"
                    >
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-[#0f7de5]/10 text-[#0f7de5] group-hover:bg-[#0f7de5] group-hover:text-white transition-colors">
                            <Scan className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-3 group-hover:text-[#0f7de5] transition-colors">Borrow Now</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            For immediate pickup. Scan the QR code on the equipment or select from the list.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 mb-8">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" /> Instant verification
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" /> No waiting time
                            </li>
                        </ul>
                        <span className="inline-flex items-center text-[#0f7de5] font-semibold group-hover:gap-2 transition-all">
                            Start Borrowing <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                    </button>

                    {/* Reserve for Later Option */}
                    <button
                        onClick={() => setFlowType("reserve")}
                        className="group relative bg-white p-8 rounded-3xl border border-slate-200 text-left transition-all hover:border-[#7c3aed] hover:shadow-xl hover:shadow-purple-900/5"
                    >
                        <div className="mb-6 inline-flex p-4 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
                            <CalendarClock className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-3 group-hover:text-[#7c3aed] transition-colors">Reserve for Later</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Schedule equipment for a future class or event. We'll have it ready for you.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 mb-8">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" /> Guaranteed availability
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" /> Plan ahead up to 30 days
                            </li>
                        </ul>
                        <span className="inline-flex items-center text-[#7c3aed] font-semibold group-hover:gap-2 transition-all">
                            Make Reservation <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    // ============ WIZARD FLOW ============
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Back to choice + Step Indicators */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-[#0b1d3a] transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {step === 1 ? "Back to options" : "Previous step"}
                    </button>
                    <div className="text-sm font-medium text-slate-500">
                        Step {step} of 4
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-[#126dd5] -translate-y-1/2 rounded-full transition-all duration-300"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                        {currentSteps.map((s, idx) => {
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

            {/* Main Content - Card styling removed for alignment */}
            <div className="space-y-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#0b1d3a] mb-2">{currentSteps[step - 1].label}</h2>
                    <p className="text-slate-500">
                        {flowType === "borrow" && step === 1 && "Scan the QR code on the equipment you want to borrow."}
                        {flowType === "borrow" && step === 2 && "Tell us why you need this equipment."}
                        {flowType === "borrow" && step === 3 && "Provide your class details and session time."}
                        {flowType === "borrow" && step === 4 && "Review all details and submit your request."}
                        {flowType === "reserve" && step === 1 && "Browse and select available equipment."}
                        {flowType === "reserve" && step === 2 && "Choose your preferred date and time slot."}
                        {flowType === "reserve" && step === 3 && "Provide your class details and purpose."}
                        {flowType === "reserve" && step === 4 && "Review all details and confirm your reservation."}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* ============ BORROW FLOW STEPS ============ */}
                    {flowType === "borrow" && (
                        <>
                            {/* Borrow Step 1: Scan QR */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                    {/* Left Column: Scanner */}
                                    <div className="space-y-6">
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
                                                            <p className="text-sm text-slate-500">Click below to start scanning</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={isScanning ? () => { setIsScanning(false); stopCamera(); } : handleScanQR}
                                                    className={`rounded-xl px-6 text-white ${isScanning ? "bg-rose-500 hover:bg-rose-600" : "bg-[#0b1d3a] hover:bg-[#126dd5]"}`}
                                                >
                                                    {isScanning ? "Stop Camera" : "Start Scanning"}
                                                </Button>
                                                {errors.scan && <p className="text-sm text-red-600">{errors.scan}</p>}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-slate-200" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-white px-2 text-slate-400">Or select manually</span>
                                            </div>
                                        </div>

                                        {/* Manual selection */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Select Equipment</Label>
                                            <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-base">
                                                    <SelectValue placeholder="Choose equipment from list..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableEquipment
                                                        .filter((eq) => eq.available)
                                                        .map((eq) => (
                                                            <SelectItem key={eq.id} value={eq.id}>
                                                                <span className="font-medium mr-2">{eq.name}</span>
                                                                <span className="text-slate-400 text-xs">({eq.id})</span>
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.equipmentId && <p className="text-sm text-red-600">{errors.equipmentId}</p>}
                                        </div>
                                    </div>

                                    {/* Right Column: Condition Photos */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-lg font-bold text-[#0b1d3a]">Condition Photos</Label>
                                            <p className="text-slate-500 text-sm">
                                                Please take photos of the equipment from multiple angles to document its current condition.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Front View */}
                                            <label className="relative h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 hover:bg-slate-50 hover:border-[#126dd5]/50 transition-all group cursor-pointer overflow-hidden">
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
                                                        <div className="mb-3 p-3 rounded-full bg-white shadow-sm text-slate-400 group-hover:text-[#126dd5] transition-colors">
                                                            <Camera className="h-6 w-6" />
                                                        </div>
                                                        <span className="font-semibold text-[#0b1d3a] mb-1">Front View</span>
                                                        <span className="text-xs text-slate-400">Click to capture photo</span>
                                                    </>
                                                )}
                                            </label>

                                            {/* Back View */}
                                            <label className="relative h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 hover:bg-slate-50 hover:border-[#126dd5]/50 transition-all group cursor-pointer overflow-hidden">
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
                                                        <div className="mb-3 p-3 rounded-full bg-white shadow-sm text-slate-400 group-hover:text-[#126dd5] transition-colors">
                                                            <Camera className="h-6 w-6" />
                                                        </div>
                                                        <span className="font-semibold text-[#0b1d3a] mb-1">Back View</span>
                                                        <span className="text-xs text-slate-400">Click to capture photo</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Borrow Step 2: Details */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Purpose</Label>
                                        <Textarea
                                            value={formData.purpose}
                                            onChange={(e) => handleInputChange("purpose", e.target.value)}
                                            placeholder="Please describe why you need this equipment..."
                                            className="min-h-[150px] rounded-xl border-slate-200 focus:border-[#126dd5] focus:ring-[#126dd5] resize-none text-base"
                                        />
                                        {errors.purpose && <p className="text-sm text-red-600">{errors.purpose}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Borrow Step 3: Class Info */}
                            {step === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Course Code</Label>
                                        <Input
                                            value={formData.course}
                                            onChange={(e) => handleInputChange("course", e.target.value)}
                                            placeholder="e.g. CS101"
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                        {errors.course && <p className="text-sm text-red-600">{errors.course}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Lecture/Section</Label>
                                        <Input
                                            value={formData.lecture}
                                            onChange={(e) => handleInputChange("lecture", e.target.value)}
                                            placeholder="e.g. Section A"
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                        {errors.lecture && <p className="text-sm text-red-600">{errors.lecture}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Classroom</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            placeholder="e.g. Room 304"
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Session Time</Label>
                                        <Input
                                            type="datetime-local"
                                            min={minDateTimeStr}
                                            max={maxDateTimeStr}
                                            value={formData.sessionDateTime}
                                            onChange={(e) => handleInputChange("sessionDateTime", e.target.value)}
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                        {errors.sessionDateTime && <p className="text-sm text-red-600">{errors.sessionDateTime}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============ RESERVE FLOW STEPS ============ */}
                    {flowType === "reserve" && (
                        <>
                            {/* Reserve Step 1: Browse */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by name or ID..."
                                                className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredEquipment.map((eq) => (
                                            <div
                                                key={eq.id}
                                                onClick={() => eq.available && selectEquipment(eq)}
                                                className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.equipmentId === eq.id
                                                    ? "border-[#126dd5] bg-[#126dd5]/5"
                                                    : eq.available
                                                        ? "border-slate-100 hover:border-[#126dd5]/50 hover:shadow-sm"
                                                        : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-[#0b1d3a] group-hover:text-[#126dd5] transition-colors">{eq.name}</h4>
                                                        <p className="text-xs text-slate-500 mb-2">{eq.id}</p>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${eq.available ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                                                            }`}>
                                                            {eq.available ? "Available" : "Unavailable"}
                                                        </span>
                                                    </div>
                                                    {formData.equipmentId === eq.id && (
                                                        <div className="h-6 w-6 bg-[#126dd5] rounded-full flex items-center justify-center text-white">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.equipmentId && <p className="text-sm text-red-600 font-medium">Please select an equipment to proceed.</p>}
                                </div>
                            )}

                            {/* Reserve Step 2: Date/Time */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Select Date</Label>
                                        <Input
                                            type="date"
                                            min={today}
                                            max={maxReservationDateStr}
                                            value={formData.reservationDate}
                                            onChange={(e) => handleInputChange("reservationDate", e.target.value)}
                                            className="h-11 rounded-xl border-slate-200"
                                        />
                                        {errors.reservationDate && <p className="text-sm text-red-600">{errors.reservationDate}</p>}
                                    </div>

                                    {formData.reservationDate && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Select Time Slot</Label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                {timeSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        onClick={() => slot.available && handleInputChange("reservationTime", slot.time)}
                                                        disabled={!slot.available}
                                                        className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${formData.reservationTime === slot.time
                                                            ? "bg-[#126dd5] text-white shadow-md shadow-blue-500/20"
                                                            : slot.available
                                                                ? "bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                                                                : "bg-slate-100 text-slate-300 cursor-not-allowed line-through"
                                                            }`}
                                                    >
                                                        {slot.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.reservationTime && <p className="text-sm text-red-600">{errors.reservationTime}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reserve Step 3: Details */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Course Code</Label>
                                            <Input
                                                value={formData.course}
                                                onChange={(e) => handleInputChange("course", e.target.value)}
                                                placeholder="e.g. CS101"
                                                className="h-11 rounded-xl border-slate-200"
                                            />
                                            {errors.course && <p className="text-sm text-red-600">{errors.course}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Lecture/Section</Label>
                                            <Input
                                                value={formData.lecture}
                                                onChange={(e) => handleInputChange("lecture", e.target.value)}
                                                placeholder="e.g. Section A"
                                                className="h-11 rounded-xl border-slate-200"
                                            />
                                            {errors.lecture && <p className="text-sm text-red-600">{errors.lecture}</p>}
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Classroom</Label>
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                placeholder="e.g. Room 304"
                                                className="h-11 rounded-xl border-slate-200"
                                            />
                                            {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#0b1d3a]">Purpose</Label>
                                        <Textarea
                                            value={formData.purpose}
                                            onChange={(e) => handleInputChange("purpose", e.target.value)}
                                            placeholder="Why do you need this equipment?"
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-[#126dd5] focus:ring-[#126dd5] resize-none"
                                        />
                                        {errors.purpose && <p className="text-sm text-red-600">{errors.purpose}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============ SHARED REVIEW STEP (Step 4) ============ */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-[#126dd5]">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Equipment</p>
                                        <h3 className="text-lg font-bold text-[#0b1d3a]">{equipment?.name || formData.equipmentId}</h3>
                                        <p className="text-xs text-slate-400">ID: {equipment?.id}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Date & Time</p>
                                        <p className="font-semibold text-[#0b1d3a]">
                                            {flowType === "reserve"
                                                ? `${formData.reservationDate} at ${formData.reservationTime}`
                                                : new Date(formData.sessionDateTime).toLocaleString()
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Classroom</p>
                                        <p className="font-semibold text-[#0b1d3a]">{formData.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Course</p>
                                        <p className="font-semibold text-[#0b1d3a]">{formData.course} ({formData.lecture})</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200/50">
                                    <p className="text-xs text-slate-500 mb-1">Purpose</p>
                                    <p className="text-sm text-[#0b1d3a] leading-relaxed">{formData.purpose}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-[#0b1d3a]">Additional Notes (Optional)</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    placeholder="Any other details..."
                                    className="min-h-[80px] rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/student/dashboard")}
                    className="text-slate-400 hover:text-slate-600"
                >
                    Cancel
                </Button>

                <Button
                    onClick={step < 4 ? () => setStep(s => s + 1) : handleSubmit}
                    className="h-12 px-8 rounded-xl bg-[#0b1d3a] hover:bg-[#126dd5] text-white font-semibold shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
                >
                    {step < 4 ? "Continue" : "Confirm Request"}
                </Button>
            </div>
        </div>
    );
}

BorrowRequestForm.propTypes = {
    onSuccess: PropTypes.func,
};
