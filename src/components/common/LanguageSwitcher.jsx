import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "rw", label: "RW", flag: "🇷🇼" },
    { code: "fr", label: "FR", flag: "🇫🇷" },
];

export default function LanguageSwitcher({ variant = "light" }) {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isDark = variant === "dark";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isDark
                    ? "bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800 border border-slate-200 shadow-sm"
                    }`}
            >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang.flag} {currentLang.label}</span>
            </button>

            {open && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 shadow-xl border animate-in fade-in slide-in-from-top-2 ${isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                i18n.changeLanguage(lang.code);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${i18n.language === lang.code
                                ? isDark
                                    ? "bg-slate-700 text-white"
                                    : "bg-blue-50 text-blue-700"
                                : isDark
                                    ? "text-gray-300 hover:bg-slate-700/60 hover:text-white"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {i18n.language === lang.code && (
                                <span className="ml-auto text-xs">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
