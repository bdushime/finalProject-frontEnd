import PropTypes from "prop-types";
import StudentTopbar from "./StudentTopbar";

export default function StudentLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            {/* Student Topbar */}
            <StudentTopbar />

            {/* Main content */}
            <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 sm:px-6 py-4">
                {children}
            </main>
        </div>
    );
}

StudentLayout.propTypes = {
    children: PropTypes.node,
};
