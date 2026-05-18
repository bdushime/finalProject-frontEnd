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
import QRScanner from "@/components/common/QRScanner";
import { toast } from "sonner";
import Loader from "@/components/common/Loader";
import { getPackageId, normalizePackages } from "@/pages/User_Student/data/packageUtils";
import { Checkbox } from "@/components/ui/checkbox";

export default function BorrowRequestForm({ initialEquipmentId = null, onSuccess }) {
    const { t } = useTranslation('student');
    const { user } = useAuth();
    const studentName = user?.fullName || user?.username || "Student";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentIdParam = searchParams.get("equipmentId");
    const packageIdParam = searchParams.get("packageId");
    const itemsParam = searchParams.get("items");
    const actionParam = searchParams.get("action");
    const scanMode = searchParams.get("scan") === "true";

    const videoRef = useRef(null);

    // --- STATE ---
    const [flowType, setFlowType] = useState(
        actionParam || (equipmentIdParam || packageIdParam ? "borrow" : null)
    );
    const [bookingType, setBookingType] = useState(
        packageIdParam ? "package" : "equipment"
    );
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPackageItems, setSelectedPackageItems] = useState([]);
    const [step, setStep] = useState(1);
    const totalSteps = 2;

    // Data States
    const [equipmentList, setEquipmentList] = useState([]);
    const [classroomList, setClassroomList] = useState([]);
    const [equipment, setEquipment] = useState(null);
    const [packages, setPackages] = useState([]);
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesLoadError, setCoursesLoadError] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        equipmentId: equipmentIdParam || "",
        packageId: packageIdParam || "",
        courseId: "",
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
    // Per-device photos for package bookings: { [deviceId]: { front, back } }
    const [packageDevicePhotos, setPackageDevicePhotos] = useState({});
    // Stable per-device onPhotosChange callbacks — created once per deviceId
    // so EquipmentScanAndPhotoUpload's effect doesn't re-fire each render.
    const devicePhotoCallbacksRef = useRef({});
    const getDevicePhotoCallback = (deviceId) => {
        if (!devicePhotoCallbacksRef.current[deviceId]) {
            devicePhotoCallbacksRef.current[deviceId] = (photos) =>
                setPackageDevicePhotos((prev) => ({ ...prev, [deviceId]: photos }));
        }
        return devicePhotoCallbacksRef.current[deviceId];
    };
    const [timeSlots, setTimeSlots] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [statusModal, setStatusModal] = useState(null);

    // Exception State
    const [isException, setIsException] = useState(false);
    const [showScreenWarning, setShowScreenWarning] = useState(false);

    // Modal State for Date & Time Pickers
    const [showDateModal, setShowDateModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // --- 1. INITIAL DATA FETCHING ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const eqRes = await api.get('/equipment');
                const eqPayload = eqRes?.data;
                const eqList = Array.isArray(eqPayload)
                    ? eqPayload
                    : (eqPayload?.equipment || eqPayload?.items || eqPayload?.results || eqPayload?.data || []);

                const normalizedList = Array.isArray(eqList) ? eqList : [];
                const availableItems = normalizedList.filter(item => item?.status === 'Available');
                setEquipmentList(availableItems);

                try {
                    const pkgRes = await api.get('/packages');
                    const pkgList = Array.isArray(pkgRes.data)
                        ? pkgRes.data
                        : (pkgRes.data?.data || pkgRes.data?.packages || []);
                    setPackages(normalizePackages(pkgList.filter(p => p.isActive !== false)));
                } catch (pkgErr) {
                    console.warn("Could not load packages:", pkgErr);
                    setPackages([]);
                }

                try {
                    const roomRes = await api.get('/classrooms');
                    setClassroomList(roomRes.data);
                } catch (roomErr) {
                    console.warn("Could not load classrooms (Permission issue?)", roomErr);
                }

                try {
                    setCoursesLoading(true);
                    setCoursesLoadError(null);
                    const courseRes = await api.get('/courses');
                    const list = Array.isArray(courseRes.data) ? courseRes.data : [];
                    setCourses(list);
                } catch (courseErr) {
                    console.warn("Could not load courses", courseErr);
                    setCourses([]);
                    setCoursesLoadError(courseErr);
                } finally {
                    setCoursesLoading(false);
                }

                if (equipmentIdParam) {
                    const found = normalizedList.find(e => e?._id === equipmentIdParam);
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

    useEffect(() => {
        if (!packageIdParam) return;
        const pkg = packages.find(p => getPackageId(p) === packageIdParam);
        if (!pkg) return;
        setSelectedPackage(pkg);
        setFormData(prev => ({ ...prev, packageId: getPackageId(pkg) }));
        const parsedItems = itemsParam
            ? decodeURIComponent(itemsParam).split(",").map(s => s.trim()).filter(Boolean)
            : pkg.items || [];
        setSelectedPackageItems(parsedItems);
        setBookingType("package");
    }, [packageIdParam, itemsParam, packages]);

    const handleCourseSelect = (courseId) => {
        const selected = courses.find(c => c._id === courseId);
        setFormData(prev => ({
            ...prev,
            courseId,
            course: selected?.code || "",
            courseName: selected?.name || "",
        }));
        setErrors(prev => ({ ...prev, courseId: null, course: null, courseName: null }));
    };

    const sortedCourses = [...(courses || [])].sort((a, b) =>
        `${a?.name || ""}`.localeCompare(`${b?.name || ""}`, undefined, { sensitivity: "base" })
    );

    // --- 2. HELPER: Time Slots ---
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

    const handleScanQR = () => setIsScanning(true);
    const stopCamera = () => setIsScanning(false);

    const handleScanSuccess = (decodedText) => {
        setIsScanning(false);
        const found = equipmentList.find(e => e._id === decodedText || e.serialNumber === decodedText);
        if (found) {
            setEquipment(found);
            setFormData(prev => ({ ...prev, equipmentId: found._id }));
            toast.success("Equipment found! " + found.name);
            setFlowType('borrow');
            setStep(1);
        } else {
            toast.error("Equipment not found or unavailable.");
        }
    };

    // --- 4. FORM LOGIC ---
    const handleEquipmentSelect = (id) => {
        const found = equipmentList.find(e => e._id === id);
        if (found) {
            setEquipment(found);
            setFormData(prev => ({ ...prev, equipmentId: id, packageId: "" }));
            setSelectedPackage(null);
            setSelectedPackageItems([]);
        }
    };

    const handlePackageSelect = (pkg) => {
        const id = getPackageId(pkg);
        setSelectedPackage(pkg);
        setFormData(prev => ({ ...prev, packageId: id, equipmentId: "" }));
        setEquipment(null);
        setSelectedPackageItems(pkg.items || []);
        setErrors(prev => ({ ...prev, packageId: null, packageItems: null, equipmentId: null }));
    };

    const togglePackageItem = (item) => {
        setSelectedPackageItems(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
        setErrors(prev => ({ ...prev, packageItems: null }));
    };

    const handleBookingTypeChange = (type) => {
        setBookingType(type);
        setErrors(prev => ({ ...prev, equipmentId: null, packageId: null, packageItems: null }));
        if (type === "equipment") {
            setSelectedPackage(null);
            setSelectedPackageItems([]);
            setFormData(prev => ({ ...prev, packageId: "" }));
        } else {
            setEquipment(null);
            setFormData(prev => ({ ...prev, equipmentId: "" }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleDateSelect = (day) => {
        const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        const dateStr = format(selected, "yyyy-MM-dd");
        handleInputChange("reservationDate", dateStr);
        setShowDateModal(false);
    };

    const handleTimeSelect = (time) => {
        handleInputChange("reservationTime", time);
        setShowTimeModal(false);
    };

    // --- REAL-TIME EXCEPTION CHECK ---
    useEffect(() => {
        if (flowType === 'borrow' && step === 1 && equipment && formData.location) {
            const checkException = () => {
                const equipString = JSON.stringify(equipment).toLowerCase();
                const isProjector = equipString.includes('projector') ||
                    equipString.includes('projecteur') ||
                    equipString.includes('powerlite') ||
                    equipString.includes('epson');

                if (!isProjector) { setIsException(false); return; }

                const normalize = (str) => str?.toLowerCase().replace(/(room|salle|-|_|\s+)/g, '') || '';
                const inputLoc = normalize(formData.location);
                let foundRoom = null;
                if (inputLoc.length > 0) {
                    foundRoom = classroomList.find(c => normalize(c.name) === inputLoc);
                }
                setIsException(!!(foundRoom && foundRoom.hasScreen));
            };

            const timer = setTimeout(checkException, 300);
            return () => clearTimeout(timer);
        }
    }, [formData.location, equipment, step, classroomList, flowType]);

    // --- VALIDATION ---
    const validateForm = () => {
        const newErrors = {};

        if (bookingType === "equipment") {
            if (!formData.equipmentId) newErrors.equipmentId = "Please select equipment";
        } else {
            // ── PACKAGE BOOKING VALIDATION ──────────────────────────────────
            // The backend's POST /packages/:id/book requires the same destination
            // fields as single checkout: purpose, destination, and expectedReturnTime.
            // Validate them all here so nothing is missing on submit.
            if (!formData.packageId) {
                newErrors.packageId = t("equipment.selectPackageError", "Please select a package");
            }
            if (selectedPackageItems.length === 0) {
                newErrors.packageItems = t("equipment.selectPackageItemsError", "Select at least one item from the package");
            }
            if (!formData.courseId) newErrors.courseId = "Course is required";
            if (!formData.lecturer.trim()) newErrors.lecturer = "Lecturer Name is required";
            if (!formData.location.trim()) newErrors.location = "Room is required";
            if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";

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
                }
            }

            // Require front + back photos for every selected device
            if (selectedPackageItems.length > 0) {
                const photoErrors = {};
                for (const deviceId of selectedPackageItems) {
                    const photos = packageDevicePhotos[deviceId];
                    if (!photos || !photos.front || !photos.back) {
                        photoErrors[deviceId] = "Both front and back photos are required for this device.";
                    }
                }
                if (Object.keys(photoErrors).length > 0) {
                    newErrors.packagePhotos = photoErrors;
                }
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        if (step === 1) {
            if (flowType === 'borrow') {
                if (!formData.courseId) newErrors.courseId = "Course is required";
                if (!formData.lecturer.trim()) newErrors.lecturer = "Lecturer Name is required";
                if (!formData.location.trim()) newErrors.location = "Room is required";

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
                    }
                }

                if (!formData.purpose.trim()) {
                    newErrors.purpose = isException ? "Reason for exception is required." : "Purpose is required.";
                }
            } else if (flowType === 'reserve') {
                if (!formData.courseId) newErrors.courseId = "Course is required";
                if (!formData.lecturer.trim()) newErrors.lecturer = "Lecturer Name is required";
                if (!formData.location.trim()) newErrors.location = "Room is required";
                if (!formData.purpose.trim()) newErrors.purpose = "Reason for reservation is required";
                if (!formData.reservationDate) newErrors.reservationDate = "Date is required";
                if (!formData.reservationTime) newErrors.reservationTime = "Time is required";

                if (formData.reservationDate) {
                    const now = startOfDay(new Date());
                    const resDate = startOfDay(new Date(formData.reservationDate));
                    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 });
                    const endOfAllowedDays = new Date(startOfCurrentWeek);
                    endOfAllowedDays.setDate(endOfAllowedDays.getDate() + 5);

                    if (isBefore(resDate, now) || resDate > endOfAllowedDays || resDate.getDay() === 6) {
                        newErrors.reservationDate = "Reservations are only allowed for this week (Sun-Fri).";
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (!validateForm()) return;

        // Package bookings skip the review step — they submit directly
        if (bookingType === "package") {
            handleSubmit();
            return;
        }

        if (step === 1 && flowType === 'borrow' && isException) {
            setShowScreenWarning(true);
            return;
        }

        setStep(step + 1);
    };

    // --- IMAGE COMPRESSION ---
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

    // --- SUBMIT ---
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            const purposeBase = isException
                ? `[EXCEPTION: Projector in Screen Room] ${formData.purpose}`
                : formData.purpose;

            // ── PACKAGE BOOKING ───────────────────────────────────────────────
            if (bookingType === "package") {
                const packageId = formData.packageId;
                if (!packageId) {
                    toast.error("No package selected.");
                    setSubmitting(false);
                    return;
                }

                // Compress per-device photos before sending so the payload stays small.
                const devicePhotos = {};
                for (const deviceId of selectedPackageItems) {
                    const photos = packageDevicePhotos[deviceId];
                    if (!photos) continue;
                    devicePhotos[deviceId] = {
                        front: photos.front ? await compressImage(photos.front) : null,
                        back: photos.back ? await compressImage(photos.back) : null,
                    };
                }

                await api.post(`/packages/${packageId}/book`, {
                    purpose: purposeBase,
                    destination: `${formData.location} (${formData.course} - ${formData.courseName}, Lecturer: ${formData.lecturer})`,
                    expectedReturnTime: formData.sessionDateTime,
                    devicePhotos,
                });

                setStatusModal({
                    type: 'pending',
                    message: "Package booking submitted! You will be notified once it is reviewed."
                });

                if (onSuccess) onSuccess({
                    bookingType: "package",
                    packageId,
                    packageItems: selectedPackageItems,
                });
                return;
            }

            // ── SINGLE EQUIPMENT BORROW / RESERVE ────────────────────────────
            const payload = {
                courseId: formData.courseId,
                purpose: purposeBase,
                destination: `${formData.location} (${formData.course} - ${formData.courseName}, Lecturer: ${formData.lecturer})`,
                bookingType,
                equipmentId: formData.equipmentId,
            };

            if (flowType === 'borrow') {
                payload.expectedReturnTime = formData.sessionDateTime;

                const compressedPhotos = {};
                if (conditionPhotos.front) compressedPhotos.front = await compressImage(conditionPhotos.front);
                if (conditionPhotos.back) compressedPhotos.back = await compressImage(conditionPhotos.back);

                payload.conditionPhotos = compressedPhotos;
                payload.location = formData.location;
                payload.course = formData.course;
                payload.courseName = formData.courseName;
                payload.lecturer = formData.lecturer;

                const res = await api.post('/transactions/checkout', payload);

                const status = (res.data.status || "").toLowerCase();
                const serverMsg = (res.data.serverStatusMessage || "").toLowerCase();

                if (status === 'pending' || serverMsg === 'pending_approval' || status === 'saved') {
                    setStatusModal({
                        type: 'pending',
                        message: "Request Received. Your request is being reviewed by IT Staff."
                    });
                } else {
                    setStatusModal({
                        type: 'success',
                        message: "Checkout Successful! You can pick up your equipment now."
                    });
                }

                if (onSuccess) onSuccess({ ...res.data, bookingType });

            } else {
                payload.reservationDate = formData.reservationDate;
                payload.reservationTime = formData.reservationTime;
                payload.location = formData.location;
                payload.course = formData.course;
                payload.courseName = formData.courseName;
                payload.lecturer = formData.lecturer;

                const res = await api.post('/transactions/reserve', payload);
                setStatusModal({ type: 'success', message: "Reservation confirmed successfully!" });

                if (onSuccess) onSuccess({ ...res.data, bookingType });
            }

        } catch (err) {
            console.error("Submit Error:", err);
            const msg = err.response?.data?.message || "Failed to submit.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

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

    const currentSteps = flowType === "borrow"
        ? [
            { label: t("equipment.stepDetails", "Details & Condition"), icon: ClipboardList },
            { label: t("equipment.stepReview", "Review"), icon: CheckCircle2 }
        ]
        : [
            { label: t("equipment.stepDetails", "Reservation Details"), icon: CalendarClock },
            { label: t("equipment.stepReview", "Review"), icon: CheckCircle2 }
        ];

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

                    <button onClick={() => setFlowType("reserve")} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#126dd5] hover:shadow-xl transition-all text-left">
                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 text-[#126dd5] inline-block">
                            <CalendarClock className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0b1d3a] mb-2">{t('equipment.reserveLater', 'Reserve for Later')}</h3>
                        <p className="text-slate-500 mb-6">{t('equipment.reserveLaterDesc', 'Schedule equipment for a future class or event.')}</p>
                        <div className="text-[#126dd5] font-semibold flex items-center group-hover:gap-2 transition-all">
                            {t('equipment.stepReservation', 'Make Reservation')} <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            {/* Steps Container */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    {currentSteps.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => step > i + 1 && setStep(i + 1)}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${step === i + 1 ? 'bg-[#126dd5] text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    {step > i + 1 ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : i + 1}
                                </div>
                                <span className={`text-xs md:text-sm font-black tracking-tight hidden sm:inline ${step === i + 1 ? 'text-[#0b1d3a]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {s.label}
                                </span>
                            </button>
                            {i < currentSteps.length - 1 && <div className="w-6 md:w-12 h-1 bg-slate-100 mx-2 md:mx-3 rounded-full" />}
                        </div>
                    ))}
                </div>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
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

            {/* STEP 1 */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                            {t("equipment.bookingTypeLabel", "What are you booking?")}
                        </Label>
                        <div className="p-1 bg-slate-100 rounded-xl flex">
                            <button
                                type="button"
                                disabled={!!packageIdParam}
                                onClick={() => handleBookingTypeChange("equipment")}
                                className={cn(
                                    "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    bookingType === "equipment"
                                        ? "bg-white text-[#0b1d3a] shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {t("equipment.bookSingleItem", "Single Equipment")}
                            </button>
                            <button
                                type="button"
                                disabled={!!equipmentIdParam}
                                onClick={() => handleBookingTypeChange("package")}
                                className={cn(
                                    "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    bookingType === "package"
                                        ? "bg-white text-[#0b1d3a] shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {t("equipment.bookPackage", "Equipment Package")}
                            </button>
                        </div>

                        {bookingType === "equipment" ? (
                            <div className="space-y-2 pt-2">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    {t("equipment.stepSelectItem", "Select Item")}
                                </Label>
                                <Select value={formData.equipmentId} onValueChange={handleEquipmentSelect}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border border-slate-200 text-[#0b1d3a] font-medium">
                                        <SelectValue placeholder={t("equipment.stepSelectItem", "Select equipment")} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-[280px]">
                                        {equipmentList.map(item => (
                                            <SelectItem key={item._id} value={item._id}>
                                                {item.name}
                                                {item.serialNumber && (
                                                    <span className="text-slate-400 text-xs ml-2">({item.serialNumber})</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.equipmentId && <p className="text-xs text-rose-500 font-bold px-1">{errors.equipmentId}</p>}
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2">
                                <div>
                                    <p className="text-sm font-semibold text-[#0b1d3a]">{t("equipment.selectPackage", "Select a package")}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{t("equipment.selectPackageDesc", "Choose a pre-defined bundle of equipment for your session.")}</p>
                                </div>
                                {packages.length === 0 ? (
                                    <p className="text-sm text-slate-500">{t("equipment.noPackagesAvailable", "No packages available at the moment.")}</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {packages.map(pkg => {
                                            const id = getPackageId(pkg);
                                            const isSelected = formData.packageId === id;
                                            return (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => handlePackageSelect(pkg)}
                                                    className={cn(
                                                        "text-left p-4 rounded-xl border transition-all",
                                                        isSelected
                                                            ? "bg-[#126dd5]/5 border-[#126dd5]/40 ring-2 ring-[#126dd5]/20"
                                                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <p className="font-bold text-sm text-[#0b1d3a]">{pkg.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.packageId && <p className="text-xs text-rose-500 font-bold">{errors.packageId}</p>}

                                {selectedPackage && (
                                    <div className="space-y-2">
                                        <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            {t("equipment.packageItemsLabel", "Items in this package")}
                                        </Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(selectedPackage.devices || selectedPackage.items || []).map((device, idx) => {
                                                const id = typeof device === 'object' ? (device._id || device.id || String(idx)) : device;
                                                const name = typeof device === 'object' ? (device.name || device.serialNumber || 'Unknown') : device;
                                                const isChecked = selectedPackageItems.includes(id);
                                                return (
                                                    <div
                                                        key={id}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                            isChecked ? "bg-[#126dd5]/5 border-[#126dd5]/30" : "bg-white border-slate-200"
                                                        )}
                                                        onClick={() => togglePackageItem(id)}
                                                    >
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={() => togglePackageItem(id)}
                                                            className="data-[state=checked]:bg-[#126dd5] data-[state=checked]:border-[#126dd5]"
                                                        />
                                                        <span className="text-sm font-medium text-[#0b1d3a]">{name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {errors.packageItems && <p className="text-xs text-rose-500 font-bold">{errors.packageItems}</p>}
                                    </div>
                                )}

                                {/* Per-device condition photos (front + back per selected device) */}
                                {selectedPackage && selectedPackageItems.length > 0 && (
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0b1d3a]">
                                                {t("equipment.packagePhotosLabel", "Condition photos (per device)")}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {t("equipment.packagePhotosDesc", "Take a front and back photo of each device you are borrowing.")}
                                            </p>
                                        </div>
                                        <div className="space-y-6">
                                            {(selectedPackage.devices || selectedPackage.items || [])
                                                .filter((device, idx) => {
                                                    const id = typeof device === 'object' ? (device._id || device.id || String(idx)) : device;
                                                    return selectedPackageItems.includes(id);
                                                })
                                                .map((device, idx) => {
                                                    const id = typeof device === 'object' ? (device._id || device.id || String(idx)) : device;
                                                    const name = typeof device === 'object' ? (device.name || device.serialNumber || 'Device') : device;
                                                    const photoError = errors.packagePhotos?.[id];
                                                    return (
                                                        <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                                        {t("equipment.deviceLabel", "Device")}
                                                                    </p>
                                                                    <p className="text-sm font-bold text-[#0b1d3a]">{name}</p>
                                                                </div>
                                                            </div>
                                                            <EquipmentScanAndPhotoUpload
                                                                hideScanner={true}
                                                                requireBothPhotos={true}
                                                                onPhotosChange={getDevicePhotoCallback(id)}
                                                            />
                                                            {photoError && (
                                                                <p className="text-xs text-rose-500 font-bold px-1">{photoError}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {flowType === 'borrow' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                                        {t("equipment.courseLabel", "Course")}
                                    </Label>
                                    <Select value={formData.courseId} onValueChange={handleCourseSelect} disabled={coursesLoading || sortedCourses.length === 0}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-[#126dd5]/20 text-[#0b1d3a] font-medium">
                                            <SelectValue
                                                placeholder={
                                                    coursesLoading
                                                        ? t("equipment.loadingCourses", "Loading courses...")
                                                        : (sortedCourses.length === 0 ? t("equipment.noCoursesAvailable", "No courses available") : t("equipment.selectCourse", "Select course"))
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[320px]">
                                            {sortedCourses.map((c) => (
                                                <SelectItem key={c._id} value={c._id}>
                                                    {(c.code ? `${c.code} — ` : "")}{c.name || "Unnamed course"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.courseId && <p className="text-xs text-rose-500 font-bold px-1">{errors.courseId}</p>}
                                    {!errors.courseId && coursesLoadError && (
                                        <p className="text-[11px] text-amber-700 font-semibold px-1">
                                            {t("equipment.coursesLoadFailed", "Courses could not be loaded. Please refresh or contact support.")}
                                        </p>
                                    )}
                                    {formData.courseId && (
                                        <p className="text-[11px] text-slate-500 font-semibold px-1">
                                            {t("equipment.selectedCourse", "Selected")}: {formData.course} {formData.courseName ? `— ${formData.courseName}` : ""}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Lecture Name</Label>
                                    <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.lecturer} onChange={(e) => handleInputChange("lecturer", e.target.value)} placeholder="Dr. Jade Bright" />
                                    {errors.lecturer && <p className="text-xs text-rose-500 font-bold px-1">{errors.lecturer}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Room</Label>
                                    <Input
                                        className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        placeholder="e.g. Room 304"
                                    />
                                    {errors.location && <p className="text-xs text-rose-500 font-bold px-1">{errors.location}</p>}
                                    {isException && (
                                        <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <p className="text-[11px] font-medium text-amber-800 leading-tight">
                                                {t('equipment.exceptionAlert', 'This classroom already has a screen. IT approval required.')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 animate-in fade-in">
                                <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                                    {isException ? t('equipment.exceptionReasonLabel', "Justification for Projector") : "Reason for Borrowing"}
                                </Label>
                                <div className="p-0.5 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm ring-1 ring-slate-200 overflow-hidden focus-within:ring-[#126dd5] transition-all">
                                    <Textarea
                                        value={formData.purpose}
                                        onChange={(e) => handleInputChange("purpose", e.target.value)}
                                        placeholder={isException ? t('equipment.exceptionReasonPlaceholder', "Explain why a projector is needed here...") : "Describe what you will use this equipment for..."}
                                        className="border-none bg-transparent min-h-[80px] text-[#0b1d3a] font-medium resize-none focus-visible:ring-0 py-3 px-4"
                                    />
                                </div>
                                {errors.purpose && <p className="text-xs text-rose-500 font-bold px-1">{errors.purpose}</p>}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-6 p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden transition-all duration-500">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] px-1">{t('equipment.borrowingFor', 'Borrowing for (hours)')}</Label>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {[2, 2.5, 3, 3.5, 4, 4.5].map((hrs) => {
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
                                                            handleInputChange("sessionDateTime", target.toISOString());
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

                            {bookingType === "equipment" && (
                                <div className="pt-6 border-t border-slate-100">
                                    <EquipmentScanAndPhotoUpload
                                        equipment={equipment}
                                        scanError={scanError}
                                        hideScanner={true}
                                        onReset={() => {
                                            setScanError(null);
                                            setEquipment(null);
                                            setFormData(prev => ({ ...prev, equipmentId: "" }));
                                        }}
                                        onPhotosChange={setConditionPhotos}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
                                <h4 className="text-base font-black text-[#0b1d3a] mb-6 tracking-tight uppercase text-xs opacity-60">{t('equipment.bookingDetails', 'Reservation Details')}</h4>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">
                                                {t("equipment.courseLabel", "Course")}
                                            </Label>
                                            <Select value={formData.courseId} onValueChange={handleCourseSelect} disabled={coursesLoading || sortedCourses.length === 0}>
                                                <SelectTrigger className="w-full h-12 rounded-xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-[#126dd5]/20 text-[#0b1d3a] font-medium">
                                                    <SelectValue
                                                        placeholder={
                                                            coursesLoading
                                                                ? t("equipment.loadingCourses", "Loading courses...")
                                                                : (sortedCourses.length === 0 ? t("equipment.noCoursesAvailable", "No courses available") : t("equipment.selectCourse", "Select course"))
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[320px]">
                                                    {sortedCourses.map((c) => (
                                                        <SelectItem key={c._id} value={c._id}>
                                                            {(c.code ? `${c.code} — ` : "")}{c.name || "Unnamed course"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.courseId && <p className="text-xs text-rose-500 font-bold px-1">{errors.courseId}</p>}
                                            {!errors.courseId && coursesLoadError && (
                                                <p className="text-[11px] text-amber-700 font-semibold px-1">
                                                    {t("equipment.coursesLoadFailed", "Courses could not be loaded. Please refresh or contact support.")}
                                                </p>
                                            )}
                                            {formData.courseId && (
                                                <p className="text-[11px] text-slate-500 font-semibold px-1">
                                                    {t("equipment.selectedCourse", "Selected")}: {formData.course} {formData.courseName ? `— ${formData.courseName}` : ""}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Lecture Name</Label>
                                            <Input className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all" value={formData.lecturer} onChange={(e) => handleInputChange("lecturer", e.target.value)} placeholder="Dr. Jade Bright" />
                                            {errors.lecturer && <p className="text-xs text-rose-500 font-bold px-1">{errors.lecturer}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Room</Label>
                                            <Input
                                                className="text-[#0b1d3a] font-medium h-12 bg-white border-slate-200 rounded-xl focus:border-[#126dd5] transition-all"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                placeholder="e.g. Room 304"
                                            />
                                            {errors.location && <p className="text-xs text-rose-500 font-bold px-1">{errors.location}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest px-1">Reason for Reservation</Label>
                                        <div className="p-0.5 rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm ring-1 ring-slate-200 overflow-hidden focus-within:ring-[#126dd5] transition-all">
                                            <Textarea
                                                value={formData.purpose}
                                                onChange={(e) => handleInputChange("purpose", e.target.value)}
                                                placeholder="Explain why you need this equipment..."
                                                className="border-none bg-transparent min-h-[80px] text-[#0b1d3a] font-medium resize-none focus-visible:ring-0 py-3 px-4"
                                            />
                                        </div>
                                        {errors.purpose && <p className="text-xs text-rose-500 font-bold px-1">{errors.purpose}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div>
                                        <h4 className="text-base font-black text-[#0b1d3a]">{t('equipment.reservationScheduler', 'Reservation Scheduler')}</h4>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{t('equipment.chooseDateAndTime', 'Choose date & pickup time')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <div className="flex flex-col space-y-4">
                                                    <div className="flex items-center justify-center w-full pb-2">
                                                        <h4 className="text-sm font-bold text-[#0b1d3a] text-center w-full">
                                                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </h4>
                                                    </div>
                                                    <div className="w-[240px]">
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                                                                <div key={day} className="text-center text-[10px] font-bold text-slate-500 py-1">{day}</div>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 mt-1">
                                                            {renderCalendarDays()}
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => setShowDateModal(false)} className="w-full mt-2 text-xs text-slate-500 font-bold hover:text-[#0b1d3a] text-center py-2">Close</button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.reservationDate && <p className="text-xs text-rose-500 font-bold">{errors.reservationDate}</p>}
                                    </div>

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
                                                    ].map(slot => (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            onClick={() => handleTimeSelect(slot.time)}
                                                            className={cn(
                                                                "py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center border",
                                                                formData.reservationTime === slot.time
                                                                    ? "bg-[#126dd5] border-[#126dd5] text-white shadow-md shadow-blue-200"
                                                                    : "bg-white border-transparent text-[#0b1d3a] hover:bg-slate-100"
                                                            )}
                                                        >
                                                            {slot.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.reservationTime && <p className="text-xs text-rose-500 font-bold">{errors.reservationTime}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <p className="text-[10px] text-slate-400 font-semibold italic">Reservations are limited to the current academic week (Sun–Fri).</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: REVIEW */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {flowType === 'borrow' ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0b1d3a]">{t('equipment.reviewRequest', 'Review Your Request')}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('equipment.reviewDesc', 'Please verify the details below before submitting.')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                                            {studentName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-1">Student Information</p>
                                            <p className="text-[#0b1d3a] font-black text-base">{studentName}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-1">
                                            {bookingType === "package" ? t("equipment.package", "Package") : "Equipment Category"}
                                        </p>
                                        <p className="text-[#0b1d3a] font-black text-sm">
                                            {bookingType === "package" ? selectedPackage?.name : (equipment?.category?.name || "Equipment")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">
                                                {bookingType === "package" ? t("equipment.selectedPackage", "Selected Package") : "Selected Equipment"}
                                            </Label>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm"><Package className="w-5 h-5 text-[#126dd5]" /></div>
                                                <div>
                                                    {bookingType === "package" ? (
                                                        <>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{selectedPackage?.name}</p>
                                                            <p className="text-slate-400 text-[10px] font-medium">{selectedPackageItems.length} item(s) selected</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{equipment?.name}</p>
                                                            <p className="text-slate-400 text-[10px] font-medium">{equipment?.serialNumber}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Location, Course & Lecturer</Label>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-slate-400" /></div>
                                                    <div>
                                                        <p className="text-[#0b1d3a] font-bold text-sm">{formData.course} - {formData.courseName}</p>
                                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{formData.lecturer}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Scan className="w-4 h-4 text-slate-400" /></div>
                                                    <p className="text-[#0b1d3a] font-bold text-sm">{formData.location}</p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-50">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1 mb-1">Purpose</p>
                                                    <p className="text-slate-500 text-xs leading-relaxed italic px-1">"{formData.purpose}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Date & Time</Label>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><CalendarIcon className="w-4 h-4 text-slate-400" /></div>
                                                        <p className="text-[#0b1d3a] font-bold text-sm">{format(new Date(), 'MMM d, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                                    <div className="space-y-1">
                                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Booking Time</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-[#126dd5]"><Clock className="w-3 h-3" /></div>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{format(new Date(), 'hh:mm a')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Return Time</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center text-rose-500"><Clock className="w-3 h-3" /></div>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{formData.sessionDateTime ? format(new Date(formData.sessionDateTime), 'hh:mm a') : "Not set"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {bookingType === "equipment" && (
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Verification Photos</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['front', 'back'].map(side => (
                                                        <div key={side} className="aspect-video bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative group">
                                                            {conditionPhotos[side] ? (
                                                                <img src={conditionPhotos[side]} alt={side} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Camera className="w-4 h-4 text-slate-300" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-semibold uppercase">{side}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0b1d3a]">{t('equipment.reviewReservation', 'Review Your Reservation')}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('equipment.reviewDesc', 'Please verify the details below before submitting.')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                                            {studentName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-1">Student Information</p>
                                            <p className="text-[#0b1d3a] font-black text-base">{studentName}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-1">
                                            {bookingType === "package" ? t("equipment.package", "Package") : "Equipment Category"}
                                        </p>
                                        <p className="text-[#0b1d3a] font-black text-sm">
                                            {bookingType === "package" ? selectedPackage?.name : (equipment?.category?.name || "Equipment")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">
                                                {bookingType === "package" ? t("equipment.selectedPackage", "Selected Package") : "Target Equipment"}
                                            </Label>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm"><Package className="w-5 h-5 text-blue-600" /></div>
                                                <div>
                                                    {bookingType === "package" ? (
                                                        <>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{selectedPackage?.name || "Selected Package"}</p>
                                                            <p className="text-slate-400 text-[10px] font-medium">{selectedPackageItems.length} item(s)</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{equipment?.name || "Selected Item"}</p>
                                                            <p className="text-slate-400 text-[10px] font-medium">{equipment?.serialNumber || "N/A"}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Class & Lecturer Details</Label>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-slate-400" /></div>
                                                    <div>
                                                        <p className="text-[#0b1d3a] font-bold text-sm">{formData.course} - {formData.courseName}</p>
                                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{formData.lecturer}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Scan className="w-4 h-4 text-slate-400" /></div>
                                                    <p className="text-[#0b1d3a] font-bold text-sm">{formData.location}</p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-50">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1 mb-1">Reason</p>
                                                    <p className="text-slate-500 text-xs leading-relaxed italic px-1">"{formData.purpose}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 font-bold uppercase text-[10px] tracking-widest px-1">Planned Schedule</Label>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><CalendarIcon className="w-4 h-4 text-slate-400" /></div>
                                                    <p className="text-[#0b1d3a] font-bold text-sm">
                                                        {formData.reservationDate ? format(new Date(formData.reservationDate), 'EEEE, MMM d, yyyy') : "Date not selected"}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-50">
                                                    <div className="space-y-1">
                                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Pickup Time</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-[#126dd5]"><Clock className="w-3 h-3" /></div>
                                                            <p className="text-[#0b1d3a] font-bold text-sm">{formData.reservationTime || "Time not selected"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="mt-8 flex justify-end gap-4">
                {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="h-12 px-6 rounded-xl border-slate-200 text-[#0b1d3a] font-bold">
                        {t('equipment.backBtn', 'Back')}
                    </Button>
                )}

                {step < totalSteps ? (
                    <Button onClick={handleNextStep} className="bg-[#0b1d3a] hover:bg-[#1a3b6e] h-12 px-8 rounded-xl font-black shadow-lg shadow-slate-200 flex items-center gap-2 text-white">
                        {flowType === 'borrow' ? t('equipment.reviewDetailsBtn', 'Review Details') : t('equipment.nextStep', 'Next Step')} <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className={`h-12 px-10 rounded-xl font-black shadow-xl transition-all active:scale-95 text-white flex gap-2 items-center ${isException ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#126dd5] hover:bg-[#0f5ab1] shadow-blue-200'}`}>
                        {submitting ? (
                            <>
                                <Loader variant="inline" />
                                <span>{t('equipment.submitting', 'Submitting Request...')}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isException ? t('equipment.submitRequest', 'Confirm for Approval') : (flowType === 'borrow' ? t('equipment.finalizeAndBorrow', 'Finalize & Borrow') : t('equipment.confirmReservation', 'Confirm Reservation'))}</span>
                            </>
                        )}
                    </Button>
                )}

                <Dialog open={!!statusModal} onOpenChange={(open) => !open && navigate("/student/borrowed-items")}>
                    <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-xl rounded-3xl p-6 outline-none">
                        <DialogHeader className="flex flex-col items-center text-center">
                            <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${statusModal?.type === 'success' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {statusModal?.type === 'success' ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                            </div>
                            <DialogTitle className="text-xl font-bold text-[#0b1d3a]">
                                {statusModal?.type === 'success' ? t('equipment.statusConfirmed', 'Confirmed!') : t('equipment.statusUnderReview', 'Under Review')}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-2 text-center w-full">
                                {statusModal?.message}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex sm:justify-center mt-6 w-full">
                            <Button onClick={() => navigate("/student/borrowed-items")} className="flex-1 w-full rounded-xl h-11 font-bold shadow-lg transition-all bg-[#0b1d3a] hover:bg-[#126dd5] text-white shadow-blue-900/10">
                                {t('equipment.trackMyItems', 'Track My Items')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
    );
}

BorrowRequestForm.propTypes = { onSuccess: PropTypes.func };