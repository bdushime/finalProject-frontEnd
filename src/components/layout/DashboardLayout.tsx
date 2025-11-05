import { ReactNode, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
        <div className="min-h-screen bg-white text-neutral-900">
            {/* Sidebar (desktop + mobile off-canvas) */}
            <Sidebar isOpen={sidebarOpen} />
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
				<main className="flex-1 max-w-5xl mx-auto w-full sm:px-6">
					{children}
				</main>
			</div>
		</div>
	);
}


