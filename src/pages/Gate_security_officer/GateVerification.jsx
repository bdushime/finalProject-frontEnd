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
    const [status, setStatus] = useState('idle');
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
        }, 800);
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

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.5 } },
        exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2 } }
    };

    const iconVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: 'spring', bounce: 0.5, duration: 0.6, delay: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30 overflow-hidden relative flex flex-col">
            
            {/* Header */}
            <header className="relative z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Search size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-wide uppercase text-white">
                        {t('app_title')}
                    </h1>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                        <Languages size={16} className="text-slate-300" />
                        {i18n.language === 'en' ? 'KINY' : 'ENG'}
                    </button>

                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm">
                        <User size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-200">{t('gate_label')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm">
                        <Clock size={16} className="text-slate-400" />
                        <span className="tabular-nums font-mono font-medium text-slate-200">{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    
                    {/* IDLE & LOADING STATE */}
                    {(status === 'idle' || status === 'loading') && (
                        <motion.div
                            key="idle"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-10 text-center relative overflow-hidden"
                        >
                            {status === 'loading' && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    <p className="mt-4 text-blue-400 font-semibold tracking-wider uppercase text-sm animate-pulse">{t('btn_verifying')}</p>
                                </div>
                            )}

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-wide uppercase">{t('scan_title')}</h2>
                                <p className="text-slate-400 mt-2 text-sm">{t('scan_hint')}</p>
                            </div>

                            <form onSubmit={handleCheck} className="space-y-6">
                                <div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder={t('placeholder_id')}
                                        className="w-full px-6 py-5 text-3xl font-mono text-center font-bold text-white bg-slate-950 border border-slate-700 rounded-xl outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                                        autoFocus
                                        disabled={status === 'loading'}
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !studentId.trim()}
                                    className="w-full py-4 text-lg font-bold tracking-wide uppercase rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 bg-blue-600 hover:bg-blue-500 text-white shadow-md border border-blue-500"
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
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-xl"
                        >
                            <motion.div variants={iconVariants} className="mx-auto bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                                <UserX size={48} className="text-slate-400" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mb-2">{t('status_not_found')}</h2>
                            <p className="text-lg text-slate-400 mb-8">
                                ID <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded mx-1">"{studentId}"</span> {t('not_registered')}
                            </p>
                            
                            <div className="bg-amber-500/10 border border-amber-500/20 py-4 px-6 rounded-xl mb-8">
                                <p className="text-amber-400 font-medium text-sm tracking-wide uppercase">{t('hold_student')}</p>
                            </div>

                            <button onClick={handleReset} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                                <RotateCcw size={20} /> {t('btn_retry')}
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
                            className="w-full max-w-xl bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-10 text-center shadow-xl"
                        >
                            <motion.div variants={iconVariants} className="mx-auto bg-emerald-900/50 w-28 h-28 rounded-full flex items-center justify-center mb-6 border border-emerald-800/50">
                                <CheckCircle size={56} className="text-emerald-500" />
                            </motion.div>
                            
                            <h2 className="text-4xl font-bold text-emerald-500 mb-2">{t('status_clear')}</h2>
                            <p className="text-2xl font-semibold text-white mb-8 uppercase tracking-wide">{studentData?.name}</p>
                            
                            <div className="bg-emerald-900/20 border border-emerald-800/30 py-4 px-8 rounded-xl inline-block mb-10">
                                <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase">{t('no_items')}</p>
                            </div>
                            
                            <button onClick={handleReset} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                                <RotateCcw size={20} /> {t('btn_next')}
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
                            className="w-full max-w-3xl bg-slate-900 border border-red-900/50 rounded-2xl overflow-hidden shadow-xl flex flex-col"
                        >
                            <div className="p-8 bg-red-950/30 flex flex-col md:flex-row items-center gap-6 border-b border-red-900/50">
                                <motion.div variants={iconVariants} className="bg-red-900/50 p-4 rounded-2xl border border-red-800/50">
                                    <AlertTriangle size={48} className="text-red-500" />
                                </motion.div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl font-bold text-red-500 mb-1">{t('status_stop')}</h2>
                                    <p className="text-lg text-slate-300 font-medium">{t('items_owed_by')} <span className="text-white font-bold ml-1">{studentData?.name}</span></p>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900 border-b border-slate-800">
                                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('table_item')}</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{t('table_qty')}</th>
                                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('table_dept')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingItems.map((item) => (
                                                <tr key={item.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50">
                                                    <td className="p-4 font-medium text-white text-sm">{item.name}</td>
                                                    <td className="p-4 text-slate-300 font-mono text-center font-bold text-sm">{item.quantity}</td>
                                                    <td className="p-4">
                                                        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs font-semibold uppercase">
                                                            {item.dept || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-center bg-red-950/20 p-6 rounded-xl border border-red-900/30 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center border border-red-800/50">
                                            <div className="w-5 h-1.5 bg-red-500 rounded-full" />
                                        </div>
                                        <p className="text-red-400 font-bold text-xl uppercase tracking-wide">{t('block_exit')}</p>
                                    </div>
                                    <button onClick={handleReset} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors active:scale-[0.98] border border-slate-700">
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