import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, User, Clock, Search, RotateCcw, UserX, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
        }, 600);
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg"><Search size={24} /></div>
                    <h1 className="text-xl font-bold tracking-tight uppercase">{t('app_title')}</h1>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-600 px-4 py-2 rounded-full font-medium transition-colors"
                    >
                        <Languages size={18} />
                        {i18n.language === 'en' ? 'Kiny' : 'Eng'}
                    </button>

                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full">
                        <User size={16} className="text-blue-400" />
                        <span>{t('gate_label')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className="tabular-nums">{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

                {(status === 'idle' || status === 'loading') && (
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold text-slate-800">{t('scan_title')}</h2>
                            <p className="text-slate-500 mt-2 text-lg italic">{t('scan_hint')}</p>
                        </div>

                        <form onSubmit={handleCheck} className="space-y-6">
                            <input
                                ref={inputRef}
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder={t('placeholder_id')}
                                className="w-full px-6 py-5 text-3xl font-mono text-center border-2 border-slate-200 rounded-xl transition-all outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full py-5 text-xl font-bold rounded-xl transition-all shadow-md active:transform active:scale-95 ${status === 'loading'
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {status === 'loading' ? t('btn_verifying') : t('btn_verify')}
                            </button>
                        </form>
                    </div>
                )}

                {status === 'not_found' && (
                    <div className="w-full max-w-lg bg-white border-4 border-slate-300 rounded-3xl p-10 text-center shadow-2xl">
                        <UserX size={100} className="mx-auto text-slate-400 mb-6" />
                        <h2 className="text-4xl font-black text-slate-700 mb-2">{t('status_not_found')}</h2>
                        <p className="text-xl text-slate-500 mb-8 uppercase">ID <span className="font-mono font-bold text-slate-800 italic">"{studentId}"</span> {t('not_registered')}</p>
                        <div className="bg-slate-100 py-4 px-6 rounded-xl mb-10 border border-slate-200">
                            <p className="text-slate-700 font-bold italic underline">{t('hold_student')}</p>
                        </div>
                        <button onClick={handleReset} className="bg-slate-800 text-white px-10 py-5 rounded-2xl text-xl font-bold flex items-center gap-3 mx-auto">
                            <RotateCcw size={24} /> {t('btn_retry')}
                        </button>
                    </div>
                )}

                {status === 'clear' && (
                    <div className="w-full bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-10 text-center shadow-2xl">
                        <CheckCircle size={100} className="mx-auto text-emerald-500 mb-6" />
                        <h2 className="text-5xl font-black text-emerald-700 mb-2">{t('status_clear')}</h2>
                        <p className="text-2xl font-bold text-emerald-800 mb-8 uppercase tracking-widest">{studentData?.name}</p>
                        <div className="bg-white/60 py-4 px-8 rounded-xl inline-block mb-10 border border-emerald-200 shadow-sm">
                            <p className="text-emerald-900 text-xl font-medium">{t('no_items')}</p>
                        </div>
                        <br />
                        <button onClick={handleReset} className="bg-emerald-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold flex items-center gap-3 mx-auto">
                            <RotateCcw size={28} /> {t('btn_next')}
                        </button>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="w-full bg-red-50 border-4 border-red-500 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 flex items-center gap-6 bg-red-600 text-white">
                            <AlertTriangle size={80} />
                            <div>
                                <h2 className="text-4xl font-black italic tracking-tighter">{t('status_stop')}</h2>
                                <p className="text-xl font-bold opacity-90 uppercase">{t('items_owed_by')} {studentData?.name}</p>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="bg-white rounded-xl shadow-inner border border-red-100 overflow-hidden mb-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-b-2 border-slate-200">
                                            <th className="p-5 font-bold text-slate-700 uppercase">{t('table_item')}</th>
                                            <th className="p-5 font-bold text-slate-700 uppercase text-center">{t('table_qty')}</th>
                                            <th className="p-5 font-bold text-slate-700 uppercase">{t('table_dept')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingItems.map((item) => (
                                            <tr key={item.id} className="border-t border-red-100">
                                                <td className="p-5 font-bold text-slate-900 text-xl">{item.name}</td>
                                                <td className="p-5 text-slate-800 font-mono text-center text-xl">{item.quantity}</td>
                                                <td className="p-5">
                                                    <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-black uppercase">
                                                        {item.dept || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border-2 border-dashed border-red-400 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-red-600 text-3xl">⛔</span>
                                    <p className="text-red-700 font-black text-2xl uppercase">{t('block_exit')}</p>
                                </div>
                                <button onClick={handleReset} className="bg-slate-900 text-white px-10 py-5 rounded-xl text-xl font-extrabold transition-all active:scale-95">
                                    {t('btn_scan_next')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GateVerification;