import PropTypes from "prop-types";
import ITStaffTopbar from "./ITStaffTopbar";

// 👇 FIX: Add 'customHeaderActions' to the props list
export default function ITStaffLayout({ children, customHeaderActions, maxWidth = "max-w-[1400px]" }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50">
            {/* IT Staff Topbar */}
            <ITStaffTopbar customHeaderActions={customHeaderActions} />

            {/* Main content - Enforcing consistent width/alignment for ALL pages */}
            <main className={`w-full ${maxWidth} mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]`}>
                {children}
            </main>
        </div>
    );
}

ITStaffLayout.propTypes = {
    children: PropTypes.node,
    customHeaderActions: PropTypes.node, // 👈 Added prop validation
    maxWidth: PropTypes.string,
};