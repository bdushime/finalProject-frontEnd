import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-neutral-200">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">2. Scan</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">3. Photo</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">4. Details</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">5. Sign</li>
        </ol>
    );
}

export default function ScanQRCode() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [scanned, setScanned] = useState(false);

    // Safety: Go back if no item selected
    useEffect(() => {
        if (!state?.equipment) navigate('/it/checkout/select');
        
        // Simulate scanning process
        const timer = setTimeout(() => {
            setScanned(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [state, navigate]);

    const handleNext = () => {
        navigate('/it/checkout/photo', { state: { ...state } });
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Scan QR</h2>
                <Progress />
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Item</CardTitle>
                        <CardDescription>Scanning: {state?.equipment?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-[4/3] rounded-xl bg-neutral-900 grid place-items-center relative">
                            {!scanned ? (
                                <>
                                    <div className="absolute inset-6 rounded-xl border-2 border-blue-600 animate-pulse" />
                                    <QrCode className="h-16 w-16 text-white opacity-50" />
                                    <p className="absolute bottom-4 text-white text-sm">Align QR Code...</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-green-400">
                                    <CheckCircle2 className="h-16 w-16 mb-2" />
                                    <span className="font-bold text-white">Verified!</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                            <Button onClick={handleNext} disabled={!scanned}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}