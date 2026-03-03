import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";

// Helper Component for the Progress Bar
function Progress({ step }) {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className={`px-2 py-1 rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-neutral-200"}`}>1. Select</li>
            <li className={`px-2 py-1 rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-neutral-200"}`}>2. Scan/Photo</li>
            <li className={`px-2 py-1 rounded-full ${step >= 3 ? "bg-green-600 text-white" : "bg-neutral-200"}`}>3. Done</li>
        </ol>
    );
}

export default function ReturnScan() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // States for the UI flow
    const [isScanning, setIsScanning] = useState(true);
    const [scanComplete, setScanComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // 1. Simulate a Camera/QR Scan on load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
        }, 2000); // Fakes a 2-second scan process
        return () => clearTimeout(timer);
    }, []);

    // 2. The Logic to Call Backend
    const handleConfirmReturn = async () => {
        if (!state) return;
        setSubmitting(true);

        try {
            // Call the Check-In Route we built in transactions.js
            await api.post('/transactions/checkin', {
                userId: state.userId,
                equipmentId: state.equipmentId,
                condition: "Good" // Defaulting to Good for this demo
            });

            setSuccess(true); // Move to Step 3
        } catch (err) {
            console.error("Return failed", err);
            toast.error("Failed to process return. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Safety: If someone goes to this page directly without selecting an item
    if (!state) {
        return (
            <ITStaffLayout>
                <div className="p-8 text-center">
                    <p>No item selected. Please go back.</p>
                    <Button onClick={() => navigate('/it/return/select-item')} className="mt-4">Go Back</Button>
                </div>
            </ITStaffLayout>
        );
    }

    // --- RENDER SUCCESS VIEW (STEP 3) ---
    if (success) {
        return (
            <ITStaffLayout>
                <div className="p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg font-semibold mb-2">Return Complete</h2>
                    <Progress step={3} />
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-800">Return Successful!</h3>
                            <p className="text-green-700 text-center max-w-md">
                                <strong>{state.equipmentName}</strong> has been marked as returned.
                                The inventory and student responsibility score have been updated.
                            </p>
                            <Button onClick={() => navigate('/it/dashboard')} className="mt-4 bg-green-600 hover:bg-green-700">
                                Return to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ITStaffLayout>
        );
    }

    // --- RENDER SCANNING VIEW (STEP 2) ---
    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Return – Scan & Verify</h2>
                <Progress step={2} />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isScanning ? "Scanning Item..." : "Item Verified"}
                        </CardTitle>
                        <CardDescription>
                            {isScanning ? "Align the QR code within the frame" : `Ready to return: ${state.equipmentName}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">

                        {/* Left Side: Camera/Scanner Simulation */}
                        <div className="aspect-[4/3] rounded-xl bg-neutral-900 grid place-items-center relative overflow-hidden">
                            {isScanning ? (
                                <>
                                    {/* Animated Scanner Line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                                    <QrCode className="h-16 w-16 text-neutral-700 opacity-50" />
                                    <p className="absolute bottom-4 text-white text-sm font-medium animate-pulse">Scanning...</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-green-400">
                                    <CheckCircle2 className="h-16 w-16 mb-2" />
                                    <span className="font-bold">Match Found</span>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Details & Action */}
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <h4 className="font-medium text-sm text-slate-500">Returning Item</h4>
                                <p className="text-lg font-bold text-slate-900">{state.equipmentName}</p>
                                <div className="h-px bg-slate-200 my-2" />
                                <h4 className="font-medium text-sm text-slate-500">Student</h4>
                                <p className="text-base text-slate-800">{state.studentName || "Unknown"}</p>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!scanComplete || submitting}
                                    onClick={handleConfirmReturn}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Return <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Simple CSS animation for the scanner line */}
            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </ITStaffLayout>
    );
}