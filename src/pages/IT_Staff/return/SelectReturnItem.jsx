import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarClock, User, Package } from "lucide-react";
import { format } from "date-fns";
import api from "@/utils/api";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan/Photo</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Done</li>
        </ol>
    );
}

export default function SelectReturnItem() {
    const [activeTransactions, setActiveTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActive = async () => {
            try {
                // Fetch from the new route we created in transactions.js
                const res = await api.get('/transactions/active');
                setActiveTransactions(res.data);
            } catch (err) {
                console.error("Failed to fetch active loans", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActive();
    }, []);

    const handleSelect = (transaction) => {
        // Navigate to the scan page, passing ALL necessary IDs for the return
        // We need equipmentId and userId for the backend 'checkin' route
        navigate('/it/return/scan', {
            state: {
                transactionId: transaction._id,
                equipmentId: transaction.equipment?._id,
                userId: transaction.user?._id,
                equipmentName: transaction.equipment?.name,
                studentName: transaction.user?.username
            }
        });
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Return – Select Item</h2>
                <Progress />

                <Card>
                    <CardHeader>
                        <CardTitle>Borrowed Items ({activeTransactions.length})</CardTitle>
                        <CardDescription>Choose the item being returned by the student.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : activeTransactions.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
                                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>No active borrows found.</p>
                                <p className="text-xs text-slate-400">All equipment is currently in stock.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeTransactions.map((tx) => (
                                    <Card key={tx._id} className="hover:border-blue-400 hover:shadow-md transition-all group">
                                        <CardContent className="p-4 space-y-3">
                                            {/* Item Name */}
                                            <div>
                                                <div className="font-bold text-slate-900 flex justify-between items-start">
                                                    <span className="truncate">{tx.equipment?.name || "Unknown Item"}</span>
                                                    {tx.status === 'Overdue' && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                            Late
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono">
                                                    SN: {tx.equipment?.serialNumber}
                                                </div>
                                            </div>

                                            {/* Student Info */}
                                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="truncate font-medium">
                                                    {tx.user?.username || "Unknown Student"}
                                                </span>
                                            </div>

                                            {/* Due Date */}
                                            <div className={`flex items-center gap-2 text-xs ${tx.status === 'Overdue' ? 'text-red-500 font-medium' : 'text-slate-500'
                                                }`}>
                                                <CalendarClock className="w-3 h-3" />
                                                <span>
                                                    Due: {tx.expectedReturnTime ? format(new Date(tx.expectedReturnTime), 'MMM dd, HH:mm') : 'N/A'}
                                                </span>
                                            </div>

                                            <Button
                                                className="w-full mt-2 group-hover:bg-blue-600"
                                                onClick={() => handleSelect(tx)}
                                            >
                                                Select for Return
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}