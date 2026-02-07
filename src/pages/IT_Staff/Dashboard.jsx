import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import DashboardCards from "@/components/dashboard/DashboardCards";
import Charts from "@/components/dashboard/Charts";
import api from "@/utils/api";
import { Loader2, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New State for Rejection Logic
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch Dashboard Data
  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // --- HANDLERS ---

  // 1. Approve Request
  const handleApprove = async (id) => {
    try {
      await api.put(`/transactions/${id}/respond`, { action: 'Approve' });
      toast.success("Request Approved");
      fetchStats(); // Refresh data
    } catch (err) {
      toast.error("Failed to approve request");
    }
  };

  // 2. Open Reject Dialog
  const openRejectDialog = (id) => {
    setSelectedTxId(id);
    setRejectionReason(""); // Reset reason
    setIsRejectOpen(true);
  };

  // 3. Submit Rejection
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/transactions/${selectedTxId}/respond`, { 
        action: 'Deny', 
        reason: rejectionReason // Send reason to backend
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

  if (loading) {
    return (
      <ITStaffLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </ITStaffLayout>
    );
  }

  // Helper to find pending items in recent activity
  const pendingRequests = stats?.recentActivity?.filter(item => item.status === 'Pending') || [];

  return (
    <ITStaffLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* 1. Summary Cards */}
        <DashboardCards metricsData={stats?.metrics} />

        {/* 2. Main Grid (Charts) */}
        <Charts 
          chartData={stats?.charts} 
          recentActivityData={stats?.recentActivity}
          metrics={stats?.metrics} 
        />

        {/* 3. Pending Requests Section (If you want it directly on dashboard) */}
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

        {/* 4. REJECTION REASON DIALOG */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deny Request</DialogTitle>
              <DialogDescription>
                Please enter the reason why you are denying this request. This will be sent to the student.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="e.g., Item is under maintenance, Low responsibility score..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
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