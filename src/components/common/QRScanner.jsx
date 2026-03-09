import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const [isStarting, setIsStarting] = useState(true);

    useEffect(() => {
        const qrCodeId = "qr-reader";
        let html5QrCode;

        const startScanner = async () => {
            try {
                html5QrCode = new Html5Qrcode(qrCodeId);
                scannerRef.current = html5QrCode;

                // You can customize camera preferences here
                const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

                await html5QrCode.start(
                    { facingMode: "environment" }, // Prioritize back camera
                    config,
                    (decodedText, decodedResult) => {
                        // Success callback
                        if (html5QrCode) {
                            html5QrCode.stop().then(() => {
                                onScanSuccess(decodedText);
                            }).catch(err => {
                                console.error("Failed to stop scanner after success", err);
                                onScanSuccess(decodedText);
                            });
                        }
                    },
                    (errorMessage) => {
                        // ignore errors as they heavily spam console
                    }
                );
                setIsStarting(false);
            } catch (err) {
                console.error("Camera access failed", err);
                setIsStarting(false);
                toast.error("Camera access failed. Please ensure permissions are granted.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && html5QrCode?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full max-w-md mx-auto aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
            {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="font-semibold text-sm">Initializing Camera...</span>
                </div>
            )}
            <div id="qr-reader" className="w-full h-full relative" />
        </div>
    );
}
