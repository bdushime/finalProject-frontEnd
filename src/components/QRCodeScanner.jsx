import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRCodeScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        const id = "reader";

        const startScanner = async () => {
            try {
                // Use the lower-level Html5Qrcode for a more integrated look (no library buttons)
                const html5QrCode = new Html5Qrcode(id);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 15,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        console.log("Scanned:", decodedText);
                        // Stop and clear on success
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                            onScanSuccess(decodedText);
                        }).catch(err => {
                            console.error("Stop error:", err);
                            onScanSuccess(decodedText);
                        });
                    },
                    (errorMessage) => {
                        // ignore scan failures
                    }
                );
            } catch (err) {
                console.error("Unable to start scanner:", err);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(e => console.log('Cleanup error:', e));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <div id="reader" className="w-full h-full" />
            {/* Add a scan overlay to make it look 'real' */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#126dd5] rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#126dd5] rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#126dd5] rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#126dd5] rounded-br-lg"></div>

                    {/* Scanning Line Animation */}
                    <div className="absolute inset-x-4 top-0 h-0.5 bg-[#126dd5] animate-scan-line shadow-[0_0_10px_#126dd5]"></div>
                </div>
            </div>
        </div>
    );
}
