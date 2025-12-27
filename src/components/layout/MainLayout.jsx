import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Bell } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

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
        <div className="min-h-screen bg-[#f3f6fb]">
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
            <header className="sticky top-0 z-40 bg-[#f3f6fb] pt-4 pb-2">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center justify-between">
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
                            className="px-5 py-2.5 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
                        >
                            <span className="text-sm font-bold text-[#0b1d3a]">Tracknity</span>
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <TopNav />

                    {/* Right: Settings, Notification, Profile */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/student/settings"
                            className="p-2 gap-1 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
                            aria-label="Settings"
                        >
                            <Settings className="h-5 w-5" /> <span> Setting</span>
                        </Link>

                        <Link
                            to="/student/notifications"
                            className="relative h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/student/profile"
                            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <div className="h-8 w-8 rounded-full bg-[#0b69d4] flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">J</span>
                            </div>
                            <div className="text-left leading-tight hidden sm:block">
                                <p className="text-sm font-semibold text-[#0b1d3a]">Juls</p>
                                <p className="text-[11px] text-gray-500">Student</p>
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
