import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/api";
import { format } from "date-fns";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    Image as ImageIcon,
    Package,
    Trophy,
    AlertTriangle
} from "lucide-react";
import Loader from "@/components/common/Loader";

export default function CheckoutDetailsDialog({ isOpen, onOpenChange, checkoutId, selectedCheckout }) {
    const { t } = useTranslation(["itstaff", "common"]);
    if (!selectedCheckout) return null;

    const [remoteCheckout, setRemoteCheckout] = useState(null);
    const [remoteLoading, setRemoteLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (!checkoutId) return;

        let cancelled = false;
        const load = async () => {
            setRemoteLoading(true);
            try {
                const res = await api.get(`/transactions/${checkoutId}`);
                const payload = res?.data?.data ?? res?.data;
                if (!cancelled) setRemoteCheckout(payload || null);
            } catch (e) {
                // If the backend doesn't expose this endpoint in some environments,
                // we still render from the preview payload passed in.
                if (!cancelled) setRemoteCheckout(null);
            } finally {
                if (!cancelled) setRemoteLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [isOpen, checkoutId]);

    const tx = remoteCheckout || selectedCheckout;

    const formatDateTime = (value) => {
        if (!value) return "N/A";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return format(d, "MMM dd, yyyy HH:mm");
    };

    // Helper to safely unpack data (handles both flat table data and nested API data)
    const data = useMemo(() => {
        const rawPurpose = tx.purpose || "";
        const packageMatch = rawPurpose.match(/\[Package:\s*([^\]]+)\]/i);
        const screenFlag = /\[SYSTEM FLAG:[^\]]*\]/i.test(rawPurpose);
        const cleanPurpose = rawPurpose
            .replace(/\[Package:\s*[^\]]+\]/gi, "")
            .replace(/\[SYSTEM FLAG:[^\]]*\]/gi, "")
            .trim() || "N/A";

        const rawPhotos = tx.checkoutPhotoUrl;
        const photos = Array.isArray(rawPhotos)
            ? rawPhotos.filter(Boolean)
            : (rawPhotos ? [rawPhotos] : []);

        const rawReturnPhotos = tx.returnPhotoUrl;
        const returnPhotos = Array.isArray(rawReturnPhotos)
            ? rawReturnPhotos.filter(Boolean)
            : (rawReturnPhotos ? [rawReturnPhotos] : []);

        return {
            equipmentName: tx.equipmentName || tx.equipment?.name || "Unknown Item",
            serialNumber: tx.equipment?.serialNumber || null,
            equipmentType: tx.equipment?.type || tx.equipment?.category || null,
            checkedOutAt: formatDateTime(tx.checkedOutAt || tx.checkoutDate || tx.createdAt),
            dueDate: formatDateTime(tx.dueDate || tx.expectedReturnTime),
            userName: tx.user?.fullName || tx.userName || (tx.user?.studentId ? `Student ${tx.user.studentId}` : tx.user?.username) || "Unknown User",
            userEmail: tx.userEmail || tx.user?.email || "N/A",
            userPhone: tx.user?.phone || tx.userPhone || null,
            userStudentId: tx.user?.studentId || null,
            userDepartment: tx.user?.department || null,
            userRole: tx.user?.role || null,
            username: tx.user?.username || null,

            studentScore: tx.studentScore !== undefined
                ? tx.studentScore
                : (tx.user?.responsibilityScore ?? 100),

            destination: tx.destination || "N/A",
            purpose: cleanPurpose,
            packageName: packageMatch ? packageMatch[1].trim() : null,
            screenFlag,
            photos,
            returnPhotos,
            status: tx.status || "Unknown",
            performedBy:
                (typeof tx.approvedBy === "string" ? tx.approvedBy : null) ||
                tx.approvedBy?.fullName ||
                tx.approvedBy?.username ||
                tx.processedBy?.fullName ||
                tx.processedBy?.username ||
                tx.updatedBy?.fullName ||
                tx.updatedBy?.username ||
                "N/A",
        };
    }, [tx]);

    // Determine score color based on value
    const scoreColor = data.studentScore >= 80 ? "text-green-600" : data.studentScore >= 50 ? "text-yellow-600" : "text-red-600";
    const scoreBg = data.studentScore >= 80 ? "bg-green-50 border-green-200" : data.studentScore >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} >
            <DialogContent className="mx-4 m-auto bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-slate-800 font-bold text-xl">{t('checkouts.dialog.viewDetails')}</DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {t('checkouts.dialog.reviewDetails', { status: data.status })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {remoteLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader variant="inline" />
                            {t("checkouts.dialog.loadingDetails")}
                        </div>
                    )}

                    {/* 1. Borrower Information & Trust Score */}
                    <Card className="border-l-4 border-l-slate-600 shadow-sm">

                        <CardHeader>
                            <CardTitle className="text-lg flex justify-between items-center flex-wrap gap-2">
                                <span className="text-slate-800 font-bold">{t('checkouts.dialog.borrowerInfo')}</span>

                                {/* Trust Score Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${scoreBg}`}>
                                    <Trophy className={`h-4 w-4 ${scoreColor}`} />
                                    <span className="text-sm font-medium text-gray-700">{t('checkouts.dialog.trustScore')}</span>
                                    <span className={`text-sm font-bold ${scoreColor}`}>{data.studentScore}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.name')}</div>
                                    <div className="font-semibold text-gray-900">{data.userName}</div>
                                    {data.username && data.username !== data.userName && (
                                        <div className="text-xs text-gray-500">@{data.username}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.email')}</div>
                                    <div className="font-semibold text-gray-900">{data.userEmail}</div>
                                </div>
                            </div>
                            {data.userPhone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-600">Phone</div>
                                        <div className="font-semibold text-gray-900">{data.userPhone}</div>
                                    </div>
                                </div>
                            )}
                            {(data.userStudentId || data.userDepartment) && (
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                    {data.userStudentId && (
                                        <div>
                                            <div className="text-sm text-gray-600">Student ID</div>
                                            <div className="font-semibold text-gray-900">{data.userStudentId}</div>
                                        </div>
                                    )}
                                    {data.userDepartment && (
                                        <div>
                                            <div className="text-sm text-gray-600">Department</div>
                                            <div className="font-semibold text-gray-900">{data.userDepartment}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. Equipment Information */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 font-bold flex items-center justify-between gap-2 flex-wrap">
                                <span>{t('checkouts.dialog.equipInfo')}</span>
                                {data.packageName && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                                        <Package className="h-3.5 w-3.5" />
                                        Part of package: {data.packageName}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.equipName')}</div>
                                    <div className="font-semibold text-gray-900">{data.equipmentName}</div>
                                    {data.serialNumber && (
                                        <div className="text-xs text-gray-500">SN: {data.serialNumber}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.reqDate')}</div>
                                    <div className="font-semibold text-gray-900">{data.checkedOutAt}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.returnDate')}</div>
                                    <div className="font-semibold text-gray-900">{data.dueDate}</div>
                                </div>
                            </div>
                            {data.screenFlag && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                                    <span>⚠️ This room already has a screen — special approval required for projector requests.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Logistics (Destination/Purpose) */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 font-bold">{t('checkouts.dialog.logistics')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.dest')}</div>
                                    <div className="font-semibold text-gray-900">{data.destination}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.purpose')}</div>
                                    <div className="font-semibold text-gray-900">{data.purpose}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Condition Verification & Side-by-Side Comparison Panel */}
                    {data.returnPhotos.length > 0 ? (
                        <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/5">
                            <CardHeader className="border-b border-slate-100 pb-3">
                                <CardTitle className="text-lg text-slate-800 font-bold flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-indigo-600" />
                                        <span>Projector Condition Comparison Panel</span>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                        Defense Audit Mode
                                    </span>
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1">
                                    Compare check-out state (left) versus check-in state (right) side-by-side to verify physical integrity.
                                </p>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Front View Pair */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">1. Front View Comparison</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Checkout Front */}
                                        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white group hover:shadow-md transition-all duration-200">
                                            <img
                                                src={data.photos[0] || "https://via.placeholder.com/800x600?text=No+Checkout+Front+Photo"}
                                                alt="Checkout Front View"
                                                className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in"
                                                onClick={() => window.open(data.photos[0], "_blank", "noopener,noreferrer")}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/800x600?text=No+Checkout+Front+Photo";
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                                Checkout State
                                            </div>
                                        </div>
                                        {/* Return Front */}
                                        <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-white group hover:shadow-md transition-all duration-200">
                                            <img
                                                src={data.returnPhotos[0] || "https://via.placeholder.com/800x600?text=No+Return+Front+Photo"}
                                                alt="Return Front View"
                                                className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in"
                                                onClick={() => window.open(data.returnPhotos[0], "_blank", "noopener,noreferrer")}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/800x600?text=No+Return+Front+Photo";
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-emerald-800/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                                Return State
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Back View Pair */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">2. Back View Comparison</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Checkout Back */}
                                        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white group hover:shadow-md transition-all duration-200">
                                            <img
                                                src={data.photos[1] || "https://via.placeholder.com/800x600?text=No+Checkout+Back+Photo"}
                                                alt="Checkout Back View"
                                                className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in"
                                                onClick={() => window.open(data.photos[1], "_blank", "noopener,noreferrer")}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/800x600?text=No+Checkout+Back+Photo";
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                                Checkout State
                                            </div>
                                        </div>
                                        {/* Return Back */}
                                        <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-white group hover:shadow-md transition-all duration-200">
                                            <img
                                                src={data.returnPhotos[1] || "https://via.placeholder.com/800x600?text=No+Return+Back+Photo"}
                                                alt="Return Back View"
                                                className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in"
                                                onClick={() => window.open(data.returnPhotos[1], "_blank", "noopener,noreferrer")}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/800x600?text=No+Return+Back+Photo";
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-emerald-800/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                                Return State
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Standard Condition Photos */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg text-slate-800 font-bold flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        {t('checkouts.dialog.photoTitle')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600">
                                            {t('checkouts.dialog.photoDesc')}
                                        </p>
                                        {data.photos.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {data.photos.map((src, idx) => {
                                                    const label = idx === 0 ? "Front" : idx === 1 ? "Back" : `Photo ${idx + 1}`;
                                                    return (
                                                        <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                                            <img
                                                                src={src}
                                                                alt={`${label} view`}
                                                                className="w-full h-auto object-cover max-h-[400px] cursor-zoom-in"
                                                                onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                                                                onError={(e) => {
                                                                    e.target.src = "https://via.placeholder.com/800x600?text=Image+Load+Error";
                                                                }}
                                                            />
                                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                                                {label}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                                {t('checkouts.dialog.noPhoto')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alert for Pending/Returned status but missing Return photos */}
                            {['Pending Return', 'Returned'].includes(data.status) && (
                                <Card className="shadow-sm border-emerald-100 bg-emerald-50/10">
                                    <CardHeader className="border-b border-emerald-50/50">
                                        <CardTitle className="text-lg text-emerald-800 font-bold flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5 text-emerald-600" />
                                            Return Condition Photos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="h-32 bg-emerald-50/20 rounded-lg border border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-600/70 p-4 text-center">
                                            <AlertTriangle className="h-6 w-6 text-emerald-500 mb-1" />
                                            <span className="text-xs font-bold">No return photos provided by student</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}