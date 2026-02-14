import PropTypes from "prop-types";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/images/logo8noback.png"; // Using Student logo as requested

const itStaffLinks = [
    { name: "Dashboard", path: "/it/dashboard" },
    { name: "Browse Equipment", path: "/it/browse" },
    { name: "Current Checkouts", path: "/it/current-checkouts" },
    { name: "IoT Live View", path: "/it/iot-tracker" },
    { name: "Classrooms", path: "/it/classrooms" },
    { name: "Notifications", path: "/it/notifications" },
    { name: "Reports", path: "/it/reports" },
];

export default function ITStaffTopbar({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const unreadCount = 5; // Hardcoded for now, or match existing logic

    // --- State for User Info ---
    const [user, setUser] = useState({
        name: "IT Staff",
        initial: "I",
        role: "IT Staff"
    });

    // --- Load User from Local Storage ---
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                const displayName = userData.fullName || userData.username || "IT Staff";
                const displayInitial = displayName.charAt(0).toUpperCase();
                const displayRole = userData.role || "IT Staff";

                setUser({
                    name: displayName,
                    initial: displayInitial,
                    role: displayRole
                });
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isLinkActive = (path) => {
        if (path === "/it/dashboard") {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <div className="w-full">
            {/* Main Navbar */}
            <header className="sticky top-0 z-40 bg-white/30 backdrop-blur-md pt-4 pb-2">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Left: Mobile menu + Logo */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-10 w-10"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                        <Link
                            to="/it/dashboard"
                            className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/50 transition-all group"
                        >
                            <img
                                src={logo}
                                alt="Tracknity"
                                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                            />
                            <span className="text-xl font-bold text-[#0b1d3a] font-serif tracking-tight hidden sm:block">
                                Tracknity
                            </span>
                        </Link>
                    </div>

                    {/* Center: Navigation (Desktop only) */}
                    <nav className="hidden lg:flex items-center">
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)]">
                            {itStaffLinks.map((link) => {
                                const isActive = isLinkActive(link.path);
                                return (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                            ? "bg-[#0b1d3a] text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        {link.name}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Right: Notification, Profile */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/it/notifications"
                            className="relative h-11 w-11 rounded-full bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#0b1d3a] hover:bg-white/60 transition-all hover:shadow-sm hover:scale-110"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5 text-[#0b1d3a]" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[1.25rem] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-11 pl-1.5 pr-5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 flex items-center gap-3 hover:bg-white/60 transition-all hover:shadow-sm group hover:scale-[1.02]">
                                    <div className="h-9 w-9 rounded-full bg-[#126dd5] flex items-center justify-center shadow-sm border border-white/50">
                                        <span className="text-white font-bold text-sm">{user.initial}</span>
                                    </div>
                                    <div className="text-left leading-tight hidden sm:block">
                                        <p className="text-sm font-bold text-[#0b1d3a] group-hover:text-[#126dd5] transition-colors">
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#126dd5]/80">
                                            {user.role}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-xl bg-white/90 backdrop-blur-lg">
                                <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-xl mb-2">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold text-[#0b1d3a]">{user.name}</p>
                                        <p className="text-xs text-[#126dd5] font-medium uppercase tracking-wider">{user.role}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild className="rounded-lg focus:bg-slate-50 focus:text-[#126dd5] cursor-pointer p-3 transition-colors">
                                    <Link to="/it/profile" className="flex items-center gap-2 font-medium">
                                        My Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                <DropdownMenuItem asChild className="rounded-lg focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer p-3 transition-colors">
                                    <Link to="/login" onClick={handleLogout} className="flex items-center gap-2 font-medium">
                                        Log Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
                        <nav className="flex flex-col p-4 gap-2">
                            {itStaffLinks.map((link) => {
                                const isActive = isLinkActive(link.path);
                                return (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-[#0b1d3a] text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {link.name}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>
        </div>
    );
}

ITStaffTopbar.propTypes = {
    onMenuClick: PropTypes.func,
};