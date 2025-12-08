import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        try {
            const stored = localStorage.getItem("sidebarOpen");
            if (stored !== null) {
                return stored === "1";
            }
            if (typeof window !== "undefined") {
                return window.innerWidth >= 640;
            }
            return false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("sidebarOpen", sidebarOpen ? "1" : "0");
        } catch {
        }
    }, [sidebarOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                setSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const location = useLocation();
    useEffect(() => {
        const checkMobile = () => window.innerWidth < 640;
        if (checkMobile()) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#f3f6fb]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 sm:hidden z-30"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}
            <div className="sm:pl-64 flex flex-col min-h-screen">
                <div className="sm:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 p-4">
                    <Button variant="outline" size="icon" onClick={() => setSidebarOpen((v) => !v)} aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
                <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-8 py-8 mt-16 sm:mt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}

DashboardLayout.propTypes = {
    children: PropTypes.node,
};


