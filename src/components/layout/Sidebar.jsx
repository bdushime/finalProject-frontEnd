import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, Package, ClipboardList, Bell, User, HelpCircle } from "lucide-react";
import logo from "@/assets/images/logo.svg";

const links = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutGrid },
    { name: "Equipment", path: "/student/browse", icon: Package },
    { name: "Borrowed Items", path: "/student/borrowed-items", icon: ClipboardList },
    { name: "Notifications", path: "/student/notifications", icon: Bell },
    { name: "Profile", path: "/student/profile", icon: User },
    { name: "Help & Support", path: "/student/help", icon: HelpCircle },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <AnimatePresence>
            <motion.aside
                initial={{ x: -260, opacity: 0 }}
                animate={{ x: isOpen ? 0 : -260, opacity: isOpen ? 1 : 0.8 }}
                exit={{ x: -260, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed left-0 top-0 h-screen w-60 z-40 bg-[#1A2240] dark:bg-[#1E2546]"
                aria-label="Sidebar"
            >
                <div className="h-full flex flex-col">
                    <div className="flex justify-center items-center gap-3 px-6 py-5 border-b border-white/10">
                        <img src={logo} alt="Tracknity" className="w-24 h-24 color-white" />
                    </div>

                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path ||
                                (link.path !== "/student/dashboard" && location.pathname.startsWith(link.path));
                            const Icon = link.icon;

                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => {
                                        if (window.innerWidth < 640 && onClose) {
                                            onClose();
                                        }
                                    }}
                                    className={({ isActive: navIsActive }) => {
                                        const active = navIsActive || isActive;
                                        return `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                                ? "bg-white/10 text-white shadow-sm"
                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                            }`;
                                    }}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{link.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};


