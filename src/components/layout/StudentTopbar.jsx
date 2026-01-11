import PropTypes from "prop-types";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Bell, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/images/logo8noback.png";

const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Equipment", path: "/student/browse" },
    { name: "Borrowed Items", path: "/student/borrowed-items" },
    { name: "Score", path: "/student/score" },
    { name: "Report", path: "/student/report" },
    { name: "Help & Support", path: "/student/help" },
];

export default function StudentTopbar({ onMenuClick }) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const unreadCount = 3; 

    // --- NEW: State for Dynamic User Info ---
    const [user, setUser] = useState({
        name: "Student",
        initial: "S",
        role: "Student"
    });

    // --- NEW: Load User from Local Storage ---
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                
                // Get Name
                const displayName = userData.fullName || userData.username || "Student";
                
                // Get Initial (First letter of name)
                const displayInitial = displayName.charAt(0).toUpperCase();

                // Get Role
                const displayRole = userData.role || "Student";

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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isLinkActive = (path) => {
        if (path === "/student/dashboard") {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(path);
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    const handleLogout = () => {
        // Optional: Clear storage on logout so the next user is fresh
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <div className="w-full">
            {/* Main Navbar */}
            <header className="sticky top-0 z-40 bg-white pt-4 pb-2">
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
                            to="/student/dashboard"
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
                            {studentLinks.map((link) => {
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

                    {/* Right: Settings, Notification, Profile */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/student/settings"
                            className="hidden sm:flex h-11 px-5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 text-[#0b1d3a] items-center gap-2 hover:bg-white/60 transition-all hover:shadow-sm group hover:scale-105"
                            aria-label="Settings"
                        >
                            <Settings className="h-5 w-5 text-[#0b1d3a]" />
                            <span className="font-medium text-sm">Settings</span>
                        </Link>

                        <Link
                            to="/student/notifications"
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
                                    {/* DYNAMIC AVATAR INITIAL */}
                                    <div className="h-9 w-9 rounded-full bg-[#126dd5] flex items-center justify-center shadow-sm border border-white/50">
                                        <span className="text-white font-bold text-sm">{user.initial}</span>
                                    </div>
                                    <div className="text-left leading-tight hidden sm:block">
                                        {/* DYNAMIC NAME */}
                                        <p className="text-sm font-bold text-[#0b1d3a] group-hover:text-[#126dd5] transition-colors">
                                            {user.name}
                                        </p>
                                        {/* DYNAMIC ROLE */}
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#126dd5]/80">
                                            {user.role}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/student/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/student/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    {/* Added logout handler to clear storage */}
                                    <Link to="/login" onClick={handleLogout}>Logout</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
                        <nav className="flex flex-col p-4 gap-2">
                            {studentLinks.map((link) => {
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
                            <div className="border-t pt-2 mt-2">
                                <Link
                                    to="/student/settings"
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Welcome Section - Also made Dynamic! */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {getGreeting()}, {user.name}!
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">{formattedDate}</p>
            </div>
        </div>
    );
}

StudentTopbar.propTypes = {
    onMenuClick: PropTypes.func,
};