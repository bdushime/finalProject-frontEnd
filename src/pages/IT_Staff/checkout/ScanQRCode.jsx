import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import QRCodeScanner from "@/components/QRCodeScanner";
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
    const [scanResult, setScanResult] = useState("");
    const [scanError, setScanError] = useState(null);

    // Safety: Go back if no item selected
    useEffect(() => {
        if (!state?.equipment) navigate('/it/checkout/select');
    }, [state, navigate]);

    const handleScanSuccess = (decodedText) => {
        // Validation: Must match the selected equipment's serial number or ID
        const isMatch = decodedText === state.equipment.serialNumber ||
            decodedText === state.equipment._id;

        if (!isMatch) {
            setScanError(`Invalid QR Code. This code does not match the selected item: ${state.equipment.name}.`);
            return;
        }

        setScanError(null);
        setScanResult(decodedText);
        setScanned(true);
    };

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
                        <div className={`aspect-[4/3] rounded-xl bg-neutral-900 border-4 ${scanError ? 'border-rose-500' : 'border-neutral-800'} overflow-hidden h-[300px] grid place-items-center relative transition-colors`}>
                            {!scanned ? (
                                <div className="w-full h-full relative">
                                    <QRCodeScanner onScanSuccess={handleScanSuccess} />
                                    {scanError && (
                                        <div className="absolute top-4 inset-x-4 z-20 animate-in slide-in-from-top-2">
                                            <div className="bg-rose-600 text-white p-3 rounded-xl flex items-center gap-2 shadow-lg border border-rose-400">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p className="text-xs font-bold">{scanError}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/20 whitespace-nowrap z-10 pointer-events-none">
                                        Align QR Code within frame
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white z-10 w-full p-8 animate-in zoom-in-95">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Verified Successfully</p>

                                    <div className="w-full space-y-4 max-w-sm">
                                        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-center">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Scanned Tag</p>
                                            <code className="text-lg font-mono text-white tracking-widest">
                                                {scanResult}
                                            </code>
                                        </div>

                                        <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1">Matched Equipment</p>
                                            <p className="text-sm font-bold text-white mb-1">{state?.equipment?.name}</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                Digital accountability log updated via Security Office protocol.
                                            </p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setScanned(false); setScanResult(""); setScanError(null); }}
                                            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-2" /> Reset & Re-scan
                                        </Button>
                                    </div>
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