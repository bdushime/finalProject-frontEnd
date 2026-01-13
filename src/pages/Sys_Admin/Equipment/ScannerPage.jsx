import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Camera, RefreshCw, XCircle, CheckCircle, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const [scanned, setScanned] = useState(false);

    // Simulate scanning
    useEffect(() => {
        let timer;
        if (scanning && !scanned) {
            timer = setTimeout(() => {
                setScanning(false);
                setScanned(true);
            }, 3000); // 3 seconds mock scan
        }
        return () => clearTimeout(timer);
    }, [scanning, scanned]);

    const HeroSection = (
        <div className="flex justify-between items-center mb-6 mt-4 relative z-10 w-full">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">QR Scanner</h1>
                <p className="text-gray-400">Scan equipment tags for check-in or info.</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="max-w-xl mx-auto">
                <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-[3/4] border-4 border-slate-800">

                    {/* Camera Feed Simulation */}
                    <div className={`w-full h-full object-cover bg-gray-900 flex flex-col items-center justify-center relative ${scanned ? 'blur-sm' : ''}`}>
                        {/* Mock background pattern resembling a camera feed */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center"></div>

                        {/* Scanning Animation */}
                        {!scanned && (
                            <>
                                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl"></div>

                                    {/* Scan Line */}
                                    <div className="absolute top-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                </div>
                                <p className="mt-8 text-white font-mono text-sm uppercase tracking-widest animate-pulse">Scanning...</p>
                            </>
                        )}
                    </div>

                    {/* Result Overlay */}
                    {scanned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in zoom-in duration-300">
                            <div className="bg-white rounded-3xl p-6 w-full text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Items Found</h3>
                                <p className="text-sm text-gray-500 mb-6">Dell Latitude 5420 (Tag #2941)</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/admin/reports')} // Mock action
                                        className="w-full bg-[#8D8DC7] text-white py-3 rounded-xl font-bold hover:bg-[#7b7bb5] transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => { setScanned(false); setScanning(true); }}
                                        className="w-full bg-gray-50 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Scan Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Camera Controls */}
                    <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                        <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                            <Smartphone className="w-6 h-6" />
                        </button>
                        <button className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm hover:scale-105 transition-transform"></button>
                        <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                            <RefreshCw className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default ScannerPage;
