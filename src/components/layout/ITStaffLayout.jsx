import PropTypes from "prop-types";
import ITStaffTopbar from "./ITStaffTopbar";

export default function ITStaffLayout({ children, customHeaderActions }) {
    return (
        <div className="bg-linear-to-br from-white to-yellow-100">
            {/* IT Staff Topbar */}
            <ITStaffTopbar customHeaderActions={customHeaderActions} />

            {/* Main content */}
            <main className="w-full sm:px-6 py-4">
                {children}
            </main>
        </div>
    );
}

ITStaffLayout.propTypes = {
    children: PropTypes.node,
    customHeaderActions: PropTypes.node,
};
