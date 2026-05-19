import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import Loader from "@/components/common/Loader";

export default function QRScanner({ onScanSuccess, className = "", compact = false }) {
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
                const qrSize = compact ? 200 : 250;
                const config = { fps: 10, qrbox: { width: qrSize, height: qrSize }, aspectRatio: 1.0 };

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
        <div
            className={`relative w-full mx-auto aspect-square bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center ${compact ? "max-w-[300px] rounded-2xl" : "max-w-md rounded-3xl"} ${className}`}
        >
            {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white gap-3">
                    <Loader variant="inline" />
                    <span className="font-semibold text-sm">Initializing Camera...</span>
                </div>
            )}
            <div id="qr-reader" className="w-full h-full relative" />
        </div>
    );
}
