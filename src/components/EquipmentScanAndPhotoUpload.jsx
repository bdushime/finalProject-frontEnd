import React, { useEffect, useState, useRef } from 'react';
import { Camera, Scan, CheckCircle2, AlertCircle, Trash2, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from "react-i18next";
import QRCodeScanner from "./QRCodeScanner";

export default function EquipmentScanAndPhotoUpload({ onScan, onPhotosChange, onValidityChange, requireBothPhotos = false }) {
    const { t } = useTranslation('student');
    const [scanResult, setScanResult] = useState('');
    const [photos, setPhotos] = useState({ front: null, back: null });
    const [capturingSide, setCapturingSide] = useState(null); // 'front' or 'back'
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    // We only want to show the scanner when we don't have a result
    const showScanner = !scanResult;

    useEffect(() => {
        if (onPhotosChange) onPhotosChange(photos);
        const valid = requireBothPhotos ? !!(photos.front && photos.back) : !!(photos.front || photos.back);
        if (onValidityChange) onValidityChange(valid);
    }, [photos, requireBothPhotos, onPhotosChange, onValidityChange]);

    useEffect(() => {
        if (scanResult && onScan) onScan(scanResult);
    }, [scanResult, onScan]);

    const handleScanSuccess = (decodedText) => {
        setScanResult(decodedText);
    };

    // Live Camera logic for Photos
    const startPhotoCamera = async (side) => {
        setCameraError(null);
        setCapturingSide(side);
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError("Unable to access camera. Please check permissions.");
        }
    };

    const stopPhotoCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCapturingSide(null);
    };

    const takeSnapshot = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        // Maintain aspect ratio
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhotos(prev => ({ ...prev, [capturingSide]: dataUrl }));
        stopPhotoCamera();
    };

    const removePhoto = (side) => {
        setPhotos(prev => ({ ...prev, [side]: null }));
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* QR SCANNER SECTION */}
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
                    <div className="w-full bg-black rounded-[2rem] overflow-hidden flex flex-col items-center justify-center relative min-h-[300px] border-4 border-white shadow-inner">
                        {showScanner ? (
                            <div className="w-full absolute inset-0">
                                <QRCodeScanner onScanSuccess={handleScanSuccess} />
                            </div>
                        ) : scanResult ? (
                            <div className="flex flex-col items-center justify-center text-white z-10 w-full p-8 animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Identified Successfully</p>
                                <code className="bg-white/10 px-6 py-3 rounded-xl font-mono text-2xl tracking-widest border border-white/20 shadow-inner">
                                    {scanResult}
                                </code>
                            </div>
                        ) : null}
                    </div>

                    {scanResult && (
                        <div className="flex justify-between items-center gap-4 animate-in fade-in">
                            <Button
                                variant="outline"
                                onClick={() => { setScanResult(''); }}
                                className="w-full h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:text-rose-500 border-2"
                            >
                                <X className="h-4 w-4 mr-2" /> Reset & Scan Again
                            </Button>
                        </div>
                    )}
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
                            <p className="text-xs text-slate-500 font-medium">{t('equipment.documentStateDesc', 'Take real photos of the front and back')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {capturingSide ? (
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border-4 border-white shadow-2xl animate-in zoom-in-95">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />

                            <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-4">
                                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    {t('equipment.capturingView', 'Capturing {{view}} view', { view: capturingSide === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}
                                </div>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={stopPhotoCamera}
                                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={takeSnapshot}
                                        className="w-20 h-20 rounded-full bg-white p-1 shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-rose-500" />
                                        </div>
                                    </button>
                                    <button
                                        className="w-12 h-12 rounded-full bg-white/10 opacity-0 pointer-events-none"
                                    >
                                        <RotateCw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['front', 'back'].map(side => (
                                <div key={side} className="relative group">
                                    {photos[side] ? (
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm ring-4 ring-transparent hover:ring-[#126dd5]/20 hover:border-[#126dd5] transition-all bg-black/5">
                                            <img src={photos[side]} alt={side} className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button size="icon" variant="destructive" onClick={() => removePhoto(side)} className="h-10 w-10 rounded-full shadow-lg">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="secondary" onClick={() => startPhotoCamera(side)} className="h-10 w-10 rounded-full shadow-lg bg-white">
                                                    <RotateCw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                {t('equipment.sideView', '{{side}} view', { side: side === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startPhotoCamera(side)}
                                            className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-[#0b1d3a] flex flex-col items-center justify-center gap-2 hover:border-[#126dd5] hover:bg-[#126dd5] transition-all text-white/80 hover:text-white cursor-pointer group"
                                        >
                                            <div className="p-4 bg-white/10 rounded-full shadow-sm ring-1 ring-white/20 group-hover:scale-110 transition-transform">
                                                <Camera className="h-8 w-8 text-white" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest mt-2">{t('equipment.takeSidePhoto', 'Take {{side}} Photo', { side: side === 'front' ? t('equipment.front', 'front') : t('equipment.backView', 'back') })}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {cameraError && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {cameraError}
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
