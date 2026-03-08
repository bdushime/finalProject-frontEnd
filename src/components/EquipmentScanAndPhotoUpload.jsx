import React, { useEffect, useRef, useState } from 'react';
import { Camera, Scan, RotateCcw, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next";
import { Input } from '@/components/ui/input';

export default function EquipmentScanAndPhotoUpload({ onScan, onPhotosChange, onValidityChange, requireBothPhotos = false }) {
    const { t } = useTranslation('student');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [capturingFor, setCapturingFor] = useState(null); // 'front' or 'back'
    const [scanResult, setScanResult] = useState('');
    const [photos, setPhotos] = useState({ front: null, back: null });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (onPhotosChange) onPhotosChange(photos);
        const valid = requireBothPhotos ? !!(photos.front && photos.back) : !!(photos.front || photos.back);
        if (onValidityChange) onValidityChange(valid);
    }, [photos, requireBothPhotos, onPhotosChange, onValidityChange]);

    useEffect(() => {
        if (scanResult && onScan) onScan(scanResult);
    }, [scanResult, onScan]);

    const openCamera = async (mode = 'scan') => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            if (mode === 'scan') {
                setScanning(true);
                startScanLoop();
            } else {
                setCapturingFor(mode);
            }
        } catch (err) {
            console.error('Camera error', err);
            setError('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        setScanning(false);
        setCapturingFor(null);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        cancelAnimationFrame(scanLoopRef.current || 0);
    };

    const scanLoopRef = useRef(0);

    const startScanLoop = async () => {
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
                if ('BarcodeDetector' in window) {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(canvas);
                    if (barcodes && barcodes.length) {
                        setScanResult(barcodes[0].rawValue);
                        stopCamera();
                        return;
                    }
                } else if (window.jsQR) {
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const code = window.jsQR(imageData.data, w, h);
                    if (code && code.data) {
                        setScanResult(code.data);
                        stopCamera();
                        return;
                    }
                }
            } catch (e) { console.warn('scan error', e); }

            scanLoopRef.current = requestAnimationFrame(scanFrame);
        };
        scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    const takeSnapshot = () => {
        if (!videoRef.current || !capturingFor) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotos(prev => ({ ...prev, [capturingFor]: dataUrl }));
        stopCamera();
    };

    const removePhoto = (side) => {
        setPhotos(prev => ({ ...prev, [side]: null }));
    };

    return (
        <div className="w-full space-y-8">
            {/* QR SCANNER SECTION - FULL WIDTH */}
            <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#126dd5]/10 text-[#126dd5] rounded-xl">
                            <Scan className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0b1d3a]">{t('equipment.qrCodeScanner', 'QR Code Scanner')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('equipment.scanTagDesc', 'Scan the equipment tag for quick identification')}</p>
                        </div>
                    </div>
                    {scanResult && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t('equipment.scanned', 'Scanned')}
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative aspect-video max-h-[300px] w-full bg-slate-50/80 rounded-[2rem] overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#126dd5] transition-colors">
                        {scanning ? (
                            <video ref={videoRef} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-400">
                                <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-slate-100 mb-2">
                                    <Scan className="h-8 w-8 text-[#126dd5]/60" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">{t('equipment.cameraPreview', 'Camera Preview')}</p>
                                <p className="text-xs font-medium text-slate-400 normal-case tracking-normal">Click start identification to scan QR code</p>
                            </div>
                        )}

                        {scanning && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                <div className="w-48 h-48 border-2 border-white rounded-3xl opacity-70 relative">
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!scanning ? (
                            <Button onClick={() => openCamera('scan')} className="flex-1 bg-white hover:bg-slate-50 h-14 rounded-2xl border-2 border-slate-200 text-[#0b1d3a] font-black shadow-lg shadow-slate-100 flex items-center gap-3 transition-all active:scale-95">
                                <Scan className="h-5 w-5" /> {t('equipment.startIdentification', 'Start Identification')}
                            </Button>
                        ) : (
                            <Button onClick={stopCamera} className="flex-1 bg-rose-50 hover:bg-rose-100 h-14 rounded-2xl border-2 border-rose-200 text-rose-600 font-black flex items-center gap-3 transition-all active:scale-95">
                                <X className="h-5 w-5" /> {t('equipment.stopIdentification', 'Stop Identification')}
                            </Button>
                        )}

                        {scanResult && (
                            <Button variant="outline" onClick={() => { setScanResult(''); }} title={t('equipment.resetScan', 'Reset Scan')} className="h-14 w-14 rounded-2xl p-0 border-2 border-slate-200 flex-shrink-0 text-slate-500 hover:text-slate-700 bg-white">
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {scanResult && (
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{t('equipment.targetDetected', 'Target Detected')}</span>
                                </div>
                                <div className="bg-emerald-500 text-white p-1 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('equipment.identificationCode', 'Identification Code')}</p>
                                <div className="flex items-center gap-3">
                                    <code className="text-[#126dd5] font-black text-xl tracking-tight">{scanResult}</code>
                                    <div className="h-6 w-px bg-slate-100" />
                                    <span className="text-xs text-emerald-700 font-bold italic">{t('equipment.equipmentVerified', 'Equipment Verified')}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed">
                                {t('equipment.scanSuccessDesc', "Great! We've identified the item. Now, please capture the front and back views below to document its condition before checkout.")}
                            </p>
                        </div>
                    )}

                    {error && <div className="text-xs text-rose-500 flex items-center gap-1.5 px-1 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100"><AlertCircle className="h-3.5 w-3.5" /> {error}</div>}
                </div>
            </section>

            {/* PHOTOS SECTION */}
            <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <Camera className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0b1d3a]">{t('equipment.conditionPhotosTitle', 'Condition Photos')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('equipment.documentStateDesc', 'Document the current state of the equipment')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {capturingFor ? (
                        <div className="bg-slate-50/80 rounded-[2rem] overflow-hidden relative border-2 border-dashed border-slate-200 shadow-sm">
                            <video ref={videoRef} className="w-full aspect-video object-cover" />
                            <div className="absolute bottom-4 inset-x-0 px-4 flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-b-2xl">
                                <span className="text-white text-xs font-bold uppercase">{t('equipment.capturingView', 'Capturing {{view}} view', { view: capturingFor === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={stopCamera} className="bg-white/10 hover:bg-white/20 text-white border-white/20">{t('profile.cancel', 'Cancel')}</Button>
                                    <Button size="sm" onClick={takeSnapshot} className="bg-white text-black hover:bg-white/90">{t('equipment.capture', 'Capture')}</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['front', 'back'].map(side => (
                                <div key={side} className="relative group">
                                    {photos[side] ? (
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm ring-4 ring-transparent hover:ring-[#126dd5]/20 hover:border-[#126dd5] transition-all">
                                            <img src={photos[side]} alt={side} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="icon" variant="destructive" onClick={() => removePhoto(side)} className="h-10 w-10 rounded-full shadow-lg">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="secondary" onClick={() => openCamera(side)} className="h-10 w-10 rounded-full shadow-lg bg-white text-[#0b1d3a]">
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                {t('equipment.sideView', '{{side}} view', { side: side === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openCamera(side)}
                                            className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-[#126dd5] hover:bg-blue-50 transition-all text-slate-400 hover:text-[#126dd5]"
                                        >
                                            <div className="p-3 bg-white rounded-full shadow-sm ring-1 ring-slate-100">
                                                <Camera className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">{t('equipment.takeSidePhoto', 'Take {{side}} Photo', { side: side === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#126dd5]" />
                        <p>{t('equipment.photoMandatoryDesc', 'Documenting the physical condition is mandatory. Please ensure clear lighting and centered focus on identifying features.')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
