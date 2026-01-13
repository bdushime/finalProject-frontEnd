import React, { useEffect, useRef, useState } from 'react';

/**
 * EquipmentScanAndPhotoUpload
 * Props:
 * - onScan(result: string) => void
 * - onPhotosChange(photos: { front, back }) => void
 * - onValidityChange(valid: boolean) => void
 * - requireBothPhotos?: boolean (defaults false, component ensures at least one photo)
 */
export default function EquipmentScanAndPhotoUpload({ onScan, onPhotosChange, onValidityChange, requireBothPhotos = false }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [photos, setPhotos] = useState({ front: null, back: null });
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState({ front: false, back: false });

    useEffect(() => {
        // notify parent of photos change
        if (onPhotosChange) onPhotosChange(photos);
        const valid = requireBothPhotos ? !!(photos.front && photos.back) : !!(photos.front || photos.back);
        if (onValidityChange) onValidityChange(valid);
    }, [photos]);

    useEffect(() => {
        if (scanResult && onScan) onScan(scanResult);
    }, [scanResult]);

    // Start camera and scanning
    const openCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setScanning(true);
            startScanLoop();
        } catch (err) {
            console.error('Camera error', err);
            setError('Unable to access camera. Please allow camera permissions or use file upload.');
        }
    };

    // Stop camera
    const stopCamera = () => {
        setScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        cancelAnimationFrame(scanLoopRef.current || 0);
    };

    const scanLoopRef = useRef(0);

    const startScanLoop = async () => {
        // Prefer BarcodeDetector if available
        const useBarcode = 'BarcodeDetector' in window;
        let detector = null;
        if (useBarcode) {
            try {
                detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            } catch (e) {
                detector = null;
            }
        }

        const scanFrame = async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) {
                scanLoopRef.current = requestAnimationFrame(scanFrame);
                return;
            }

            const video = videoRef.current;
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
            const canvas = canvasRef.current;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);

            try {
                if (detector) {
                    const barcodes = await detector.detect(canvas);
                    if (barcodes && barcodes.length) {
                        const bc = barcodes[0];
                        if (bc && bc.rawValue) {
                            setScanResult(bc.rawValue);
                            stopCamera();
                            return; // stop scanning
                        }
                    }
                } else if (window.jsQR) {
                    // If project has jsQR available globally (user may install), use it
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const code = window.jsQR(imageData.data, w, h);
                    if (code && code.data) {
                        setScanResult(code.data);
                        stopCamera();
                        return;
                    }
                }
            } catch (e) {
                // detection errors shouldn't break loop
                console.warn('scan error', e);
            }

            scanLoopRef.current = requestAnimationFrame(scanFrame);
        };

        scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    const handleFile = (side, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('Image is too large (max 5MB)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotos(prev => ({ ...prev, [side]: e.target.result }));
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    // Drag/drop handlers
    const handleDragOver = (e, side) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [side]: true })); };
    const handleDragLeave = (e, side) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [side]: false })); };
    const handleDrop = (e, side) => {
        e.preventDefault(); setDragOver(prev => ({ ...prev, [side]: false }));
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(side, file);
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Section */}
                <section className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">📷</div>
                        <div>
                            <h3 className="text-lg font-semibold">Scan QR Code</h3>
                            <p className="text-sm text-slate-500">Scan Equipment QR Code</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">Point your camera at the QR code on the equipment</p>

                    <div className="flex flex-col gap-3">
                        <div className="rounded border border-dashed p-2 flex items-center justify-center bg-slate-50">
                            {scanning ? (
                                <video ref={videoRef} className="w-full h-56 object-cover" />
                            ) : (
                                <div className="text-sm text-slate-500">Camera is closed</div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {!scanning && <button type="button" className="px-4 py-2 bg-sky-600 text-white rounded hover:opacity-90" onClick={openCamera}>Open Camera</button>}
                            {scanning && <button type="button" className="px-4 py-2 bg-red-600 text-white rounded hover:opacity-90" onClick={stopCamera}>Stop Camera</button>}
                            <button type="button" className="px-4 py-2 border rounded" onClick={() => {
                                // Manual capture and attempt decode (draw to canvas then try BarcodeDetector/jsQR)
                                if (!videoRef.current) return;
                                const video = videoRef.current;
                                const w = video.videoWidth; const h = video.videoHeight;
                                const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
                                const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0, w, h);
                                try {
                                    if ('BarcodeDetector' in window) {
                                        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                                        detector.detect(canvas).then(list => {
                                            if (list && list.length) {
                                                setScanResult(list[0].rawValue);
                                                stopCamera();
                                            } else {
                                                setError('No QR code detected in this frame');
                                            }
                                        }).catch(err => setError('QR detection failed'));
                                    } else if (window.jsQR) {
                                        const imageData = ctx.getImageData(0, 0, w, h);
                                        const code = window.jsQR(imageData.data, w, h);
                                        if (code && code.data) { setScanResult(code.data); stopCamera(); } else setError('No QR code detected');
                                    } else {
                                        setError('No QR decoder available in this browser');
                                    }
                                } catch (e) { setError('Manual scan failed'); }
                            }}>Manual Scan</button>
                        </div>

                        <div className="text-sm text-slate-600">{scanResult ? (<span>Scanned: <strong>{scanResult}</strong></span>) : 'No code scanned yet'}</div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                    </div>
                </section>

                {/* Photos Section */}
                <section className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold">Condition Photos</h3>
                        <p className="text-sm text-slate-500">Please take photos of the equipment from multiple angles to document its current condition.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['front', 'back'].map((side) => (
                            <div key={side}
                                onDragOver={(e) => handleDragOver(e, side)}
                                onDragLeave={(e) => handleDragLeave(e, side)}
                                onDrop={(e) => handleDrop(e, side)}
                                className={`p-3 rounded-lg border-2 ${dragOver[side] ? 'border-sky-300 bg-sky-50' : 'border-dashed border-slate-300 bg-white'} flex flex-col items-center justify-center cursor-pointer`}
                                onClick={() => document.getElementById(`file-${side}`).click()}
                            >
                                <div className="text-sm font-medium mb-1">{side === 'front' ? 'Front View' : 'Back View'}</div>
                                {!photos[side] ? (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <div className="text-3xl">＋</div>
                                        <div className="text-xs mt-1">Click to upload</div>
                                    </div>
                                ) : (
                                    <img src={photos[side]} alt={side} className="w-full h-48 object-cover rounded" />
                                )}
                                <input id={`file-${side}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(side, e.target.files && e.target.files[0])} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-sm text-slate-500">At least one photo is required{requireBothPhotos ? ' (both front and back required)' : ''}.</div>
                </section>
            </div>
        </div>
    );
}
