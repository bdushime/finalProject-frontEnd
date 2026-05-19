import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer } from "@/components/common/Page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Loader from "@/components/common/Loader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Package, Box, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";
import { fetchPackages, bookPackage, cancelPackageBooking } from "@/services/packagesService";
import { findPendingPackageBooking, getDeviceNames } from "./data/packageUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track which package the current user has a pending booking for.
    // The backend should return a `userBookingStatus` or similar field; we track it locally too.
    const [pendingBookings, setPendingBookings] = useState({}); // { [packageId]: true }
    const [expandedCards, setExpandedCards] = useState({}); // { [packageId]: true }
    const [actionLoading, setActionLoading] = useState({}); // { [packageId]: true }

    const [bookModalPkg, setBookModalPkg] = useState(null);
    const [bookSubmitting, setBookSubmitting] = useState(false);

    // Form fields for package booking
    const [destination, setDestination] = useState("");
    const [purpose, setPurpose] = useState("");
    const [durationHours, setDurationHours] = useState(2.5);
    const [customReturnTime, setCustomReturnTime] = useState("");

    // Confirmation modal state (cancel booking)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
        variant: "default",
    });

    const openConfirm = (title, description, onConfirm, variant = "default") => {
        setConfirmModal({ isOpen: true, title, description, onConfirm, variant });
    };

    // ── Fetch packages ────────────────────────────────────────────────────────
    const loadPackages = async () => {
        setLoading(true);
        try {
            const [pkgData, historyRes] = await Promise.all([
                fetchPackages(),
                api.get("/transactions/my-history").catch(() => ({ data: [] })),
            ]);
            const list = Array.isArray(pkgData) ? pkgData : (pkgData?.data || pkgData?.packages || []);
            setPackages(list);

            const historyPayload = historyRes?.data;
            const transactions = Array.isArray(historyPayload)
                ? historyPayload
                : (historyPayload?.data || historyPayload?.transactions || []);

            const initial = {};
            list.forEach((pkg) => {
                if (
                    pkg.userBookingStatus === "pending" ||
                    pkg.hasUserBooking ||
                    findPendingPackageBooking(transactions, pkg._id)
                ) {
                    initial[pkg._id] = true;
                }
            });
            setPendingBookings(initial);
        } catch (err) {
            console.error("Failed to load packages:", err);
            toast.error(err.response?.data?.message || "Failed to load packages.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);

    // ── Toggle device list expansion ─────────────────────────────────────────
    const toggleExpand = (id) => {
        setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleBook = (pkg) => setBookModalPkg(pkg);

    const handleConfirmBook = async () => {
        if (!bookModalPkg) return;
        if (!destination.trim()) {
            toast.error("Please enter a room / destination.");
            return;
        }
        if (!purpose.trim()) {
            toast.error("Please enter the purpose of booking.");
            return;
        }

        let expectedReturnTime = "";
        if (customReturnTime) {
            const date = new Date().toLocaleDateString('en-CA');
            expectedReturnTime = `${date}T${customReturnTime}:00`;
        } else {
            const target = new Date();
            target.setMinutes(target.getMinutes() + durationHours * 60);
            expectedReturnTime = target.toISOString();
        }

        const packageId = bookModalPkg._id;
        setBookSubmitting(true);
        setActionLoading((prev) => ({ ...prev, [packageId]: true }));
        try {
            await bookPackage(packageId, {
                destination,
                purpose,
                expectedReturnTime,
            });
            setPendingBookings((prev) => ({ ...prev, [packageId]: true }));
            toast.success("Package booked successfully! You will be notified once it is reviewed.");
            setBookModalPkg(null);
            // Reset form fields
            setDestination("");
            setPurpose("");
            setDurationHours(2.5);
            setCustomReturnTime("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to book package.");
        } finally {
            setBookSubmitting(false);
            setActionLoading((prev) => ({ ...prev, [packageId]: false }));
        }
    };

    // ── Cancel booking ────────────────────────────────────────────────────────
    const handleCancelBooking = (pkg) => {
        openConfirm(
            "Cancel Booking",
            `Are you sure you want to cancel your pending booking for "${pkg.name}"?`,
            async () => {
                setActionLoading((prev) => ({ ...prev, [pkg._id]: true }));
                try {
                    await cancelPackageBooking(pkg._id);
                    setPendingBookings((prev) => {
                        const next = { ...prev };
                        delete next[pkg._id];
                        return next;
                    });
                    toast.success("Booking cancelled successfully.");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to cancel booking.");
                } finally {
                    setActionLoading((prev) => ({ ...prev, [pkg._id]: false }));
                }
            },
            "destructive"
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center">
                    <Loader />
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <PageContainer>
                {/* Header */}
                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">Equipment Packages</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Browse and book pre-configured equipment bundles for your sessions.
                    </p>
                </div>

                {/* Empty state */}
                {packages.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0b1d3a] mb-1">No packages available</h3>
                        <p className="text-slate-500 text-sm">Check back later for available equipment packages.</p>
                    </div>
                )}

                {/* Package grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                        const devices = pkg.devices || [];
                        const deviceCount = devices.length;
                        const isExpanded = !!expandedCards[pkg._id];
                        const hasPendingBooking = !!pendingBookings[pkg._id];
                        const isActing = !!actionLoading[pkg._id];
                        const PREVIEW_LIMIT = 3;

                        return (
                            <div
                                key={pkg._id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                            >
                                {/* Card top accent */}
                                <div className="h-1.5 bg-[#126dd5] w-full" />

                                <div className="p-6 flex flex-col flex-1">
                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#126dd5]/10 flex items-center justify-center shrink-0">
                                                <Box className="w-5 h-5 text-[#126dd5]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0b1d3a] text-base leading-tight">
                                                    {pkg.name}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="mt-1 text-[10px] font-bold uppercase tracking-wider border-none bg-[#126dd5]/5 text-[#126dd5] px-2 py-0.5 rounded-full"
                                                >
                                                    {deviceCount} device{deviceCount !== 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {pkg.description && (
                                        <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                                            {pkg.description}
                                        </p>
                                    )}

                                    {/* Device list */}
                                    {deviceCount > 0 && (
                                        <div className="mb-4 flex-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                                Included Devices
                                            </p>
                                            <ul className="space-y-1.5">
                                                {(isExpanded ? devices : devices.slice(0, PREVIEW_LIMIT)).map((device, idx) => (
                                                    <li
                                                        key={getDeviceId(device) || idx}
                                                        className="flex items-center gap-2 text-sm text-slate-700"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#126dd5] shrink-0" />
                                                        {getDeviceName(device)}
                                                    </li>
                                                ))}
                                            </ul>

                                            {deviceCount > PREVIEW_LIMIT && (
                                                <button
                                                    onClick={() => toggleExpand(pkg._id)}
                                                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#126dd5] hover:text-[#0b1d3a] transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-3.5 h-3.5" /> Show less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                            {deviceCount - PREVIEW_LIMIT} more device{deviceCount - PREVIEW_LIMIT !== 1 ? "s" : ""}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <div className="mt-auto pt-4 border-t border-slate-100">
                                        {hasPendingBooking ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                    Booking Pending
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl h-9 font-semibold text-xs"
                                                    onClick={() => handleCancelBooking(pkg)}
                                                    disabled={isActing}
                                                >
                                                    {isActing ? (
                                                        <><Loader variant="inline" className="mr-1.5" /> Cancelling...</>
                                                    ) : (
                                                        "Cancel Booking"
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-[#0b1d3a] hover:bg-[#126dd5] text-white font-bold h-11 rounded-xl shadow-sm transition-all active:scale-95"
                                                onClick={() => handleBook(pkg)}
                                                disabled={isActing}
                                            >
                                                {isActing ? (
                                                    <><Loader variant="inline" className="mr-2" /> Booking...</>
                                                ) : (
                                                    "Book Package"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </PageContainer>

            {/* Book confirmation modal */}
            <Dialog open={!!bookModalPkg} onOpenChange={(open) => !open && setBookModalPkg(null)}>
                <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-xl rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0b1d3a]">
                            Book &quot;{bookModalPkg?.name}&quot;
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Confirm booking this package bundle. The following devices will be included:
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="max-h-24 overflow-y-auto space-y-1.5 my-2 border border-slate-100 rounded-xl p-3 bg-slate-50">
                        {bookModalPkg && getDeviceNames(bookModalPkg).length > 0 ? (
                            getDeviceNames(bookModalPkg).map((name, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#126dd5] shrink-0" />
                                    {name}
                                </li>
                            ))
                        ) : (
                            <li className="text-xs text-slate-400 italic">No devices listed for this package.</li>
                        )}
                    </ul>

                    <div className="space-y-4 my-2 text-left">
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Destination / Room</Label>
                            <Input
                                placeholder="e.g. Room 204, Lab A"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="rounded-xl border-slate-200 focus:border-[#126dd5] focus:ring-[#126dd5]/10 h-10 text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Purpose of Booking</Label>
                            <Textarea
                                placeholder="e.g. Practical class session, presentation"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="rounded-xl border-slate-200 focus:border-[#126dd5] focus:ring-[#126dd5]/10 min-h-[60px] text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2.5 pt-1">
                            <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">Borrowing Duration</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {[2, 2.5, 3, 3.5, 4, 4.5, 5].map((hrs) => (
                                    <button
                                        key={hrs}
                                        type="button"
                                        onClick={() => {
                                            setDurationHours(hrs);
                                            setCustomReturnTime("");
                                        }}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                                            durationHours === hrs && !customReturnTime
                                                ? "bg-[#126dd5] border-[#126dd5] text-white shadow-md"
                                                : "bg-slate-50 border-slate-100 text-[#0b1d3a] hover:bg-slate-100"
                                        }`}
                                    >
                                        {hrs}h
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <div className="bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 w-fit shrink-0">
                                    <Clock className="w-4 h-4 text-[#126dd5]" />
                                    <Input
                                        type="time"
                                        value={customReturnTime}
                                        onChange={(e) => {
                                            setCustomReturnTime(e.target.value);
                                        }}
                                        className="bg-transparent border-none text-[#0b1d3a] font-black text-xs h-6 w-20 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 tabular-nums cursor-pointer"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium">Or set custom return time today</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3 sm:justify-end pt-2 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setBookModalPkg(null)}
                            disabled={bookSubmitting}
                            className="rounded-xl text-slate-500 hover:text-[#0b1d3a] h-11 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmBook}
                            disabled={bookSubmitting}
                            className="rounded-xl h-11 font-bold bg-[#0b1d3a] hover:bg-[#126dd5] text-white px-6"
                        >
                            {bookSubmitting ? (
                                <><Loader variant="inline" className="mr-2" /> Booking...</>
                            ) : (
                                "Confirm Booking"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel booking confirmation */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText="Confirm"
                cancelText="Cancel"
                variant={confirmModal.variant}
            />
        </StudentLayout>
    );
}
