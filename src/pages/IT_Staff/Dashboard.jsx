import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import StatsOverview from "./components/Dashboard/StatsOverview";
import Charts from "@/components/dashboard/Charts";
import SystemHealth from "./components/Dashboard/SystemHealth";
import api from "@/utils/api";
import { Loader2, Plus, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: "IT Staff" });

    // --- REJECTION LOGIC STATE (Merged from bottom) ---
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    // --- 1. FETCH DATA ---
    const fetchStats = async () => {
        try {
            // Fetch analytics
            const res = await api.get('/analytics/dashboard');
            setStats(res.data);

            // Fetch profile
            try {
                const profileRes = await api.get('/users/profile');
                if (profileRes.data) {
                    setUser({ name: profileRes.data.fullName || profileRes.data.username || "IT Staff" });
                }
            } catch (e) {
                // ignore if profile fetch fails
            }
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // --- 2. HANDLERS (Merged) ---

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    // Approve Request
    const handleApprove = async (id) => {
        try {
            await api.put(`/transactions/${id}/respond`, { action: 'Approve' });
            toast.success("Request Approved");
            fetchStats(); // Refresh data
        } catch (err) {
            toast.error("Failed to approve request");
        }
    };

    // Open Reject Dialog
    const openRejectDialog = (id) => {
        setRejectId(id);
        setRejectionReason("");
        setIsRejectOpen(true);
    };

    // Submit Rejection
    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }

        setProcessing(true);
        try {
            await api.put(`/transactions/${rejectId}/respond`, { 
                action: 'Deny', 
                reason: rejectionReason 
            });
            toast.success("Request Denied");
            setIsRejectOpen(false);
            fetchStats(); // Refresh data
        } catch (err) {
            console.error(err);
            toast.error("Failed to deny request");
        } finally {
            setProcessing(false);
        }
    };

    // --- 3. PREPARE DATA ---
    
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).format(new Date());

    // Filter pending requests from recent activity
    const pendingRequests = stats?.recentActivity?.filter(item => item.status === 'Pending') || [];
    const overviewStats = stats?.metrics || {};

    if (loading) {
        return (
            <ITStaffLayout>
                <div className="h-[80vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </ITStaffLayout>
        );
    }

    return (
        <ITStaffLayout maxWidth="max-w-full">
            <div className="fixed inset-0 bg-gradient-to-br from-white via-white to-[#f0f9ff] -z-10 pointer-events-none" />

            <div className="space-y-8 pb-10">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-4xl md:text-5xl font-light text-[#0b1d3a] tracking-tight mb-2">
                            {getGreeting()}, <span className="font-medium">{user.name}</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-light">{formattedDate}</p>
                        <div className="mt-2">
                            <SystemHealth />
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-6">
                        <StatsOverview stats={overviewStats} />
                    </div>
                </div>

                {/* --- CHARTS --- */}
                <div className="grid grid-cols-1 gap-6">
                    <Charts
                        chartData={stats?.charts}
                        recentActivityData={stats?.recentActivity}
                        metrics={stats?.metrics}
                    />
                </div>

                {/* --- PENDING REQUESTS SECTION --- */}
                {pendingRequests.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Requests</h3>
                        <div className="space-y-3">
                            {pendingRequests.map((req) => (
                                <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg bg-gray-50 gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {req.user?.username || "Unknown User"}
                                            <span className="font-normal text-gray-500"> wants </span>
                                            {req.equipment?.name || "Unknown Item"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Requested: {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            onClick={() => handleApprove(req._id)}
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </Button>
                                        <Button
                                            onClick={() => openRejectDialog(req._id)}
                                            variant="destructive"
                                            className="flex-1 sm:flex-none gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Deny
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- REJECTION REASON DIALOG --- */}
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                    <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-lg">
                        <DialogHeader>
                            <DialogTitle>Deny Request</DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Please enter the reason why you are denying this request. This will be sent to the student.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="e.g., Item is under maintenance, Low responsibility score..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px] bg-white border-gray-300 focus:border-blue-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleRejectSubmit} disabled={processing}>
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Confirm Denial
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </ITStaffLayout>
    );
}