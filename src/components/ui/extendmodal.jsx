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
    CalendarClock
} from "lucide-react";
import PropTypes from "prop-types";

// Mock function to check availability - replace with real API
const checkAvailability = (equipmentId, requestedEndTime) => {
    // Demo availability check
    return { available: true, conflict: null };
};

export default function ExtendModal({ isOpen, onClose, item, onConfirm }) {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [reason, setReason] = useState("");
    const [availability, setAvailability] = useState({ available: true, conflict: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Max extension is 30 mins.
    const presets = [
        { label: "10 min", minutes: 10 },
        { label: "20 min", minutes: 20 },
        { label: "25 min", minutes: 25 },
        { label: "30 min", minutes: 30 },
    ];

    const calculateNewEndTime = () => {
        if (!item?.dueDate || selectedPreset === null) return null;

        const currentDue = new Date(item.dueDate);
        const preset = presets[selectedPreset];

        return new Date(currentDue.getTime() + preset.minutes * 60000);
    };

    const newEndTime = calculateNewEndTime();

    useEffect(() => {
        if (newEndTime && item) {
            const result = checkAvailability(item.equipmentId, newEndTime);
            setAvailability(result);
        }
    }, [selectedPreset, item]);

    useEffect(() => {
        if (isOpen) {
            setSelectedPreset(null);
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

    const getCurrentDue = () => {
        if (!item?.dueDate) return null;
        return new Date(item.dueDate);
    };

    const currentDue = getCurrentDue();

    if (!isOpen || !item) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#126dd5]/10 flex items-center justify-center">
                                <CalendarClock className="h-5 w-5 text-[#126dd5]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#0b1d3a]">Extend Session</h2>
                                <p className="text-xs text-slate-500 font-medium">Max extension: 30 minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Summary Bar */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                    <Package className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0b1d3a]">{item.equipmentName}</p>
                                    <p className="text-[11px] text-slate-500 font-medium tracking-wide">ID: {item.equipmentId}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Current Due</p>
                                <p className="text-sm font-bold text-[#0b1d3a]">{formatTime(currentDue)}</p>
                            </div>
                        </div>

                        {/* Presets - STRICT 30 MIN LIMIT */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-[#0b1d3a] uppercase tracking-wide">Select Duration</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {presets.map((preset, index) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => setSelectedPreset(index)}
                                        className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all border ${selectedPreset === index
                                                ? "bg-[#0b1d3a] border-[#0b1d3a] text-white shadow-md shadow-slate-900/10"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center">
                                *Max extension per session is 30 minutes.
                            </p>
                        </div>

                        {/* Conflict/Success Status */}
                        {newEndTime && (
                            <div className={`p-4 rounded-xl border ${availability.available
                                    ? "bg-emerald-50/50 border-emerald-100"
                                    : "bg-amber-50/50 border-amber-100"
                                }`}>
                                <div className="flex items-start gap-3">
                                    {availability.available ? (
                                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-bold ${availability.available ? "text-emerald-800" : "text-amber-800"
                                            }`}>
                                            {availability.available ? "Ready to Confirm" : "Scheduling Conflict"}
                                        </p>
                                        <p className={`text-xs mt-1 ${availability.available ? "text-emerald-600" : "text-amber-600"
                                            }`}>
                                            {availability.available
                                                ? `New end time: ${formatTime(newEndTime)}`
                                                : availability.conflict?.reason
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-[#0b1d3a] uppercase tracking-wide">Reason (Optional)</Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for extension..."
                                className="rounded-xl border-slate-200 focus:border-[#126dd5] focus:ring-0 min-h-[60px] text-sm resize-none bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-2 bg-white flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 rounded-xl text-slate-500 hover:text-[#0b1d3a] hover:bg-slate-50 h-11 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!newEndTime || !availability.available || isSubmitting}
                            className="flex-1 rounded-xl bg-[#0b1d3a] hover:bg-[#126dd5] text-white h-11 font-semibold shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isSubmitting ? "Extending..." : "Confirm Extension"}
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

