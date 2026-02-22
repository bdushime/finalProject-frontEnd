import { useEffect, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Loader2, CalendarClock, Clock, AlertCircle, CheckCircle, ArrowRight, History, MoreVertical, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageContainer } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import ExtendModal from "@/components/ui/extendmodal";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner"; // Assuming you use sonner for toasts

export default function MyBorrowedItems() {
    const navigate = useNavigate();
    const { t } = useTranslation("student");
    
    // --- REAL DATA STATE ---
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [selectedItemForExtend, setSelectedItemForExtend] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // active | history

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeRes, historyRes] = await Promise.all([
                    api.get('/transactions/my-borrowed'),
                    api.get('/transactions/my-history')
                ]);

                // 1. FILTER PENDING (Initial Checkout Requests)
                const pending = activeRes.data.filter(t => t.status === 'Pending');

                // 2. FILTER ACTIVE BORROWS (Now includes 'Pending Return')
                const borrowed = activeRes.data.filter(t =>
                    t.status === 'Borrowed' ||
                    t.status === 'Checked Out' ||
                    t.status === 'Overdue' ||
                    t.status === 'Pending Return' // 👈 Added this status
                );

                // 3. FILTER RESERVED
                const reserved = activeRes.data.filter(t => t.status === 'Reserved');

                setPendingRequests(pending);
                setActiveBorrows(borrowed);
                setReservations(reserved);

                const returnedOnly = historyRes.data.filter(item => item.status === 'Returned');
                setHistoryList(returnedOnly);

            } catch (err) {
                console.error("Failed to fetch borrows:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HELPERS ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysLeft = (dueDate) => {
        if (!dueDate) return 0;
        const diff = new Date(dueDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
    
    const getCountdown = (dueDate) => {
        if (!dueDate) return null;
        const diffMs = new Date(dueDate) - new Date();
        if (diffMs <= 0) return { hours: 0, mins: 0, overdue: true };
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { hours, mins, overdue: false };
    };

    // --- NEW: REQUEST RETURN LOGIC ---
    const handleRequestReturn = async (transactionId) => {
        if (!confirm("Are you sure you want to request a return? IT Staff will need to approve this.")) return;
        
        try {
            // Send request to backend to update status
            await api.put(`/transactions/${transactionId}/request-return`);
            
            toast.success("Return request sent successfully!");
            
            // Optimistically update the UI so the button changes immediately
            setActiveBorrows(prev => prev.map(item => 
                item._id === transactionId ? { ...item, status: 'Pending Return' } : item
            ));
        } catch (err) {
            console.error("Return request failed:", err);
            toast.error("Failed to request return. Please try again.");
        }
    };

    const handleExtend = (item) => {
        setSelectedItemForExtend(item);
        setExtendModalOpen(true);
    };

    // --- CANCEL LOGIC ---
    const handleCancelReservation = async (id) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;
        try {
            await api.post(`/transactions/cancel/${id}`);
            setReservations(prev => prev.filter(item => item._id !== id));
            toast.success(t("borrowed.cancelSuccess"));
        } catch (err) {
            console.error("Cancel failed:", err);
            toast.error(t("borrowed.cancelFailed"));
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" /> {t("borrowed.loading")}
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <PageContainer>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <BackButton to="/student/dashboard" className="mb-4" />
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">{t("borrowed.title")}</h1>
                        <p className="text-slate-500 mt-1">{t("borrowed.trackSubtitle")}</p>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'active'
                                ? 'bg-white text-[#0b1d3a] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t("borrowed.activeItems")}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history'
                                ? 'bg-white text-[#0b1d3a] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t("borrowed.historyTab")}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'active' ? (
                        <>
                            {/* --- 1. PENDING REQUESTS --- */}
                            {pendingRequests.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    <h2 className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                        {t("borrowed.pendingRequests")}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {pendingRequests.map((req) => (
                                            <div key={req._id} className="bg-yellow-50/50 rounded-2xl border border-yellow-200 p-5 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-yellow-100 flex items-center justify-center text-yellow-600">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[#0b1d3a] text-base">{req.equipment?.name}</h3>
                                                            <p className="text-xs text-slate-500">Requested: {new Date(req.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">{t("borrowed.pendingApproval")}</Badge>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-yellow-100 text-xs text-slate-500">
                                                    <span className="font-semibold text-yellow-700">{t("borrowed.status")}:</span> {t("borrowed.waitingApproval")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- 2. UPCOMING RESERVATIONS --- */}
                            {reservations.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    <h2 className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
                                        <CalendarClock className="w-5 h-5 text-purple-600" />
                                        {t("borrowed.upcomingReservations")}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reservations.map((res) => (
                                            <div key={res._id} className="bg-purple-50/50 rounded-2xl border border-purple-100 p-5 shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-purple-600">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-[#0b1d3a] text-base">{res.equipment?.name}</h3>
                                                            <p className="text-xs text-slate-500">Starts: {new Date(res.startTime).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">{t("equipment.reserved")}</Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-100"
                                                        onClick={() => alert("Please ask Admin to check out this item.")}
                                                    >
                                                        {t("borrowed.checkInPickUp")}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-auto text-xs h-8 text-rose-600 hover:bg-rose-50"
                                                        onClick={() => handleCancelReservation(res._id)}
                                                    >
                                                        {t("profile.cancel")}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- 3. ACTIVE BORROWS SECTION --- */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-[#0b1d3a] mb-4">{t("borrowed.activeBorrows")}</h2>
                                {activeBorrows.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {activeBorrows.map((item) => {
                                            const daysLeft = getDaysLeft(item.expectedReturnTime);
                                            const isOverdue = daysLeft < 0;
                                            const isDueSoon = daysLeft <= 1 && daysLeft >= 0;
                                            const countdown = getCountdown(item.expectedReturnTime);
                                            const isPendingReturn = item.status === 'Pending Return';

                                            return (
                                                <div
                                                    key={item._id}
                                                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#126dd5]/30 transition-all group"
                                                >
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#126dd5]">
                                                                <Package className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-[#0b1d3a] mb-1">{item.equipment?.name || "Unknown"}</h3>
                                                                <p className="text-sm text-slate-500 font-medium">{item.equipment?.serialNumber || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#0b1d3a]">
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => navigate('/student/help')}>
                                                                    {t("borrowed.reportIssue")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-rose-600" onClick={() => handleExtend(item)}>
                                                                    {t("borrowed.requestExtension")}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Progress Bar and Timer */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between text-xs font-semibold mb-2">
                                                            <span className="text-slate-500">Due: {formatDate(item.expectedReturnTime)}</span>
                                                            <span className={`${isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-[#126dd5]'}`}>
                                                                {isOverdue ? t("borrowed.overdue") : `${daysLeft} ${t("borrowed.daysLeft")}`}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-500' : 'bg-[#126dd5]'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.max(0, (1 - daysLeft / 7) * 100))}%` }}
                                                            ></div>
                                                        </div>

                                                        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {t("borrowed.timeRemaining")}:
                                                            </div>
                                                            {countdown && !countdown.overdue && (
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="font-mono font-bold text-[#0b1d3a]">
                                                                        {countdown.hours}h {countdown.mins}m
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {countdown?.overdue && (
                                                                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" /> {t("borrowed.overdue")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                        <div className="bg-slate-50 rounded-xl p-3">
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {t("borrowed.borrowed")}
                                                            </div>
                                                            <p className="text-sm font-bold text-[#0b1d3a]">{formatDate(item.createdAt)}</p>
                                                        </div>
                                                        <div className={`rounded-xl p-3 ${isOverdue ? 'bg-rose-50' : 'bg-slate-50'
                                                            }`}>
                                                            <div className={`flex items-center gap-2 text-xs mb-1 ${isOverdue ? 'text-rose-600' : 'text-slate-500'
                                                                }`}>
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {t("borrowed.status")}
                                                            </div>
                                                            <p className={`text-sm font-bold ${isOverdue ? 'text-rose-700' : isPendingReturn ? 'text-yellow-600' : 'text-[#0b1d3a]'
                                                                }`}>
                                                                {item.status}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {/* 👇 DYNAMIC BUTTON LOGIC 👇 */}
                                                        {isPendingReturn ? (
                                                            <Button
                                                                disabled
                                                                className="flex-1 bg-yellow-100 text-yellow-700 font-semibold h-10 rounded-xl cursor-not-allowed"
                                                            >
                                                                Return Requested
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="flex-1 bg-[#0b1d3a] hover:bg-[#2c3e50] text-white font-semibold h-10 rounded-xl shadow-sm"
                                                                onClick={() => handleRequestReturn(item._id)}
                                                            >
                                                                Request Return
                                                            </Button>
                                                        )}
                                                        
                                                        <Button
                                                            variant="outline"
                                                            className="px-4 border-slate-200 hover:bg-slate-50 hover:text-[#0b1d3a] rounded-xl"
                                                            onClick={() => navigate(`/student/equipment/${item.equipment?._id || ''}`)}
                                                        >
                                                            {t("equipment.details")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Add New Item Card */}
                                        <div
                                            onClick={() => navigate('/student/equipment')}
                                            className="group bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-[#126dd5] hover:bg-[#126dd5]/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px]"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 group-hover:border-[#126dd5] flex items-center justify-center mb-4 transition-colors shadow-sm">
                                                <Package className="w-8 h-8 text-slate-400 group-hover:text-[#126dd5]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[#0b1d3a] mb-2">{t("borrowed.borrowMore")}</h3>
                                            <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
                                                {t("borrowed.browseCatalogDesc")}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                className="text-[#126dd5] hover:text-[#0b1d3a] hover:bg-transparent font-semibold"
                                            >
                                                {t("borrowed.browseCatalog")} <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-slate-500">{t("borrowed.noActiveBorrows")}</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => navigate('/student/equipment')}
                                        >
                                            {t("borrowed.browseCatalog")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // HISTORY LIST
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-[#0b1d3a] flex items-center gap-2">
                                    <History className="w-5 h-5 text-slate-400" />
                                    {t("borrowed.pastBorrows")}
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {historyList.map((item) => (
                                    <div key={item._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.status === 'Returned'
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                : 'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}>
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#0b1d3a]">{item.equipment?.name || "Unknown"}</h4>
                                                <p className="text-sm text-slate-500">Returned on {formatDate(item.returnTime || item.updatedAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{t("borrowed.duration")}</p>
                                                <p className="text-sm font-bold text-[#0b1d3a]">
                                                    {item.returnTime && item.createdAt
                                                        ? `${Math.ceil((new Date(item.returnTime) - new Date(item.createdAt)) / (1000 * 60 * 60 * 24))} ${t("borrowed.days")}`
                                                        : "N/A"
                                                    }
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-lg">
                                                {t("borrowed.reportIssue")}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {historyList.length === 0 && (
                                    <div className="p-12 text-center text-slate-500 text-sm">
                                        {t("borrowed.noReturnedItems")}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                                <Button variant="link" className="text-[#126dd5]" onClick={() => navigate('/student/report')}>
                                    {t("borrowed.viewFullHistory")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {extendModalOpen && (
                    <ExtendModal
                        isOpen={extendModalOpen}
                        onClose={() => setExtendModalOpen(false)}
                        item={selectedItemForExtend}
                        onConfirm={() => { alert("Extend request sent!"); setExtendModalOpen(false); }}
                    />
                )}
            </PageContainer>
        </StudentLayout>
    );
}