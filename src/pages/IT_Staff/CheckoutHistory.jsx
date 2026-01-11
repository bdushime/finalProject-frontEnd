import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input"; // Make sure Input path is correct
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/utils/api";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function CheckoutHistory() {
    const [q, setQ] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Full History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/all-history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Filter Logic (Client Side)
    const filteredRows = history.filter((item) => {
        const searchLower = q.toLowerCase();
        const itemName = item.equipment?.name?.toLowerCase() || "";
        const userName = item.user?.username?.toLowerCase() || "";
        const status = item.status?.toLowerCase() || "";
        
        return itemName.includes(searchLower) || 
               userName.includes(searchLower) || 
               status.includes(searchLower);
    });

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
                    <h2 className="text-lg font-semibold">Checkout History</h2>
                    <div className="w-full sm:max-w-xs">
                        <Input 
                            label="Search" 
                            value={q} 
                            onChange={(e) => setQ(e.target.value)} 
                            placeholder="Search item, student, or status..." 
                            className="bg-white"
                        />
                    </div>
                </div>

                <div className="rounded-2xl shadow-lg bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm border-separate border-spacing-y-2 border-spacing-x-0">
                            <TableHeader className="text-left bg-gray-900 text-white">
                                <TableRow className="hover:bg-gray-900">
                                    <th className="px-4 py-3 rounded-l-lg">Item</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Checked Out</th>
                                    <th className="px-4 py-3">Returned</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center py-8">
                                            <div className="flex justify-center">
                                                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                                            No history found matching "{q}".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRows.map((r) => (
                                        <motion.tr 
                                            key={r._id} 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }}
                                            className="bg-gray-50/50 hover:bg-blue-50/50 transition-colors"
                                        >
                                            <TableCell className="px-4 py-3 font-medium">
                                                {r.equipment?.name || "Unknown Item"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {r.user?.username || "Unknown User"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500">
                                                {r.createdAt ? format(new Date(r.createdAt), 'MMM dd, HH:mm') : '-'}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500">
                                                {r.returnTime ? format(new Date(r.returnTime), 'MMM dd, HH:mm') : "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold
                                                    ${r.status === 'Returned' ? 'bg-green-100 text-green-700' : 
                                                      r.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                                                      'bg-blue-100 text-blue-700'}`}>
                                                    {r.status}
                                                </span>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </ITStaffLayout>
    );
}