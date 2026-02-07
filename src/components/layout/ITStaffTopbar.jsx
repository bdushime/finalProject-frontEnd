import PropTypes from "prop-types";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Menu,
    Settings,
    Bell,
    X,
    Plus,
    FileText,
    LayoutGrid,
    Package,
    ClipboardList,
    Radio,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/tracknity_logo.jpeg";
import smallLogo from "@/assets/logo_small.png";
import api from "@/utils/api"; // ✅ Import API

const itStaffLinks = [
    { name: "Dashboard", path: "/it/dashboard", icon: LayoutGrid },
    { name: "Browse Equipment", path: "/it/browse", icon: Package },
    { name: "Current Checkouts", path: "/it/current-checkouts", icon: ClipboardList },
    { name: "IoT Live View", path: "/it/iot-tracker", icon: Radio },
    { name: "Notifications", path: "/it/notifications", icon: Bell },
    { name: "Reports", path: "/it/reports", icon: FileText },
];

const getPageHeaders = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 18) {
        timeGreeting = "Good afternoon";
    } else if (hour >= 18) {
        timeGreeting = "Good evening";
    }

    return {
        "/it/dashboard": {
            title: `${timeGreeting}, IT Staff!`,
            description: "Monitor equipment inventory, checkouts, and system activity.",
            actionButton: { label: "New Checkout", path: "/it/checkout/select-equipment", icon: Plus },
        },
        "/it/browse": {
            title: "Browse Equipment",
            description: "Search, view, and manage all equipment in the system.",
            actionButton: { label: "New Checkout", path: "/it/checkout/select-equipment", icon: Plus },
        },
        "/it/current-checkouts": {
            title: "Current Checkouts",
            description: "View and manage all currently checked out equipment.",
            actionButton: { label: "New Checkout", path: "/it/checkout/select-equipment", icon: Plus },
        },
        "/it/reports": {
            title: "Reports",
            description: "Generate and view detailed reports on equipment usage.",
            actionButton: { label: "Generate Report", path: "/it/reports", icon: FileText },
        },
        "/it/iot-tracker": {
            title: "IoT Live View",
            description: "Monitor real-time location and status of equipment using IoT tracking.",
            actionButton: null,
        },
        "/it/notifications": {
            title: "Notifications",
            description: "View and manage all system notifications and alerts.",
            actionButton: null,
        },
        "/it/profile": {
            title: "Profile",
            description: "Manage your IT staff profile and account details.",
            actionButton: null,
        },
        "/it/checkout-history": {
            title: "Checkout History",
            description: "View complete history of all equipment checkouts and returns.",
            actionButton: null,
        },
    };
};

export default function ITStaffTopbar({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // 👇 STATE FOR DYNAMIC BADGE
    const [unreadCount, setUnreadCount] = useState(0);

    // 👇 FETCH NOTIFICATIONS LOGIC
    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications');
            // Filter only unread messages
            const count = res.data.filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (err) {
            console.error("Failed to fetch notification count", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount(); // Fetch immediately on mount

        // Auto-refresh every 15 seconds so badge stays updated
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [location.pathname]); // Also refresh when changing pages

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isLinkActive = (path) => {
        if (path === "/it/dashboard") {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(path);
    };

    const pageHeaders = getPageHeaders();
    const currentPath = location.pathname;
    const pageHeader = pageHeaders[currentPath] || (currentPath.startsWith("/it/") ? pageHeaders["/it/dashboard"] : null);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    const handleActionClick = () => {
        if (pageHeader?.actionButton) {
            navigate(pageHeader.actionButton.path);
        }
    };

    return (
        <div className="w-full">
            {/* Main Navbar */}
            <div className={`w-full px-1 py-1 flex items-center gap-2 justify-between transition-all duration-300 ${isScrolled ? "rounded-b-lg bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
                
                {/* Mobile menu button */}
                <Button variant="outline" size="icon" className="sm:hidden border-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* Logos */}
                <img src={smallLogo} alt="Tracknity" className="block md:hidden w-12 rounded-full" />
                <img src={logo} alt="Tracknity" className="hidden md:block rounded-full w-32 h-14" />

                {/* Desktop Navigation + Mobile Menu */}
                <div className={`${isMobileMenuOpen ? "flex flex-col justify-center items-center absolute top-full left-0 right-0 rounded-b-lg bg-yellow-50 shadow-lg p-4 gap-3 z-50 w-2/3" : "hidden"} sm:flex sm:flex-row sm:relative sm:shadow-none sm:p-0 items-center gap-1`}>
                    
                    <header className={`${!isMobileMenuOpen ? "rounded-full border border-gray-300 shadow-sm w-full sm:w-auto bg-white/50" : "empty:hidden"}`}>
                        <div className={`${!isMobileMenuOpen ? "flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-1" : "empty:hidden justify-center items-center"}`}>
                            <nav className="flex flex-col sm:flex-row items-stretch justify-between gap-1 sm:gap-0">
                                {itStaffLinks.map((link) => {
                                    const active = isLinkActive(link.path);
                                    return (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            className={({ isActive }) =>
                                                ["flex w-full justify-center items-center text-sm font-medium transition-colors px-3 py-2",
                                                    active || isActive ? "bg-[#1A2240] text-gray-100 shadow-sm rounded-full" : "text-slate-600 hover:bg-[#1A2240]/5 hover:rounded-full hover:text-slate-900"
                                                ].join(" ")
                                            }
                                        >
                                            <span className="truncate">{link.name}</span>
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                    </header>

                    {/* Settings button */}
                    <Link to="/it/settings" className="w-full sm:w-auto">
                        <Button variant="outline" className={`border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto bg-white ${isMobileMenuOpen ? "justify-center border-none shadow-none" : ""}`}>
                            {isMobileMenuOpen ? <span>Settings</span> : <Settings className="h-4 w-4" />}
                        </Button>
                    </Link>

                    {/* Notifications button (desktop only) */}
                    {!isMobileMenuOpen && (
                        <Link to="/it/notifications" className="w-full sm:w-auto">
                            <Button variant="outline" size="icon" className="relative border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto bg-white">
                                <Bell className="h-4 w-4" />
                                {/* 👇 DYNAMIC BADGE */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in duration-200">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    )}

                    {/* Profile dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={`border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto bg-white ${isMobileMenuOpen ? "justify-center border-none shadow-none" : ""}`}>
                                {isMobileMenuOpen ? <span>My Account</span> : <Avatar><AvatarFallback className="text-md font-bold bg-[#1A2240] text-white">IT</AvatarFallback></Avatar>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-none bg-[#f0f0f5] shadow-xl rounded-lg">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer"><Link to="/it/profile">Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer"><Link to="/it/settings">Settings</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700"><Link to="/login">Logout</Link></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Page Header Section */}
            {pageHeader && (
                <div className="w-full px-4 sm:px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">{pageHeader.title}</h1>
                            <p className="text-gray-600 text-sm sm:text-base mb-2">{formattedDate}</p>
                            {pageHeader.description && <p className="text-gray-700 text-sm sm:text-base max-w-2xl">{pageHeader.description}</p>}
                        </div>
                        {pageHeader.actionButton && (
                            <Button onClick={handleActionClick} className="bg-[#0b1d3a] hover:bg-[#0b1d3a]/90 text-white gap-2 shrink-0 rounded-full px-6">
                                {pageHeader.actionButton.icon && <pageHeader.actionButton.icon className="h-4 w-4" />}
                                {pageHeader.actionButton.label}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

ITStaffTopbar.propTypes = {
    onMenuClick: PropTypes.func,
};