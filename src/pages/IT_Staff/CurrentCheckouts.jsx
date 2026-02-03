import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Plus, Check, X, Calendar, Clock } from "lucide-react"; // Added Icons
import CheckoutDetailsDialog from "../IT_Staff/checkout/CheckoutDetailsDialog"; 
import api from "@/utils/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // For notifications

export default function CurrentCheckouts() {
    const navigate = useNavigate();
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCheckout, setSelectedCheckout] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Tabs state: 'requests' | 'reservations' | 'active'
    const [currentTab, setCurrentTab] = useState('requests'); 

    // --- 1. FETCH TRANSACTIONS ---
    const fetchActive = async () => {
        setLoading(true);
        try {
            // This endpoint now returns Pending, Checked Out, AND Reserved items
            const res = await api.get('/transactions/active');
            
            const mappedData = res.data.map(tx => ({
                checkoutId: tx._id,
                equipmentName: tx.equipment?.name || "Unknown Item",
                // Show Start Time for Reservations, CreatedAt for others
                dateDisplay: tx.status === 'Reserved' 
                    ? format(new Date(tx.startTime), 'MMM dd, HH:mm') 
                    : format(new Date(tx.createdAt), 'MMM dd, HH:mm'),
                status: tx.status,
                startTime: tx.startTime, // Needed for reservation logic
                fullData: { 
                    ...tx, 
                    studentScore: tx.user?.responsibilityScore ?? 100
                }
            }));

            setAllTransactions(mappedData);
        } catch (err) {
            console.error("Failed to fetch checkouts", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActive();
    }, []);

    // --- 2. FILTERING LOGIC ---
    useEffect(() => {
        if (!allTransactions) return;

        let result = [];
        if (currentTab === 'requests') {
            result = allTransactions.filter(t => t.status === 'Pending');
        } else if (currentTab === 'reservations') {
            result = allTransactions.filter(t => t.status === 'Reserved');
        } else if (currentTab === 'active') {
            result = allTransactions.filter(t => ['Checked Out', 'Overdue'].includes(t.status));
        }
        setFilteredData(result);
    }, [currentTab, allTransactions]);


    // --- 3. ACTIONS ---

    const handleRowClick = (checkout) => {
        setSelectedCheckout(checkout.fullData);
        setIsDialogOpen(true);
    };

    // Approve / Deny / Check Out (Reservation)
    const handleResponse = async (e, id, action) => {
        e.stopPropagation(); 
        
        // Custom message based on action
        const actionText = action === 'Approve' ? "approve/check-out" : "deny";
        if (!confirm(`Are you sure you want to ${actionText} this item?`)) return;

        try {
            // 'Approve' on a Reservation converts it to 'Checked Out'
            await api.put(`/transactions/${id}/respond`, { action });
            toast.success("Status updated successfully");
            fetchActive(); 
        } catch (err) {
            console.error("Action failed", err);
            toast.error("Failed to update status.");
        }
    };

    // Cancel Reservation
    const handleCancel = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Cancel this reservation?")) return;

        try {
            await api.post(`/transactions/cancel/${id}`);
            toast.success("Reservation cancelled");
            fetchActive();
        } catch (err) {
            toast.error("Failed to cancel");
        }
    };

    // Helper: Is reservation ready? (Within 30 mins of start time)
    const isReservationReady = (startTimeString) => {
        if (!startTimeString) return false;
        const start = new Date(startTimeString);
        const now = new Date();
        const diffMinutes = (start - now) / 1000 / 60;
        return diffMinutes <= 30; 
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
                
                {/* Header */}
                {/* <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Transactions</h2>
                        <p className="text-gray-500 text-sm">Handle requests, upcoming reservations, and active loans.</p>
                    </div>
                    <Button 
                        onClick={() => navigate('/it/checkout/select')} 
                        className="bg-[#0b1d3a] hover:bg-[#1a2f55]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Manual Checkout
                    </Button>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setCurrentTab('requests')}
                        className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 ${currentTab === 'requests' ? 'border-[#0b1d3a] text-[#0b1d3a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Requests
                        {allTransactions.filter(t => t.status === 'Pending').length > 0 && 
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">{allTransactions.filter(t => t.status === 'Pending').length}</span>
                        }
                    </button>
                    <button 
                        onClick={() => setCurrentTab('reservations')}
                        className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 ${currentTab === 'reservations' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Reservations
                        {allTransactions.filter(t => t.status === 'Reserved').length > 0 && 
                            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">{allTransactions.filter(t => t.status === 'Reserved').length}</span>
                        }
                    </button>
                    <button 
                        onClick={() => setCurrentTab('active')}
                        className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 ${currentTab === 'active' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Active Loans
                    </button>
                </div>
                
                {/* Table */}
                <div className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100 min-h-[400px]">
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-[#0b1d3a] border-b border-gray-100">
                                <tr className="text-white">
                                    <th className="px-6 py-4 font-semibold text-left">Item</th>
                                    <th className="px-6 py-4 font-semibold text-left">
                                        {currentTab === 'reservations' ? 'Start Time' : 'Date'}
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-left">Status</th>
                                    <th className="px-6 py-4 font-semibold text-left">Actions</th>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                                Loading data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-gray-400">
                                            No items found in this category.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row) => (
                                        <motion.tr 
                                            key={row.checkoutId} 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                                            onClick={() => handleRowClick(row)}
                                        >
                                            {/* ITEM NAME */}
                                            <td className="px-0 font-medium text-gray-900 relative">
                                                <div className="flex items-center h-full">
                                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                                                        row.status === 'Pending' ? 'bg-yellow-500' : 
                                                        row.status === 'Reserved' ? 'bg-purple-600' :
                                                        row.status === 'Overdue' ? 'bg-red-600' :
                                                        'bg-[#0b1d3a]'
                                                    }`}></div>
                                                    <span className="pl-6">{row.equipmentName}</span>
                                                </div>
                                            </td>

                                            {/* DATE */}
                                            <td className="px-6 py-5 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {currentTab === 'reservations' ? <Calendar className="w-4 h-4 text-purple-400"/> : <Clock className="w-4 h-4 text-gray-400"/>}
                                                    {row.dateDisplay}
                                                </div>
                                            </td>

                                            {/* STATUS BADGE */}
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                                                    row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    row.status === 'Reserved' ? 'bg-purple-100 text-purple-700' :
                                                    row.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-5">
                                                <div className="flex gap-2">
                                                    
                                                    {/* 1. Pending Request Actions */}
                                                    {row.status === 'Pending' && (
                                                        <>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                                                onClick={(e) => handleResponse(e, row.checkoutId, 'Approve')}>
                                                                <Check className="h-4 w-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={(e) => handleResponse(e, row.checkoutId, 'Deny')}>
                                                                <X className="h-4 w-4 mr-1" /> Deny
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* 2. Reservation Actions */}
                                                    {row.status === 'Reserved' && (
                                                        <>
                                                            {isReservationReady(row.startTime) ? (
                                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3"
                                                                    onClick={(e) => handleResponse(e, row.checkoutId, 'Approve')}>
                                                                    <Check className="h-4 w-4 mr-1" /> Check Out
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic flex items-center h-8">
                                                                    Too early
                                                                </span>
                                                            )}
                                                            <Button size="sm" variant="outline" className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                                                                onClick={(e) => handleCancel(e, row.checkoutId)}>
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* 3. View Details (Always visible) */}
                                                    <Button variant="ghost" size="sm" className="h-8 px-2"
                                                        onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}>
                                                        <Eye className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {selectedCheckout && (
                    <CheckoutDetailsDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        selectedCheckout={selectedCheckout} 
                    />
                )}
            </div>
            
        </ITStaffLayout>
    );
}