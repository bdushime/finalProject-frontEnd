import { useEffect, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Loader2, CalendarClock, Clock, AlertCircle } from "lucide-react";
import BackButton from "./components/BackButton";
import ExtendModal from "@/components/ui/ExtendModal"; 
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";

export default function MyBorrowedItems() {
    const navigate = useNavigate();
    
    // --- REAL DATA STATE ---
    const [pendingRequests, setPendingRequests] = useState([]); // <--- NEW STATE
    const [activeLoans, setActiveLoans] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [selectedItemForExtend, setSelectedItemForExtend] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activeRes, historyRes] = await Promise.all([
                    api.get('/transactions/my-borrowed'),
                    api.get('/transactions/my-history')
                ]);

                // 1. FILTER PENDING (New)
                const pending = activeRes.data.filter(t => t.status === 'Pending');
                
                // 2. FILTER ACTIVE LOANS (Borrowed/Checked Out/Overdue)
                const borrowed = activeRes.data.filter(t => 
                    t.status === 'Borrowed' || 
                    t.status === 'Checked Out' || // Added Checked Out to be safe
                    t.status === 'Overdue'
                );

                // 3. FILTER RESERVED
                const reserved = activeRes.data.filter(t => t.status === 'Reserved');

                setPendingRequests(pending);
                setActiveLoans(borrowed);
                setReservations(reserved);
                
                const returnedOnly = historyRes.data.filter(item => item.status === 'Returned');
                setHistoryList(returnedOnly);
                
            } catch (err) {
                console.error("Failed to fetch loans:", err);
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

    const getCountdown = (dueDate) => {
        if (!dueDate) return null;
        const diffMs = new Date(dueDate) - new Date();
        if (diffMs <= 0) return { hours: 0, mins: 0, overdue: true };
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { hours, mins, overdue: false };
    };

    const handleReturn = (item) => {
        navigate(`/student/return?itemId=${item.equipment?._id}`);
    };

    const handleExtend = (item) => {
        setSelectedItemForExtend(item);
        setExtendModalOpen(true);
    };

    // --- CANCEL LOGIC ---
    const handleCancelReservation = async (id) => {
        if(!confirm("Are you sure you want to cancel this reservation?")) return;
        try {
            await api.post(`/transactions/cancel/${id}`);
            setReservations(prev => prev.filter(item => item._id !== id));
            alert("Reservation cancelled successfully.");
        } catch (err) {
            console.error("Cancel failed:", err);
            alert("Failed to cancel. Please try again.");
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading your items...
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="min-h-screen bg-white p-6 lg:p-8 font-sans text-slate-600">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <BackButton to="/student/dashboard" className="mb-4" />
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">My Equipment</h1>
                        <p className="text-slate-500 mt-1">Manage your active loans and upcoming reservations</p>
                    </div>

                    {/* --- 1. PENDING REQUESTS (NEW SECTION) --- */}
                    {pendingRequests.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                Pending Requests
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
                                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pending Approval</Badge>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-yellow-100 text-xs text-slate-500">
                                            <span className="font-semibold text-yellow-700">Status:</span> Waiting for IT Staff to approve this request. You cannot pick it up yet.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 2. UPCOMING RESERVATIONS --- */}
                    {reservations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-purple-600" />
                                Upcoming Reservations
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
                                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">Reserved</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="w-full text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-100"
                                                onClick={() => alert("Please ask Admin to check out this item.")}
                                            >
                                                Check In / Pick Up
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                className="w-auto text-xs h-8 text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleCancelReservation(res._id)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 3. ACTIVE LOANS SECTION --- */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#0b1d3a]">Active Loans</h2>
                        
                        {activeLoans.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeLoans.map((transaction) => {
                                    const countdown = getCountdown(transaction.expectedReturnTime);
                                    const isOverdue = new Date() > new Date(transaction.expectedReturnTime);
                                    
                                    return (
                                        <div key={transaction._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#126dd5]/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[#0b1d3a] text-base">{transaction.equipment?.name || "Unknown Item"}</h3>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                            {transaction.equipment?.serialNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                                    isOverdue || transaction.status === 'Overdue'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                    {isOverdue ? 'Overdue' : 'Active'}
                                                </Badge>
                                            </div>

                                            {/* Timer Info */}
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                                <div className="text-xs text-slate-500">
                                                    Due: <span className="font-semibold text-slate-700">
                                                        {new Date(transaction.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {countdown && !countdown.overdue && (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-mono font-bold text-[#0b1d3a] text-lg">
                                                            {countdown.hours.toString().padStart(2, '0')}:{countdown.mins.toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">left</span>
                                                    </div>
                                                )}
                                                {countdown?.overdue && (
                                                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Late
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleExtend(transaction)}
                                                    className="h-9 rounded-lg text-slate-600 hover:text-[#0b1d3a] hover:bg-slate-50 text-xs font-semibold"
                                                >
                                                    Extend Time
                                                </Button>
                                                <Button
                                                    onClick={() => handleReturn(transaction)}
                                                    className="h-9 rounded-lg bg-[#0b1d3a] hover:bg-[#2c3e50] text-white text-xs font-semibold shadow-sm"
                                                >
                                                    Return Item
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-slate-500">No active loans found.</p>
                            </div>
                        )}
                    </div>

                    {/* --- 4. HISTORY SECTION --- */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#0b1d3a]">History</h2>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="border-b border-slate-200">
                                        <TableHead className="py-3 pl-6 font-semibold text-[#0b1d3a] text-xs uppercase">Equipment</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase">Checkout</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase">Return</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                                                No returned items found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historyList.map((item) => (
                                            <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <TableCell className="py-3 pl-6 font-medium text-[#0b1d3a] text-sm">
                                                    {item.equipment?.name || "Unknown"}
                                                </TableCell>
                                                <TableCell className="py-3 text-slate-500 text-sm">{formatDate(item.createdAt)}</TableCell>
                                                <TableCell className="py-3 text-slate-500 text-sm">{formatDate(item.returnTime)}</TableCell>
                                                <TableCell className="py-3">
                                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        Returned
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {extendModalOpen && (
                    <ExtendModal
                        isOpen={extendModalOpen}
                        onClose={() => setExtendModalOpen(false)}
                        item={selectedItemForExtend}
                        onConfirm={() => { alert("Extend request sent!"); setExtendModalOpen(false); }}
                    />
                )}
            </div>
        </StudentLayout>
    );
}