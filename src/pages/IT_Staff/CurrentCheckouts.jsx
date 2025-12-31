import { useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { listActiveCheckouts } from "@/components/lib/equipmentData";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import CheckoutDetailsDialog from "../IT_Staff/checkout/CheckoutDetailsDialog";

export default function CurrentCheckouts() {
    const active = listActiveCheckouts();
    const [selectedCheckout, setSelectedCheckout] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRowClick = (checkout) => {
        setSelectedCheckout(checkout);
        setIsDialogOpen(true);
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Checkouts</h2>
                
                {/* Table Container Card */}
                <div className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-[#0b1d3a] border-b border-gray-100">
                                <tr className="text-white">
                                    <th className="px-6 py-4 font-semibold text-left">Item</th>
                                    <th className="px-6 py-4 font-semibold text-left">Checked Out</th>
                                    <th className="px-6 py-4 font-semibold text-left">Due Date</th>
                                    <th className="px-6 py-4 font-semibold text-left">Status</th>
                                    <th className="px-6 py-4 font-semibold text-left">Actions</th>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {active.map((row) => (
                                    <motion.tr 
                                        key={row.checkoutId} 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                                        onClick={() => handleRowClick(row)}
                                    >
                                        {/* Item Column with Left Border Accent */}
                                        <td className="px-0 font-medium text-gray-900 relative">
                                            <div className="flex items-center h-full">
                                                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#0b1d3a] rounded-r"></div>
                                                <span className="pl-6">{row.equipmentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600">{row.checkedOutAt}</td>
                                        <td className="px-6 py-5 text-gray-600">{row.dueDate}</td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex rounded-full bg-[#0891b2] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                Borrowed
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(row);
                                                }}
                                                className="text-[#126dd5] hover:bg-blue-50 px-2 font-medium"
                                            >
                                                <Eye className="h-4 w-4 mr-1.5" />
                                                View Details
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Checkout Details Dialog */}
                <CheckoutDetailsDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    selectedCheckout={selectedCheckout}
                />
            </div>
        </ITStaffLayout>
    );
}
