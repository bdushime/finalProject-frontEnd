import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, ClipboardList, Bell, User, HelpCircle, LogOut, Shield, FileText } from "lucide-react";
import logo from "@/assets/images/logo8noback.png";

const links = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutGrid },
    { name: "Equipment", path: "/student/browse", icon: Package },
    { name: "Borrowed Items", path: "/student/borrowed-items", icon: ClipboardList },
    { name: "Score", path: "/student/score", icon: Shield },
    { name: "Report", path: "/student/report", icon: FileText },
    { name: "Notifications", path: "/student/notifications", icon: Bell },
    { name: "Profile", path: "/student/profile", icon: User },
    { name: "Help & Support", path: "/student/help", icon: HelpCircle },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: -260, opacity: 0 }}
                animate={{ x: isOpen ? 0 : -260, opacity: isOpen ? 1 : 0.9 }}
                exit={{ x: -260, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed left-0 top-0 h-screen w-64 z-40 bg-[#0a1b35] text-white shadow-2xl"
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 bg-[#0a1b35]">
                        <img src={logo} alt="Tracknity logo" className="h-10 w-10 object-contain drop-shadow-sm" />
                        <div>
                            <div className="text-white font-semibold text-lg leading-tight">Tracknity</div>
                            <p className="text-xs text-slate-200/80">Student Portal</p>
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
                                            ? "bg-white/10 text-white shadow-[0_12px_30px_-18px_rgba(59,130,246,0.8)] border border-white/10"
                                            : "text-white/80 hover:bg-white/5 hover:text-white"
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
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-sky-500/15 text-white text-sm font-semibold transition-all duration-300 shadow-[0_12px_28px_-18px_rgba(59,130,246,0.6)]"
                        >
                            <span className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/10">
                                    <LogOut className="h-4 w-4 text-sky-100" />
                                </span>
                                Log out
                            </span>
                            <span className="text-xs text-slate-200/80">Exit</span>
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


