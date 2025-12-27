import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Clock,
    Package,
    AlertTriangle,
    CheckCircle,
    Timer,
    X,
} from "lucide-react";
import PropTypes from "prop-types";

// Mock function to check availability - replace with real API
const checkAvailability = (equipmentId, requestedEndTime) => {
    const random = Math.random();
    if (random > 0.8) {
        return {
            available: false,
            conflict: {
                time: "4:00 PM",
                reason: "Reserved by another student",
            },
        };
    }
    return { available: true, conflict: null };
};

export default function ExtendModal({ isOpen, onClose, item, onConfirm }) {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customTime, setCustomTime] = useState("");
    const [reason, setReason] = useState("");
    const [availability, setAvailability] = useState({ available: true, conflict: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const presets = [
        { label: "30 min", minutes: 30 },
        { label: "1 hour", minutes: 60 },
        { label: "2 hours", minutes: 120 },
        { label: "Until 5 PM", minutes: null, fixedTime: "17:00" },
    ];

    const calculateNewEndTime = () => {
        if (!item?.dueDate) return null;

        const currentDue = new Date(item.dueDate);

        if (selectedPreset !== null) {
            const preset = presets[selectedPreset];
            if (preset.fixedTime) {
                const [hours, mins] = preset.fixedTime.split(":").map(Number);
                const newTime = new Date(currentDue);
                newTime.setHours(hours, mins, 0, 0);
                return newTime;
            } else {
                return new Date(currentDue.getTime() + preset.minutes * 60000);
            }
        }

        if (customTime) {
            const [hours, mins] = customTime.split(":").map(Number);
            const newTime = new Date(currentDue);
            newTime.setHours(hours, mins, 0, 0);
            return newTime;
        }

        return null;
    };

    const newEndTime = calculateNewEndTime();

    useEffect(() => {
        if (newEndTime && item) {
            const result = checkAvailability(item.equipmentId, newEndTime);
            setAvailability(result);
        }
    }, [selectedPreset, customTime, item]);

    useEffect(() => {
        if (isOpen) {
            setSelectedPreset(null);
            setCustomTime("");
            setReason("");
            setAvailability({ available: true, conflict: null });
        }
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handlePresetSelect = (index) => {
        setSelectedPreset(index);
        setCustomTime("");
    };

    const handleCustomTimeChange = (value) => {
        setCustomTime(value);
        setSelectedPreset(null);
    };

    const handleSubmit = async () => {
        if (!newEndTime) return;

        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (onConfirm) {
            onConfirm({
                itemId: item.id,
                equipmentId: item.equipmentId,
                newEndTime: newEndTime.toISOString(),
                reason: reason.trim(),
            });
        }

        setIsSubmitting(false);
        onClose();
    };

    const formatTime = (date) => {
        if (!date) return "--:--";
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const getCurrentDue = () => {
        if (!item?.dueDate) return null;
        return new Date(item.dueDate);
    };

    const currentDue = getCurrentDue();

    const getTimeRemaining = () => {
        if (!currentDue) return null;
        const now = new Date();
        const diffMs = currentDue - now;
        if (diffMs <= 0) return { hours: 0, mins: 0, overdue: true };
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { hours, mins, overdue: false };
    };

    const timeRemaining = getTimeRemaining();

    if (!isOpen || !item) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0b69d4] to-[#0f7de5] px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Timer className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Extend Time</h2>
                                    <p className="text-sm text-white/80">Need more time? We've got you.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-9 w-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {/* Equipment Card */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                <Package className="h-6 w-6 text-[#0b69d4]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#0b1d3a] truncate">{item.equipmentName}</p>
                                <p className="text-sm text-slate-500">{item.equipmentId}</p>
                            </div>
                            <Badge
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${timeRemaining?.overdue
                                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    }`}
                            >
                                {timeRemaining?.overdue ? "Overdue" : "Active"}
                            </Badge>
                        </div>

                        {/* Current Due Time */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <span className="font-medium text-amber-800">Current due time</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-amber-900">{formatTime(currentDue)}</p>
                                <p className="text-xs text-amber-700">{formatDate(currentDue)}</p>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-[#0b1d3a]">Quick extend</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {presets.map((preset, index) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePresetSelect(index)}
                                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${selectedPreset === index
                                                ? "bg-[#0b69d4] text-white shadow-lg shadow-sky-300/40 scale-105"
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Time */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-[#0b1d3a]">Or set custom time</Label>
                            <Input
                                type="time"
                                value={customTime}
                                onChange={(e) => handleCustomTimeChange(e.target.value)}
                                className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-2 focus:ring-[#0b69d4]/20 h-12"
                            />
                        </div>

                        {/* New End Time Preview */}
                        {newEndTime && (
                            <div
                                className={`flex items-center justify-between p-4 rounded-xl ${availability.available
                                        ? "bg-emerald-50 border border-emerald-200"
                                        : "bg-rose-50 border border-rose-200"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${availability.available ? "bg-emerald-100" : "bg-rose-100"
                                        }`}>
                                        {availability.available ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                                        )}
                                    </div>
                                    <span className={`font-medium ${availability.available ? "text-emerald-800" : "text-rose-800"
                                        }`}>
                                        {availability.available ? "New end time" : "Conflict detected"}
                                    </span>
                                </div>
                                <div className="text-right">
                                    {availability.available ? (
                                        <>
                                            <p className="text-lg font-bold text-emerald-900">{formatTime(newEndTime)}</p>
                                            <p className="text-xs text-emerald-700">{formatDate(newEndTime)}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-rose-900">Reserved at {availability.conflict?.time}</p>
                                            <p className="text-xs text-rose-700">{availability.conflict?.reason}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold text-[#0b1d3a]">Reason</Label>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>
                            </div>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Class running longer than expected"
                                className="rounded-xl border-slate-200 focus:border-[#0b69d4] focus:ring-2 focus:ring-[#0b69d4]/20 min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl border-slate-300 hover:bg-slate-100 text-[#0b1d3a] h-12 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!newEndTime || !availability.available || isSubmitting}
                            className="flex-1 rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white h-12 font-semibold shadow-lg shadow-sky-300/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Extending...
                                </span>
                            ) : (
                                "Confirm Extension"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

ExtendModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    item: PropTypes.shape({
        id: PropTypes.string,
        equipmentId: PropTypes.string,
        equipmentName: PropTypes.string,
        dueDate: PropTypes.string,
    }),
    onConfirm: PropTypes.func,
};
