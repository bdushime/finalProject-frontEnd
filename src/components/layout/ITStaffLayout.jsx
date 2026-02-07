import PropTypes from "prop-types";
import ITStaffTopbar from "./ITStaffTopbar";

export default function ITStaffLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50">
            {/* IT Staff Topbar */}
            <ITStaffTopbar />

            {/* Main content */}
            <main className="w-full sm:px-6 py-4">
                {children}
            </main>
        </div>
    );
}

ITStaffLayout.propTypes = {
    children: PropTypes.node,
};