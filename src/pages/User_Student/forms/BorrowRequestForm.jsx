import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "lucide-react";
import { equipmentData, getEquipmentById } from "@/components/lib/equipmentData";
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
            <div className="space-y-6">
                <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.35)]">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-[#0b1d3a]">
                            What would you like to do?
                        </CardTitle>
                        <p className="text-slate-600">Choose an option to get started</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Borrow Now Option */}
                            <button
                                onClick={() => setFlowType("borrow")}
                                className="group relative p-6 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-[#0b69d4] hover:shadow-[0_12px_28px_-12px_rgba(11,105,212,0.25)] transition-all duration-300 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b69d4] to-[#0f7de5] flex items-center justify-center shadow-lg shadow-sky-200/50 group-hover:scale-110 transition-transform">
                                        <Scan className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#0b1d3a] mb-1">Borrow Now</h3>
                                        <p className="text-sm text-slate-600 mb-3">
                                            I'm at the equipment location and ready to pick up
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="bg-sky-50 text-sky-700 border-sky-100 rounded-full text-xs">
                                                Scan QR
                                            </Badge>
                                            <Badge className="bg-sky-50 text-sky-700 border-sky-100 rounded-full text-xs">
                                                Instant pickup
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-[#0b69d4] group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* Reserve for Later Option */}
                            <button
                                onClick={() => setFlowType("reserve")}
                                className="group relative p-6 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-[#0b69d4] hover:shadow-[0_12px_28px_-12px_rgba(11,105,212,0.25)] transition-all duration-300 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0b69d4] to-[#0f7de5] flex items-center justify-center shadow-lg shadow-sky-200/50 group-hover:scale-110 transition-transform">
                                        <CalendarClock className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#0b1d3a] mb-1">Reserve for Later</h3>
                                        <p className="text-sm text-slate-600 mb-3">
                                            I want to schedule equipment for a future date
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="bg-sky-50 text-sky-700 border-sky-100 rounded-full text-xs">
                                                Browse available
                                            </Badge>
                                            <Badge className="bg-sky-50 text-sky-700 border-sky-100 rounded-full text-xs">
                                                Pick time slot
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-[#0b69d4] group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/student/equipment")}
                        className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    // ============ WIZARD FLOW ============
    return (
        <div className="space-y-6">
            {/* Back to choice + Step Indicators */}
            <div className="space-y-4">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentSteps.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === idx + 1;
                        const isCompleted = step > idx + 1;

                        return (
                            <button
                                key={s.label}
                                type="button"
                                onClick={() => setStep(idx + 1)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                                    isActive
                                        ? "border-[#0b69d4] bg-sky-50 shadow-[0_12px_28px_-22px_rgba(8,47,73,0.3)]"
                                        : isCompleted
                                        ? "border-emerald-200 bg-emerald-50/50"
                                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50"
                                }`}
                            >
                                <div
                                    className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                                        isActive
                                            ? "bg-[#0b69d4] text-white"
                                            : isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                                </div>
                                <div className="text-left min-w-0">
                                    <p
                                        className={`text-sm font-semibold truncate ${
                                            isActive
                                                ? "text-[#0b1d3a]"
                                                : isCompleted
                                                ? "text-emerald-700"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {s.label}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate hidden sm:block">{s.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.35)]">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Badge
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                flowType === "reserve"
                                    ? "bg-sky-50 text-sky-700 border border-sky-100"
                                    : "bg-sky-50 text-sky-700 border border-sky-100"
                            }`}
                        >
                            {flowType === "reserve" ? "Reservation" : "Borrow"}
                        </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-[#0b1d3a] flex items-center gap-2 mt-2">
                        {(() => {
                            const Icon = currentSteps[step - 1].icon;
                            return <Icon className="h-5 w-5 text-[#0b69d4]" />;
                        })()}
                        {currentSteps[step - 1].label}
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        {flowType === "borrow" && step === 1 && "Scan the QR code on the equipment you want to borrow."}
                        {flowType === "borrow" && step === 2 && "Tell us why you need this equipment."}
                        {flowType === "borrow" && step === 3 && "Provide your class details and session time."}
                        {flowType === "borrow" && step === 4 && "Review all details and submit your request."}
                        {flowType === "reserve" && step === 1 && "Browse and select available equipment."}
                        {flowType === "reserve" && step === 2 && "Choose your preferred date and time slot."}
                        {flowType === "reserve" && step === 3 && "Provide your class details and purpose."}
                        {flowType === "reserve" && step === 4 && "Review all details and confirm your reservation."}
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* ============ BORROW FLOW STEPS ============ */}
                    {flowType === "borrow" && (
                        <>
                            {/* Borrow Step 1: Scan QR */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                            <QrCode className="h-5 w-5 text-slate-600" />
                                            <p className="font-semibold text-[#0b1d3a]">Scan QR Code</p>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 overflow-hidden">
                                                {isScanning ? (
                                                    <video
                                                        ref={videoRef}
                                                        className="w-full h-52 object-cover"
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                    />
                                                ) : (
                                                    <div className="h-52 flex flex-col items-center justify-center text-[#0b1d3a] space-y-2">
                                                        <QrCode className="h-10 w-10 text-slate-400" />
                                                        <p className="font-semibold">Scan Equipment QR Code</p>
                                                        <p className="text-sm text-slate-600">
                                                            Point your camera at the QR code on the equipment
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                {!isScanning ? (
                                                    <Button
                                                        type="button"
                                                        onClick={handleScanQR}
                                                        className="bg-[#0b69d4] hover:bg-[#0f7de5] text-white rounded-xl shadow-sm shadow-sky-200/60"
                                                    >
                                                        Open Camera
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsScanning(false);
                                                            stopCamera();
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                                    >
                                                        Stop Camera
                                                    </Button>
                                                )}
                                            </div>

                                            {errors.scan && <p className="text-sm text-red-600">{errors.scan}</p>}
                                        </div>
                                    </div>

                                    {/* Manual selection dropdown */}
                                    <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                            <Package className="h-5 w-5 text-slate-600" />
                                            <p className="font-semibold text-[#0b1d3a]">Or Select Manually</p>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">
                                                    Select Equipment
                                                </Label>
                                                <Select
                                                    value={formData.equipmentId}
                                                    onValueChange={handleEquipmentSelect}
                                                >
                                                    <SelectTrigger className="w-full rounded-xl border-slate-200">
                                                        <SelectValue placeholder="Choose equipment..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableEquipment
                                                            .filter((eq) => eq.available)
                                                            .map((eq) => (
                                                                <SelectItem key={eq.id} value={eq.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{eq.name}</span>
                                                                        <span className="text-xs text-slate-500">
                                                                            ({eq.id})
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.equipmentId && (
                                                    <p className="text-sm text-red-600">{errors.equipmentId}</p>
                                                )}
                                            </div>

                                            {formData.equipmentId && equipment && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                                    <Package className="h-5 w-5 text-emerald-600" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-emerald-800">
                                                            Selected: {equipment.name}
                                                        </p>
                                                        <p className="text-xs text-emerald-600">
                                                            {equipment.id} • {equipment.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Borrow Step 2: Request Details */}
                            {step === 2 && (
                                <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-slate-600" />
                                        <p className="font-semibold text-[#0b1d3a]">Request Information</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#0b1d3a]">Purpose</Label>
                                            <Textarea
                                                value={formData.purpose}
                                                onChange={(e) => handleInputChange("purpose", e.target.value)}
                                                placeholder="Why do you need this equipment? (e.g., Presentation for my final project)"
                                                className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4] min-h-[120px]"
                                            />
                                            {errors.purpose && (
                                                <p className="text-sm text-red-600">{errors.purpose}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Borrow Step 3: Session Info */}
                            {step === 3 && (
                                <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-slate-600" />
                                        <p className="font-semibold text-[#0b1d3a]">Class Information</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">Course</Label>
                                                <Input
                                                    value={formData.course}
                                                    onChange={(e) => handleInputChange("course", e.target.value)}
                                                    placeholder="e.g., CS101"
                                                    className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                />
                                                {errors.course && (
                                                    <p className="text-sm text-red-600">{errors.course}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">
                                                    Lecture / Section
                                                </Label>
                                                <Input
                                                    value={formData.lecture}
                                                    onChange={(e) => handleInputChange("lecture", e.target.value)}
                                                    placeholder="e.g., LEC A"
                                                    className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                />
                                                {errors.lecture && (
                                                    <p className="text-sm text-red-600">{errors.lecture}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">Classroom</Label>
                                                <Input
                                                    value={formData.location}
                                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                                    placeholder="e.g., Room 204"
                                                    className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                />
                                                {errors.location && (
                                                    <p className="text-sm text-red-600">{errors.location}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">
                                                    Session Date & Time
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    min={minDateTimeStr}
                                                    max={maxDateTimeStr}
                                                    value={formData.sessionDateTime}
                                                    onChange={(e) =>
                                                        handleInputChange("sessionDateTime", e.target.value)
                                                    }
                                                    className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                />
                                                {errors.sessionDateTime && (
                                                    <p className="text-sm text-red-600">{errors.sessionDateTime}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============ RESERVE FLOW STEPS ============ */}
                    {flowType === "reserve" && (
                        <>
                            {/* Reserve Step 1: Browse Equipment */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    {/* Search & Filter */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search equipment..."
                                                className="pl-10 rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {["all", "Projector", "Remote", "Audio"].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFilterType(type)}
                                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                                        filterType === type
                                                            ? "bg-[#0b69d4] text-white"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {type === "all" ? "All" : type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Equipment Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {filteredEquipment.map((eq) => (
                                            <button
                                                key={eq.id}
                                                onClick={() => eq.available && selectEquipment(eq)}
                                                disabled={!eq.available}
                                                className={`p-4 rounded-xl border text-left transition-all ${
                                                    formData.equipmentId === eq.id
                                                        ? "border-[#0b69d4] bg-sky-50 shadow-[0_8px_20px_-12px_rgba(11,105,212,0.3)]"
                                                        : eq.available
                                                        ? "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50"
                                                        : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                                formData.equipmentId === eq.id
                                                                    ? "bg-[#0b69d4] text-white"
                                                                    : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[#0b1d3a]">{eq.name}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {eq.id} • {eq.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={`rounded-full text-xs ${
                                                            eq.available
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                : "bg-red-50 text-red-700 border-red-100"
                                                        }`}
                                                    >
                                                        {eq.available ? "Available" : "Reserved"}
                                                    </Badge>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {filteredEquipment.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            No equipment found matching your search.
                                        </div>
                                    )}

                                    {errors.equipmentId && (
                                        <p className="text-sm text-red-600">{errors.equipmentId}</p>
                                    )}
                                </div>
                            )}

                            {/* Reserve Step 2: Pick Date & Time */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    {/* Selected Equipment Display */}
                                    {equipment && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 border border-sky-100">
                                            <Package className="h-5 w-5 text-[#0b69d4]" />
                                            <div>
                                                <p className="text-sm font-semibold text-[#0b1d3a]">{equipment.name}</p>
                                                <p className="text-xs text-slate-600">{equipment.id}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Date Selection */}
                                    <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-slate-600" />
                                            <p className="font-semibold text-[#0b1d3a]">Select Date</p>
                                        </div>
                                        <div className="p-4">
                                            <Input
                                                type="date"
                                                min={today}
                                                max={maxReservationDateStr}
                                                value={formData.reservationDate}
                                                onChange={(e) => handleInputChange("reservationDate", e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                            />
                                            {errors.reservationDate && (
                                                <p className="text-sm text-red-600 mt-2">{errors.reservationDate}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Time Slot Selection */}
                                    {formData.reservationDate && (
                                        <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-slate-600" />
                                                <p className="font-semibold text-[#0b1d3a]">Select Time Slot</p>
                                            </div>
                                            <div className="p-4">
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                                    {timeSlots.map((slot) => (
                                                        <button
                                                            key={slot.time}
                                                            onClick={() =>
                                                                slot.available &&
                                                                handleInputChange("reservationTime", slot.time)
                                                            }
                                                            disabled={!slot.available}
                                                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                                                formData.reservationTime === slot.time
                                                                    ? "bg-[#0b69d4] text-white shadow-sm"
                                                                    : slot.available
                                                                    ? "bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-[#0b69d4] border border-slate-200"
                                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed line-through"
                                                            }`}
                                                        >
                                                            {slot.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.reservationTime && (
                                                    <p className="text-sm text-red-600 mt-2">{errors.reservationTime}</p>
                                                )}
                                                <p className="text-xs text-slate-500 mt-3">
                                                    <span className="inline-block w-3 h-3 bg-slate-100 rounded mr-1"></span>
                                                    Unavailable slots are crossed out
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reserve Step 3: Session Info */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-slate-600" />
                                            <p className="font-semibold text-[#0b1d3a]">Class Information</p>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-[#0b1d3a]">
                                                        Course
                                                    </Label>
                                                    <Input
                                                        value={formData.course}
                                                        onChange={(e) => handleInputChange("course", e.target.value)}
                                                        placeholder="e.g., CS101"
                                                        className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                    />
                                                    {errors.course && (
                                                        <p className="text-sm text-red-600">{errors.course}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-[#0b1d3a]">
                                                        Lecture / Section
                                                    </Label>
                                                    <Input
                                                        value={formData.lecture}
                                                        onChange={(e) => handleInputChange("lecture", e.target.value)}
                                                        placeholder="e.g., LEC A"
                                                        className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                    />
                                                    {errors.lecture && (
                                                        <p className="text-sm text-red-600">{errors.lecture}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-[#0b1d3a]">Classroom</Label>
                                                <Input
                                                    value={formData.location}
                                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                                    placeholder="e.g., Room 204"
                                                    className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                                />
                                                {errors.location && (
                                                    <p className="text-sm text-red-600">{errors.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-slate-600" />
                                            <p className="font-semibold text-[#0b1d3a]">Purpose</p>
                                        </div>
                                        <div className="p-4">
                                            <Textarea
                                                value={formData.purpose}
                                                onChange={(e) => handleInputChange("purpose", e.target.value)}
                                                placeholder="Why do you need this equipment?"
                                                className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4] min-h-[100px]"
                                            />
                                            {errors.purpose && (
                                                <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============ SHARED REVIEW STEP (Step 4) ============ */}
                    {step === 4 && (
                        <div className="space-y-4">
                            {/* Review Summary */}
                            <div className="border border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 shadow-sm overflow-hidden">
                                <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-slate-100">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                    <p className="font-semibold text-[#0b1d3a]">
                                        {flowType === "reserve" ? "Reservation Summary" : "Request Summary"}
                                    </p>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Equipment */}
                                    <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                            <Package className="h-5 w-5 text-[#0b69d4]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Equipment</p>
                                            <p className="font-semibold text-[#0b1d3a]">
                                                {equipment?.name || formData.equipmentId || "—"}
                                            </p>
                                            {equipment && <p className="text-xs text-slate-500">ID: {equipment.id}</p>}
                                        </div>
                                        <Badge
                                            className="ml-auto rounded-full px-3 py-1 text-xs font-semibold shrink-0 bg-sky-50 text-sky-700 border border-sky-100"
                                        >
                                            {flowType === "reserve" ? "Reservation" : "Borrow"}
                                        </Badge>
                                    </div>

                                    {/* Purpose */}
                                    <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                            <ClipboardList className="h-5 w-5 text-[#0b69d4]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Purpose</p>
                                            <p className="font-semibold text-[#0b1d3a]">{formData.purpose || "—"}</p>
                                        </div>
                                    </div>

                                    {/* Session Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                <BookOpen className="h-5 w-5 text-[#0b69d4]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Course & Section</p>
                                                <p className="font-semibold text-[#0b1d3a]">
                                                    {formData.course || "—"} — {formData.lecture || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                <MapPin className="h-5 w-5 text-[#0b69d4]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Classroom</p>
                                                <p className="font-semibold text-[#0b1d3a]">
                                                    {formData.location || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 sm:col-span-2">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                <Calendar className="h-5 w-5 text-[#0b69d4]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    {flowType === "reserve" ? "Reserved Date & Time" : "Session Date & Time"}
                                                </p>
                                                <p className="font-semibold text-[#0b1d3a]">
                                                    {flowType === "reserve"
                                                        ? formData.reservationDate && formData.reservationTime
                                                            ? `${new Date(formData.reservationDate).toLocaleDateString(undefined, {
                                                                  weekday: "long",
                                                                  year: "numeric",
                                                                  month: "long",
                                                                  day: "numeric",
                                                              })} at ${
                                                                  timeSlots.find((s) => s.time === formData.reservationTime)
                                                                      ?.label || formData.reservationTime
                                                              }`
                                                            : "—"
                                                        : formData.sessionDateTime
                                                        ? new Date(formData.sessionDateTime).toLocaleString(undefined, {
                                                              weekday: "long",
                                                              year: "numeric",
                                                              month: "long",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          })
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                    <p className="font-semibold text-[#0b1d3a]">Additional Notes</p>
                                    <span className="text-xs text-slate-400">(Optional)</span>
                                </div>
                                <div className="p-4">
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Any additional information for the staff..."
                                        className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-[#0b69d4]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-end">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/student/equipment")}
                        className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                    >
                        Cancel
                    </Button>
                    {step < 4 ? (
                        <Button
                            onClick={() => setStep((s) => Math.min(4, s + 1))}
                            className="rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-semibold shadow-sm shadow-sky-200/60"
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            className="rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-semibold shadow-sm shadow-sky-200/60"
                        >
                            {flowType === "reserve" ? "Confirm Reservation" : "Submit Request"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

BorrowRequestForm.propTypes = {
    onSuccess: PropTypes.func,
};
