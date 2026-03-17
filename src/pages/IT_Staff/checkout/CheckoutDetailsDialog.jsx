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
    Loader2
} from "lucide-react";

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
    const data = useMemo(() => ({
        equipmentName: tx.equipmentName || tx.equipment?.name || "Unknown Item",
        checkedOutAt: formatDateTime(tx.checkedOutAt || tx.checkoutDate || tx.createdAt),
        dueDate: formatDateTime(tx.dueDate || tx.expectedReturnTime),
        userName: tx.userName || tx.user?.fullName || tx.user?.username || "Unknown User",
        userEmail: tx.userEmail || tx.user?.email || "N/A",
        userPhone: tx.userPhone || tx.user?.phone || "N/A",

        // 👇 FIXED: Check 'responsibilityScore' correctly
        studentScore: tx.studentScore !== undefined
            ? tx.studentScore
            : (tx.user?.responsibilityScore ?? 100),

        destination: tx.destination || "N/A",
        purpose: tx.purpose || "N/A",
        checkoutPhoto: tx.checkoutPhoto || "",
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
    }), [tx]);

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
                            <Loader2 className="h-4 w-4 animate-spin" />
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
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.email')}</div>
                                    <div className="font-semibold text-gray-900">{data.userEmail}</div>
                                </div>
                            </div>
                            
                        </CardContent>
                    </Card>

                    {/* 2. Equipment Information */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 font-bold">{t('checkouts.dialog.equipInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">{t('checkouts.dialog.equipName')}</div>
                                    <div className="font-semibold text-gray-900">{data.equipmentName}</div>
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

                    {/* 4. Condition Photo */}
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
                                {data.checkoutPhoto ? (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        <img
                                            src={data.checkoutPhoto}
                                            alt="Equipment Condition"
                                            className="w-full h-auto object-cover max-h-[400px]"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/800x600?text=Image+Load+Error";
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-32 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                        {t('checkouts.dialog.noPhoto')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}