import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Bell } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import logo from "@/assets/images/logo8noback.png";

export default function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const unreadCount = 3; // Replace with actual count

    const location = useLocation();
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar for mobile */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}

            {/* Header - with top padding and no border */}
            <header className="sticky top-0 z-40 bg-white pt-4 pb-2">
                <div className="px-4 sm:px-6 flex items-center justify-between">
                    {/* Left: Mobile menu + Tracknity Logo */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-10 w-10"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Link
                            to="/student/dashboard"
                            className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/50 transition-all group"
                        >
                            <img src={logo} alt="Tracknity" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-[#0b1d3a] font-serif tracking-tight">
                                Tracknity
                            </span>
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <TopNav />

                    {/* Right: Settings, Notification, Profile */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/student/settings"
                            className="h-11 px-5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 text-[#0b1d3a] flex items-center gap-2 hover:bg-white/60 transition-all hover:shadow-sm group hover:scale-105"
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

                        <Link
                            to="/student/profile"
                            className="h-11 pl-1.5 pr-5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 flex items-center gap-3 hover:bg-white/60 transition-all hover:shadow-sm group hover:scale-[1.02]"
                        >
                            <div className="h-9 w-9 rounded-full bg-[#126dd5] flex items-center justify-center shadow-sm border border-white/50">
                                <span className="text-white font-bold text-sm">J</span>
                            </div>
                            <div className="text-left leading-tight hidden sm:block">
                                <p className="text-sm font-bold text-[#0b1d3a] group-hover:text-[#126dd5] transition-colors">Juls</p>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#126dd5]/80">Student</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-6 py-4">
                {children}
            </main>
        </div>
    );
}

MainLayout.propTypes = {
    children: PropTypes.node,
};
