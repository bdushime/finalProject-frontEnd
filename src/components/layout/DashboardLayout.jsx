import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Settings, Bell } from "lucide-react";
import TopNav from "@/components/layout/TopNav";

const DESKTOP_BREAKPOINT = 640; 

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const unreadCount = 3; // Replace with actual notification count

  const location = useLocation();
  useEffect(() => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;

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

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    {/* Left: Mobile menu + Logo in pill */}
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
                            className="px-6 py-2.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
                        >
                            <span className="text-base font-bold text-[#0b1d3a]">Tracknity</span>
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <TopNav />

                    {/* Right: Settings, Notifications, Profile */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/student/settings"
                            className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            aria-label="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>

                        <Link
                            to="/student/notifications"
                            className="relative h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-[#0b69d4] text-white text-[11px] font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/student/profile"
                            className="h-10 w-10 rounded-full bg-[#0b69d4] flex items-center justify-center hover:bg-[#0f7de5] transition-colors"
                        >
                            <span className="text-white font-bold text-sm">J</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-6 py-6">
                {children}
            </main>
        </div>
    );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
