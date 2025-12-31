import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";

const links = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Equipment", path: "/student/browse" },
    { name: "Borrowed Items", path: "/student/borrowed-items" },
    { name: "Score", path: "/student/score" },
    { name: "Report", path: "/student/report" },
    { name: "Help & Support", path: "/student/help" },
];

export default function TopNav() {
    const location = useLocation();

    return (
        <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)]">
                {links.map((link) => {
                    const isActive = location.pathname === link.path ||
                        (link.path !== "/student/dashboard" && location.pathname.startsWith(link.path));

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
    );
}

TopNav.propTypes = {
    onMenuClick: PropTypes.func,
};
