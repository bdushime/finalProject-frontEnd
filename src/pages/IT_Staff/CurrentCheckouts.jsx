import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Plus, Check, X } from "lucide-react";
import CheckoutDetailsDialog from "../IT_Staff/checkout/CheckoutDetailsDialog"; 
import api from "@/utils/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function CurrentCheckouts() {
    const navigate = useNavigate();
    const [active, setActive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCheckout, setSelectedCheckout] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch Transactions
    const fetchActive = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transactions/active');
            
            const mappedData = res.data.map(tx => ({
                checkoutId: tx._id,
                equipmentName: tx.equipment?.name || "Unknown Item",
                checkedOutAt: tx.createdAt ? format(new Date(tx.createdAt), 'MMM dd, HH:mm') : 'N/A',
                dueDate: tx.expectedReturnTime ? format(new Date(tx.expectedReturnTime), 'MMM dd, HH:mm') : 'N/A',
                status: tx.status,
                // 👇 FIXED: correctly map responsibilityScore
                fullData: { 
                    ...tx, 
                    studentScore: tx.user?.responsibilityScore !== undefined ? tx.user.responsibilityScore : 100
                }
            }));

            setActive(mappedData);
        } catch (err) {
            console.error("Failed to fetch checkouts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActive();
    }, []);

    const handleRowClick = (checkout) => {
        setSelectedCheckout(checkout.fullData);
        setIsDialogOpen(true);
    };

    // Handle Approve / Deny Logic
    const handleResponse = async (e, id, action) => {
        e.stopPropagation(); // Stop row click so dialog doesn't open
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            await api.put(`/transactions/${id}/respond`, { action });
            fetchActive(); // Reload data to show updated status immediately
        } catch (err) {
            console.error("Action failed", err);
            alert("Failed to update request.");
        }
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header with Title and NEW CHECKOUT BUTTON */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Active Requests & Loans</h2>
                    <Button 
                        onClick={() => navigate('/it/checkout/select')} 
                        className="bg-[#0b1d3a] hover:bg-[#1a2f55]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Checkout
                    </Button>
                </div>
                
                <div className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-[#0b1d3a] border-b border-gray-100">
                                <tr className="text-white">
                                    <th className="px-6 py-4 font-semibold text-left">Item</th>
                                    <th className="px-6 py-4 font-semibold text-left">Date</th>
                                    <th className="px-6 py-4 font-semibold text-left">Status</th>
                                    <th className="px-6 py-4 font-semibold text-left">Actions</th>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                                Loading...
                                            </div>
                                        </td>
                                    </tr>
                                ) : active.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            No active requests or checkouts found.
                                        </td>
                                    </tr>
                                ) : (
                                    active.map((row) => (
                                        <motion.tr 
                                            key={row.checkoutId} 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                                            onClick={() => handleRowClick(row)}
                                        >
                                            <td className="px-0 font-medium text-gray-900 relative">
                                                <div className="flex items-center h-full">
                                                    {/* Color stripe changes based on status */}
                                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                                                        row.status === 'Pending' ? 'bg-yellow-500' : 
                                                        row.status === 'Overdue' ? 'bg-red-600' :
                                                        'bg-[#0b1d3a]'
                                                    }`}></div>
                                                    <span className="pl-6">{row.equipmentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">{row.checkedOutAt}</td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
                                                    row.status === 'Pending' ? 'bg-yellow-500' :
                                                    row.status === 'Overdue' ? 'bg-red-500' : 
                                                    'bg-[#0891b2]'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {/* CONDITIONAL BUTTONS: Show Approve/Deny ONLY if Pending */}
                                                {row.status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 shadow-sm"
                                                            onClick={(e) => handleResponse(e, row.checkoutId, 'Approve')}
                                                            title="Approve Request"
                                                        >
                                                            <Check className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-red-600 hover:bg-red-700 text-white h-8 px-2 shadow-sm"
                                                            onClick={(e) => handleResponse(e, row.checkoutId, 'Deny')}
                                                            title="Deny Request"
                                                        >
                                                            <X className="h-4 w-4 mr-1" /> Deny
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                                                        className="text-[#126dd5] hover:bg-blue-50 px-2 font-medium"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1.5" /> View Details
                                                    </Button>
                                                )}
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