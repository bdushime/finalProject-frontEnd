import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem("sidebarOpen");
            if (stored !== null) {
                return stored === "1";
            }
            // Default to open on large screens, closed on mobile
            if (typeof window !== "undefined") {
                return window.innerWidth >= 640; // sm breakpoint
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
            // ignore storage errors
        }
    }, [sidebarOpen]);

	// Ensure sidebar is open on large screens
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 640) {
				setSidebarOpen(true);
			}
		};

		// Check on mount
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const location = useLocation();
	useEffect(() => {
		// Close sidebar on route change only on mobile screens
		const checkMobile = () => window.innerWidth < 640; // sm breakpoint
		if (checkMobile()) {
			setSidebarOpen(false);
		}
	}, [location.pathname]);

	return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar (desktop + mobile off-canvas) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 sm:hidden z-30"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}
            {/* Content area */}
            <div className="sm:pl-60 flex flex-col min-h-screen">
				<Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
				<main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-6 py-6">
					{children}
				</main>
			</div>
		</div>
	);
}


