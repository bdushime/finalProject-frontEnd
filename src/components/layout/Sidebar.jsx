import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, ClipboardList, Bell, User, HelpCircle, LogOut, Shield, FileText } from "lucide-react";
import logo from "@/assets/images/logo8noback.png";
import { useTranslation } from "react-i18next";

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation("common");

    const links = [
        { name: t("nav.dashboard"), path: "/student/dashboard", icon: LayoutGrid },
        { name: t("nav.equipment"), path: "/student/browse", icon: Package },
        { name: t("nav.borrowedItems"), path: "/student/borrowed-items", icon: ClipboardList },
        { name: t("nav.score"), path: "/student/score", icon: Shield },
        { name: t("nav.report"), path: "/student/report", icon: FileText },
        { name: t("nav.notifications"), path: "/student/notifications", icon: Bell },
        { name: t("nav.profile"), path: "/student/profile", icon: User },
        { name: t("nav.helpSupport"), path: "/student/help", icon: HelpCircle },
    ];

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: -260, opacity: 0 }}
                animate={{ x: isOpen ? 0 : -260, opacity: isOpen ? 1 : 0.9 }}
                exit={{ x: -260, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed left-0 top-0 h-screen w-64 z-40 bg-white text-black shadow-2xl border-r border-slate-200"
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 bg-white">
                        <img src={logo} alt="Tracknity logo" className="h-10 w-10 object-contain drop-shadow-sm" />
                        <div>
                            <div className="text-black font-semibold text-lg leading-tight">{t("misc.tracknity")}</div>
                            <p className="text-xs text-slate-500">{t("misc.studentPortal")}</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path ||
                                (link.path !== "/student/dashboard" && location.pathname.startsWith(link.path));
                            const Icon = link.icon;

                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024 && onClose) {
                                            onClose();
                                        }
                                    }}
                                    className={({ isActive: navIsActive }) => {
                                        const active = navIsActive || isActive;
                                        return `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                            ? "bg-slate-100 text-black shadow-sm border border-slate-200"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-black"
                                            }`;
                                    }}
                                >
                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 opacity-60" />
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className="tracking-tight">{link.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="px-4 py-5 border-t border-white/10 bg-[#081529]/90">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-black text-sm font-semibold transition-all duration-300 border border-slate-200"
                        >
                            <span className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-100">
                                    <LogOut className="h-4 w-4 text-slate-700" />
                                </span>
                                {t("auth.logOut")}
                            </span>
                            <span className="text-xs text-slate-500">{t("misc.exit")}</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};
