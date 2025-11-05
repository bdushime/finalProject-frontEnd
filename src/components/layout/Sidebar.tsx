import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Package, ClipboardList, FileText, Settings } from "lucide-react";
import logo from "@/assets/images/logo.svg";

type SidebarProps = {
	isOpen: boolean;
	onClose?: () => void;
};

const links = [
	{ name: "Dashboard", path: "/student/dashboard", icon: LayoutGrid },
	{ name: "Equipment", path: "/student/browse", icon: Package },
	{ name: "Borrowed Items", path: "/student/current-checkouts", icon: ClipboardList },
	{ name: "Reports", path: "/student/history", icon: FileText },
	{ name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen }: SidebarProps) {
	return (
        <motion.aside
			initial={{ x: -260, opacity: 0 }}
			animate={{ x: isOpen ? 0 : -260, opacity: isOpen ? 1 : 0.8 }}
			transition={{ type: "spring", stiffness: 260, damping: 30 }}
			className="fixed left-0 top-0 h-screen w-60 p-3 sm:p-4 z-40"
			aria-label="Sidebar"
		>
            <div className="h-full rounded-2xl border border-neutral-200 bg-white shadow-lg flex flex-col">
                <div className="flex justify-center items-center w-5/6 mx-auto border-b border-gray-500">
                    <img src={logo} alt="Logo" className="w-32 h-32 p-4" />
                </div>
				<nav className="p-2 space-y-1 overflow-y-auto">
                    {links.map((l) => (
                        <NavLink key={l.path} to={l.path} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-neutral-100"}`}>
							<l.icon className="h-4 w-4" />
							<span>{l.name}</span>
						</NavLink>
					))}
				</nav>
			</div>
		</motion.aside>
	);
}


