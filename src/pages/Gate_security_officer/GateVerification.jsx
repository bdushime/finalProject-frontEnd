import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, User, Clock, Search, RotateCcw, UserX, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_STUDENT_DB = {
    "25148": {
        name: 'Julie MUGANZA',
        status: 'pending',
        items: [
            { id: 1, name: 'PROJECTOR', quantity: 1, date: '2023-10-25', dept: 'IT' },
            { id: 2, name: 'PROJECTOR + EXTENSION', quantity: 1, date: '2023-10-25', dept: 'IT' },
        ]
    },
    "26577": {
        name: 'IZERE INEZA Promise',
        status: 'clear',
        items: []
    }
};

const GateVerification = () => {
    const { t, i18n } = useTranslation("gate");
    const [studentId, setStudentId] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, not_found, clear, pending
    const [studentData, setStudentData] = useState(null);
    const [pendingItems, setPendingItems] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const inputRef = useRef(null);

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'rw' : 'en';
        i18n.changeLanguage(nextLang);
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const mockCheck = (id) => {
        setStatus('loading');
        setTimeout(() => {
            const student = MOCK_STUDENT_DB[id];
            if (student) {
                setStudentData({ name: student.name, id: id });
                setPendingItems(student.items);
                setStatus(student.status);
            } else {
                setStatus('not_found');
                setStudentData(null);
                setPendingItems([]);
            }
        }, 800); // slight delay for effect
    };

    const handleCheck = (e) => {
        e.preventDefault();
        if (studentId.trim()) mockCheck(studentId);
    };

    const handleReset = () => {
        setStatus('idle');
        setStudentId('');
        setStudentData(null);
        setPendingItems([]);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.6 } },
        exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: { scale: 1, rotate: 0, transition: { type: 'spring', bounce: 0.5, duration: 0.8, delay: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] font-sans text-slate-200 selection:bg-blue-500/30 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            
            {status === 'pending' && <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay animate-pulse pointer-events-none" />}
            {status === 'clear' && <div className="absolute inset-0 bg-emerald-600/10 mix-blend-overlay pointer-events-none" />}

            {/* Header */}
            <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-wrap justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Search size={22} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-widest uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {t('app_title')}
                    </h1>
                </div>
                <div className="flex gap-5 items-center">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                        <Languages size={18} className="text-blue-400" />
                        {i18n.language === 'en' ? 'KINY' : 'ENG'}
                    </button>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <User size={18} className="text-indigo-400" />
                        <span className="font-semibold text-slate-300 tracking-wide">{t('gate_label')}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <Clock size={18} className="text-blue-400" />
                        <span className="tabular-nums font-mono font-bold text-slate-200">{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-88px)]">
                <AnimatePresence mode="wait">
                    
                    {/* IDLE & LOADING STATE */}
                    {(status === 'idle' || status === 'loading') && (
                        <motion.div
                            key="idle"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 text-center relative overflow-hidden"
                        >
                            {status === 'loading' && (
                                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                                    <p className="mt-6 text-blue-400 font-bold tracking-widest uppercase animate-pulse">{t('btn_verifying')}</p>
                                </div>
                            )}

                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-white tracking-wide uppercase drop-shadow-lg">{t('scan_title')}</h2>
                                <p className="text-slate-400 mt-3 text-lg font-medium">{t('scan_hint')}</p>
                            </div>

                            <form onSubmit={handleCheck} className="space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder={t('placeholder_id')}
                                        className="relative w-full px-8 py-6 text-4xl font-mono text-center font-bold text-white bg-[#0f172a] border border-white/10 rounded-2xl outline-none placeholder:text-slate-600 focus:bg-[#1e293b] transition-all shadow-inner"
                                        autoFocus
                                        disabled={status === 'loading'}
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !studentId.trim()}
                                    className="w-full py-6 text-xl font-black tracking-widest uppercase rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] border border-white/20"
                                >
                                    {t('btn_verify')}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* NOT FOUND STATE */}
                    {status === 'not_found' && (
                        <motion.div
                            key="not_found"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-xl bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-700/50 rounded-[2rem] p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <motion.div variants={iconVariants} className="mx-auto bg-slate-800 w-32 h-32 rounded-full flex items-center justify-center mb-8 border border-slate-600 shadow-inner">
                                <UserX size={64} className="text-slate-400" />
                            </motion.div>
                            <h2 className="text-4xl font-black text-white mb-3 tracking-wide">{t('status_not_found')}</h2>
                            <p className="text-xl text-slate-400 mb-10 uppercase tracking-wider">
                                ID <span className="font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg ml-2 shadow-inner">"{studentId}"</span> <br/><span className="mt-2 inline-block text-slate-500">{t('not_registered')}</span>
                            </p>
                            
                            <div className="bg-amber-500/10 border border-amber-500/30 py-5 px-6 rounded-2xl mb-10 shadow-inner">
                                <p className="text-amber-400 font-bold tracking-wider uppercase text-lg">{t('hold_student')}</p>
                            </div>

                            <button onClick={handleReset} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg">
                                <RotateCcw size={24} /> {t('btn_retry')}
                            </button>
                        </motion.div>
                    )}

                    {/* CLEAR STATE */}
                    {status === 'clear' && (
                        <motion.div
                            key="clear"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-2xl bg-emerald-950/40 backdrop-blur-2xl border-2 border-emerald-500/50 rounded-[2.5rem] p-12 text-center shadow-[0_0_80px_rgba(16,185,129,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                            
                            <motion.div variants={iconVariants} className="mx-auto bg-emerald-500/20 w-40 h-40 rounded-full flex items-center justify-center mb-8 border-2 border-emerald-400/50 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                                <CheckCircle size={80} className="text-emerald-400" />
                            </motion.div>
                            
                            <h2 className="text-6xl font-black text-emerald-400 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">{t('status_clear')}</h2>
                            <p className="text-3xl font-bold text-white mb-10 uppercase tracking-widest">{studentData?.name}</p>
                            
                            <div className="bg-emerald-900/50 border border-emerald-500/30 py-5 px-10 rounded-2xl inline-block mb-12 shadow-inner">
                                <p className="text-emerald-300 text-xl font-bold tracking-widest uppercase">{t('no_items')}</p>
                            </div>
                            
                            <button onClick={handleReset} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-12 py-6 rounded-2xl text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.5)] border border-emerald-300/50">
                                <RotateCcw size={28} /> {t('btn_next')}
                            </button>
                        </motion.div>
                    )}

                    {/* PENDING STATE */}
                    {status === 'pending' && (
                        <motion.div
                            key="pending"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-4xl bg-red-950/60 backdrop-blur-2xl border-2 border-red-500/60 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col"
                        >
                            <div className="p-10 bg-gradient-to-r from-red-600 to-rose-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                
                                <motion.div variants={iconVariants} className="bg-white/20 p-5 rounded-3xl backdrop-blur-sm border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    <AlertTriangle size={80} className="text-white" />
                                </motion.div>
                                <div className="text-center md:text-left z-10">
                                    <h2 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">{t('status_stop')}</h2>
                                    <p className="text-2xl font-bold text-red-100 uppercase tracking-widest opacity-90">{t('items_owed_by')} <span className="text-white bg-black/20 px-4 py-1 rounded-xl ml-2">{studentData?.name}</span></p>
                                </div>
                            </div>
                            
                            <div className="p-10 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 to-transparent pointer-events-none" />
                                
                                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-red-500/30 overflow-hidden mb-10 shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-red-900/30 border-b border-red-500/30">
                                                <th className="p-6 font-bold text-red-300 uppercase tracking-wider">{t('table_item')}</th>
                                                <th className="p-6 font-bold text-red-300 uppercase tracking-wider text-center">{t('table_qty')}</th>
                                                <th className="p-6 font-bold text-red-300 uppercase tracking-wider">{t('table_dept')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingItems.map((item) => (
                                                <tr key={item.id} className="border-t border-red-900/50 hover:bg-red-500/5 transition-colors">
                                                    <td className="p-6 font-bold text-white text-xl">{item.name}</td>
                                                    <td className="p-6 text-red-200 font-mono text-center text-2xl font-bold bg-red-900/20">{item.quantity}</td>
                                                    <td className="p-6">
                                                        <span className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-inner">
                                                            {item.dept || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-red-500/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                                            <div className="w-8 h-2 bg-white rounded-full" />
                                        </div>
                                        <p className="text-red-400 font-black text-3xl uppercase tracking-widest drop-shadow-md">{t('block_exit')}</p>
                                    </div>
                                    <button onClick={handleReset} className="w-full md:w-auto bg-white hover:bg-slate-200 text-red-900 px-12 py-6 rounded-2xl text-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        {t('btn_scan_next')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default GateVerification;