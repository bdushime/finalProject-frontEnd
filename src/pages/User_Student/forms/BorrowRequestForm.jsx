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
import { format, endOfWeek, isBefore, startOfDay, startOfWeek } from "date-fns";
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
    Clock,
    AlertTriangle,
    Calendar as CalendarIcon,
    ChevronRight,
    X
} from "lucide-react";
import api from "@/utils/api";
import PropTypes from "prop-types";
import EquipmentScanAndPhotoUpload from "@/components/EquipmentScanAndPhotoUpload";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function BorrowRequestForm({ onSuccess }) {
    const { t } = useTranslation('student');
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
    const [classroomList, setClassroomList] = useState([]);
    const [equipment, setEquipment] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        equipmentId: equipmentIdParam || "",
        course: "",
        courseName: "",
        lecturer: "",
        purpose: "",
        location: "",
        sessionDateTime: "",
        reservationDate: "",
        reservationTime: "",
        notes: "",
    });

    // UI States
    const [isScanning, setIsScanning] = useState(scanMode);
    const [scanError, setScanError] = useState(null);
    const [conditionPhotos, setConditionPhotos] = useState({ front: null, back: null });
    const [timeSlots, setTimeSlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [statusModal, setStatusModal] = useState(null);

    // Exception State
    const [isException, setIsException] = useState(false);
    const [showScreenWarning, setShowScreenWarning] = useState(false);

    // --- NEW: Modal State for Date & Time Pickers ---
    const [showDateModal, setShowDateModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // --- 1. INITIAL DATA FETCHING ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const eqRes = await api.get('/equipment');
                const availableItems = eqRes.data.filter(item => item.status === 'Available');
                setEquipmentList(availableItems);

                try {
                    const roomRes = await api.get('/classrooms');
                    setClassroomList(roomRes.data);
                } catch (roomErr) {
                    console.warn("Could not load classrooms (Permission issue?)", roomErr);
                    const { getClassrooms } = await import("@/utils/classroomStorage");
                    setClassroomList(getClassrooms());
                }

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

    // --- NEW: Date Selection Handler ---
    const handleDateSelect = (day) => {
        const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        const dateStr = format(selected, "yyyy-MM-dd");
        handleInputChange("reservationDate", dateStr);
        setShowDateModal(false);
    };

    // --- NEW: Time Selection Handler ---
    const handleTimeSelect = (time) => {
        handleInputChange("reservationTime", time);
        setShowTimeModal(false);
    };

    // --- REAL-TIME EXCEPTION CHECK ---
    useEffect(() => {
        if (step === 2 && equipment && formData.location) {
            const checkException = () => {
                // Safely convert the entire equipment object to a lowercase string
                // This catches nested category names like { category: { name: 'Projector' } }
                const equipString = JSON.stringify(equipment).toLowerCase();
                const isProjector = equipString.includes('projector') ||
                    equipString.includes('projecteur') ||
                    equipString.includes('powerlite') ||
                    equipString.includes('epson');

                console.log("[DEBUG] isProjector:", isProjector, "equipment:", equipment);

                if (!isProjector) {
                    setIsException(false);
                    return;
                }

                // Strip common prefixes like 'room', 'salle', and all spaces to match "Room 312" with "312"
                const normalize = (str) => str?.toLowerCase().replace(/(room|salle|-|_|\s+)/g, '') || '';
                const inputLoc = normalize(formData.location);

                let foundRoom = null;
                // Only match if they have typed something meaningful beyond 'room'
                if (inputLoc.length > 0) {
                    foundRoom = classroomList.find(c => {
                        const dbRoom = normalize(c.name);
                        return dbRoom === inputLoc; // MUST BE EXACT MATCH now
                    });
                }

                if (foundRoom && foundRoom.hasScreen) {
                    setIsException(true);
                } else {
                    setIsException(false);
                }
            };

            const timer = setTimeout(checkException, 300);
            return () => clearTimeout(timer);
        }
    }, [formData.location, equipment, step, classroomList]);

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};

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
                    const now = startOfDay(new Date());
                    const resDate = startOfDay(new Date(formData.reservationDate));
                    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 });
                    const endOfAllowedDays = new Date(startOfCurrentWeek);
                    endOfAllowedDays.setDate(endOfAllowedDays.getDate() + 5); // Friday
                    if (isBefore(resDate, now) || resDate > endOfAllowedDays || resDate.getDay() === 6) {
                        newErrors.reservationDate = "Reservations are only allowed from Sunday to Friday of the current week.";
                    }
                }
                if (!formData.reservationTime) newErrors.reservationTime = "Time is required";
                if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (!validateForm()) return;

        // Intercept step 2 -> 3 if borrowing and there's a screen exception
        if (step === 2 && flowType === 'borrow' && isException) {
            setShowScreenWarning(true);
            return;
        }

        setStep(step + 1);
    };

    // --- 5. SUBMIT HANDLER ---
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            const payload = {
                equipmentId: formData.equipmentId,
                purpose: isException ? `[EXCEPTION: Projector in Screen Room] ${formData.purpose}` : formData.purpose,
                destination: `${formData.location} (${formData.course} - ${formData.courseName}, Lecturer: ${formData.lecturer})`,
            };

            if (flowType === 'borrow') {
                payload.expectedReturnTime = formData.sessionDateTime;
                const res = await api.post('/transactions/checkout', payload);

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
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // --- 6. CALENDAR HELPER (for modal) ---
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const renderCalendarDays = () => {
        const today = startOfDay(new Date());
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
        const endOfAllowedDays = new Date(startOfCurrentWeek);
        endOfAllowedDays.setDate(endOfAllowedDays.getDate() + 5);

        const daysInMonth = getDaysInMonth(calendarMonth);
        const firstDay = getFirstDayOfMonth(calendarMonth);
        const cells = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d);
            const dateStr = format(date, "yyyy-MM-dd");
            const isPast = isBefore(date, today);
            const isFuture = date > endOfAllowedDays;
            const isDisabled = isPast || isFuture || date.getDay() === 6;
            const isSelected = formData.reservationDate === dateStr;

            cells.push(
                <button
                    key={d}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDateSelect(d)}
                    className={cn(
                        "aspect-square rounded-lg text-xs font-bold transition-all",
                        isDisabled && "text-slate-400 bg-slate-50 cursor-not-allowed",
                        !isDisabled && !isSelected && "text-slate-800 bg-slate-50 hover:bg-blue-100 hover:text-[#126dd5] cursor-pointer",
                        isSelected && "bg-[#126dd5] text-white shadow-md shadow-blue-200 scale-110"
                    )}
                >
                    {d}
                </button>
            );
        }

        return cells;
    };

    // --- RENDER HELPERS ---
    const currentSteps = flowType === "borrow"
        ? [
            { label: t("equipment.stepIdentification", "Identification"), icon: Scan },
            { label: t("equipment.stepDetails", "Details"), icon: ClipboardList },
            { label: t("equipment.stepReview", "Review"), icon: CheckCircle2 }
        ]
        : [
            { label: t("equipment.stepSelectItem", "Select Item"), icon: Package },
            { label: t("equipment.stepReservation", "Reservation"), icon: CalendarClock }
        ];

    // --- RENDER: CHOICE SCREEN ---
    if (!flowType) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button onClick={() => setFlowType("borrow")} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#126dd5] hover:shadow-xl transition-all text-left">
                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 text-[#126dd5] inline-block">
                            <Scan className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2">{t('equipment.borrowNow', 'Borrow Now')}</h3>
                        <p className="text-slate-500 mb-6">{t('equipment.borrowNowDesc', 'For immediate pickup. Scan QR or select from list.')}</p>
                        <div className="text-[#126dd5] font-semibold flex items-center group-hover:gap-2 transition-all">
                            {t('equipment.borrowNow', 'Start Borrowing')} <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </button>

                    <button onClick={() => setFlowType("reserve")} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all text-left">
                        <div className="mb-6 p-4 rounded-2xl bg-purple-50 text-purple-600 inline-block">
                            <CalendarClock className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2">{t('equipment.reserveLater', 'Reserve for Later')}</h3>
                        <p className="text-slate-500 mb-6">{t('equipment.reserveLaterDesc', 'Schedule equipment for a future class or event.')}</p>
                        <div className="text-purple-600 font-semibold flex items-center group-hover:gap-2 transition-all">
                            {t('equipment.stepReservation', 'Make Reservation')} <ArrowRight className="ml-2 h-4 w-4" />
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
                    {t('equipment.stepTracker', 'Step')} {step} / {totalSteps}
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
                                equipment={equipment}
                                scanError={scanError}
                                onReset={() => {
                                    setScanError(null);
                                    setEquipment(null);
                                }}
                                onScan={(result) => {
                                    const found = equipmentList.find(e =>
                                        e.serialNumber === result ||
                                        e._id === result
                                    );
                                    if (found) {
                                        setScanError(null);
                                        handleEquipmentSelect(found._id);
                                    } else {
                                        setScanError("Invalid QR Code. This item is not registered in the system.");
                                        setEquipment(null);
                                    }
                                }}
                                onPhotosChange={setConditionPhotos}
                            />

                            <div className="pt-4 border-t border-slate-100">
                                <Label className="text-slate-500 mb-2 block">{t('equipment.selectManually', 'Or select equipment manually')}</Label>
                                <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                    <SelectTrigger className="h-12 bg-white text-[#0b1d3a] font-medium">
                                        <SelectValue placeholder={t('equipment.chooseItem', 'Choose item...')} />
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
                            <Label className="text-[#0b1d3a] font-semibold">{t('equipment.selectToReserve', 'Select Equipment to Reserve')}</Label>
                            <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                <SelectTrigger className="h-12 bg-white text-[#0b1d3a] font-medium">
                                    <SelectValue placeholder={t('equipment.chooseItem', 'Choose item...')} />
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
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.courseCode', 'Course Code')}</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.course} onChange={(e) => handleInputChange("course", e.target.value)} placeholder="e.g. CS101" />
                            {errors.course && <p className="text-xs text-rose-500 font-bold px-1">{errors.course}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.courseName', 'Course Name')}</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.courseName} onChange={(e) => handleInputChange("courseName", e.target.value)} placeholder="e.g. Introduction to Programming" />
                            {errors.courseName && <p className="text-xs text-rose-500 font-bold px-1">{errors.courseName}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.lecturer', 'Lecturer Name')}</Label>
                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.lecturer} onChange={(e) => handleInputChange("lecturer", e.target.value)} placeholder="Dr. John Doe" />
                            {errors.lecturer && <p className="text-xs text-rose-500 font-bold px-1">{errors.lecturer}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.roomLocation', 'Room / Location')}</Label>
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
                                        {t('equipment.exceptionAlert', 'This room already has a screen. IT approval required.')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consolidated Purpose / Justification Field */}
                    <div className="space-y-2 animate-in fade-in">
                        <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                            {isException ? t('equipment.exceptionReasonLabel', "Justification for Projector") : t('equipment.reason', "Reason for Borrowing")}
                        </Label>
                        <div className="p-0.5 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm ring-1 ring-slate-200 overflow-hidden focus-within:ring-[#126dd5] transition-all">
                            <Textarea
                                value={formData.purpose}
                                onChange={(e) => handleInputChange("purpose", e.target.value)}
                                placeholder={isException ? t('equipment.exceptionReasonPlaceholder', "Explain why a projector is needed here despite the room having a screen...") : t('equipment.reasonPlaceholder', "Briefly describe what you will use this equipment for...")}
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
                                        <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] px-1">{t('equipment.quickDurationPreset', 'Quick Duration Preset')}</Label>
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
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1">{t('equipment.expectedReturn', 'Expected Return')}</span>
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
                        <div className="space-y-4">
                            {/* NEW: Compact Date & Time Picker Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div>
                                        <h4 className="text-base font-black text-[#0b1d3a]">{t('equipment.reservationScheduler', 'Reservation Scheduler')}</h4>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{t('equipment.chooseDateAndTime', 'Choose date & pickup time')}</p>
                                    </div>
                                </div>

                                {/* Date & Time Input Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date Picker Input */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{t('equipment.pickDate', 'Pick a Date')}</Label>
                                        <Popover open={showDateModal} onOpenChange={setShowDateModal}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#126dd5] focus:border-transparent transition"
                                                >
                                                    <span className="text-[#0b1d3a] font-semibold">
                                                        {formData.reservationDate ? format(new Date(formData.reservationDate), 'MMM d, yyyy') : t('equipment.stepReservation', 'Select date')}
                                                    </span>
                                                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-4 rounded-2xl shadow-xl border-slate-100 bg-white" align="start">
                                                {/* Calendar Navigation */}
                                                <div className="flex flex-col space-y-4">
                                                    <div className="flex items-center justify-center w-full pb-2">
                                                        <h4 className="text-sm font-bold text-[#0b1d3a] text-center w-full">
                                                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </h4>
                                                    </div>

                                                    {/* Calendar Grid */}
                                                    <div className="w-[240px]">
                                                        {/* Weekday Headers */}
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                                                                <div key={day} className="text-center text-[10px] font-bold text-slate-500 py-1">
                                                                    {day}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Calendar Days */}
                                                        <div className="grid grid-cols-7 gap-1 mt-1">
                                                            {renderCalendarDays()}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDateModal(false)}
                                                        className="w-full mt-2 text-xs text-slate-500 font-bold hover:text-[#0b1d3a] text-center py-2"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.reservationDate && <p className="text-xs text-rose-500 font-bold">{errors.reservationDate}</p>}
                                    </div>

                                    {/* Time Picker Input */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{t('equipment.pickTime', 'Pick Up Time')}</Label>
                                        <Popover open={showTimeModal} onOpenChange={setShowTimeModal}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#126dd5] focus:border-transparent transition"
                                                >
                                                    <span className="text-[#0b1d3a] font-semibold">
                                                        {formData.reservationTime ? formData.reservationTime : t('equipment.selectTime', 'Select time')}
                                                    </span>
                                                    <Clock className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[180px] p-2 rounded-xl shadow-xl border-slate-100 bg-white" align="start">
                                                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                                                    {[
                                                        { time: "08:00", label: "8:00 AM" },
                                                        { time: "09:00", label: "9:00 AM" },
                                                        { time: "10:00", label: "10:00 AM" },
                                                        { time: "11:00", label: "11:00 AM" },
                                                        { time: "12:00", label: "12:00 PM" },
                                                        { time: "13:00", label: "1:00 PM" },
                                                        { time: "14:00", label: "2:00 PM" },
                                                        { time: "15:00", label: "3:00 PM" },
                                                        { time: "16:00", label: "4:00 PM" },
                                                        { time: "17:00", label: "5:00 PM" },
                                                        { time: "18:00", label: "6:00 PM" },
                                                    ].map(slot => {
                                                        const isSelected = formData.reservationTime === slot.time;
                                                        return (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                onClick={() => handleTimeSelect(slot.time)}
                                                                className={cn(
                                                                    "py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center border",
                                                                    isSelected
                                                                        ? "bg-[#126dd5] border-[#126dd5] text-white shadow-md shadow-blue-200"
                                                                        : "bg-white border-transparent text-[#0b1d3a] hover:bg-slate-100"
                                                                )}
                                                            >
                                                                {slot.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.reservationTime && <p className="text-xs text-rose-500 font-bold">{errors.reservationTime}</p>}
                                    </div>
                                </div>
                            </div>

                            {!isException && (
                                <div className="flex items-center gap-2 px-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <p className="text-[10px] text-slate-400 font-semibold italic">Reservations are limited to the current academic week (Sun–Fri).</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: FINAL REVIEW */}
            {step === 3 && flowType === 'borrow' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-[#0b1d3a]">{t('equipment.reviewRequest', 'Review Your Request')}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('equipment.reviewDesc', 'Please verify the details below before submitting.')}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Student Info Bar */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#126dd5] flex items-center justify-center text-white font-bold">
                                    {studentName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('equipment.studentInfo', 'Student Information')}</p>
                                    <p className="text-[#0b1d3a] font-semibold text-sm">{studentName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('equipment.dateAndTime', 'Date & Time')}</p>
                                <p className="text-[#0b1d3a] font-semibold text-sm">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.equipmentIdLabel', 'Equipment Identification')}</label>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 h-[120px]">
                                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Package className="w-7 h-7 text-[#126dd5]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#0b1d3a] font-bold text-lg leading-tight">{equipment?.name || "Ref: " + formData.equipmentId}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 font-semibold">{t('equipment.serialNumber', 'Serial')}:</span>
                                                <code className="text-[#126dd5] font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{equipment?.serialNumber || "#SCAN_TAG"}</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.destinationAndCourse', 'Destination & Course')}</label>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('equipment.courseCode', 'Course')}</span>
                                            <span className="text-[#0b1d3a] font-semibold text-sm tracking-tight">{formData.course} - {formData.courseName}</span>
                                        </div>
                                        <div className="h-px bg-slate-100" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('equipment.lecturer', 'Lecturer Name')}</span>
                                            <span className="text-[#0b1d3a] font-semibold text-sm">{formData.lecturer || "Not Specified"}</span>
                                        </div>
                                        <div className="h-px bg-slate-100" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('equipment.roomLocation', 'Classroom')}</span>
                                            <span className="text-[#0b1d3a] font-semibold text-sm">{formData.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.timingSummary', 'Timing Summary')}</label>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center gap-3 h-[120px]">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-[8px] font-bold uppercase tracking-widest leading-none">{t('equipment.startTime', 'Start')}</span>
                                                    <span className="text-[#0b1d3a] font-bold text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="w-8 h-px bg-slate-200" />
                                                <div className="flex flex-col">
                                                    <span className="text-[#126dd5] text-[8px] font-bold uppercase tracking-widest leading-none">{t('equipment.returnBy', 'Return By')}</span>
                                                    <span className="text-[#0b1d3a] font-bold text-sm">{formData.sessionDateTime ? new Date(formData.sessionDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#126dd5] text-white px-3 py-1.5 rounded-lg font-semibold text-[10px] shadow-sm shadow-blue-100">
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
                                        <div className="h-px bg-slate-100 mx-2" />
                                        <div className="flex items-center gap-2 px-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-500 font-semibold text-[10px] uppercase">{t('equipment.sessionDuration', 'Session Duration')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">{t('equipment.proofOfCondition', 'Proof of Condition')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['front', 'back'].map(side => (
                                            <div key={side} className="aspect-video rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative group">
                                                {conditionPhotos[side] ? (
                                                    <img src={conditionPhotos[side]} alt={side} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                        <Camera className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-semibold uppercase">{side === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            <div className="mt-8 flex justify-end gap-4">
                {step > 1 && (
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="h-12 px-6 rounded-xl border-slate-200 text-[#0b1d3a] font-bold"
                    >
                        {t('equipment.backBtn', 'Back')}
                    </Button>
                )}

                {step < totalSteps ? (
                    <Button
                        onClick={handleNextStep}
                        className="bg-[#0b1d3a] hover:bg-[#1a3b6e] h-12 px-8 rounded-xl font-black shadow-lg shadow-slate-200 flex items-center gap-2 text-white"
                    >
                        {step === 2 ? t('equipment.reviewDetailsBtn', 'Review Details') : t('equipment.nextStep', 'Next Step')} <ArrowRight className="w-4 h-4" />
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
                                <span>{t('equipment.submitting', 'Submitting Request...')}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isException ? t('equipment.submitRequest', 'Confirm for Approval') : t('equipment.finalizeAndBorrow', 'Finalize & Borrow')}</span>
                            </>
                        )}
                    </Button>
                )}
                {/* Status Dialog Modal */}
                <Dialog open={!!statusModal} onOpenChange={(open) => {
                    if (!open) navigate("/student/borrowed-items");
                }}>
                    <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-xl rounded-3xl p-6 outline-none">
                        <DialogHeader className="flex flex-col items-center text-center">
                            <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${statusModal?.type === 'success' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {statusModal?.type === 'success' ? (
                                    <CheckCircle2 className="h-7 w-7" />
                                ) : (
                                    <Clock className="h-7 w-7" />
                                )}
                            </div>
                            <DialogTitle className="text-xl font-bold text-[#0b1d3a]">
                                {statusModal?.type === 'success' ? t('equipment.statusConfirmed', 'Confirmed!') : t('equipment.statusUnderReview', 'Under Review')}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-2 text-center w-full">
                                {statusModal?.message}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex sm:justify-center mt-6 w-full">
                            <Button
                                onClick={() => navigate("/student/borrowed-items")}
                                className="flex-1 w-full rounded-xl h-11 font-bold shadow-lg transition-all bg-[#0b1d3a] hover:bg-[#126dd5] text-white shadow-blue-900/10"
                            >
                                {t('equipment.trackMyItems', 'Track My Items')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Exception Warning Modal */}
                <ConfirmationModal
                    isOpen={showScreenWarning}
                    onClose={() => setShowScreenWarning(false)}
                    onConfirm={() => {
                        setShowScreenWarning(false);
                        setStep(step + 1);
                    }}
                    title={t('equipment.screenWarningTitle', 'Screen Already Available')}
                    description={t('equipment.screenWarningDesc', 'The room you selected already has a screen installed. Are you sure you still need to borrow a projector?')}
                    confirmText={t('equipment.proceedAnyway', 'Proceed Anyway')}
                    cancelText={t('equipment.cancelBtn', 'Cancel')}
                    variant="destructive"
                />
            </div>

        </div>
    )
}

BorrowRequestForm.propTypes = { onSuccess: PropTypes.func };