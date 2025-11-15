import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";

// Student (User) pages
import Dashboard from "./pages/User_Student/Dashboard";
import Profile from "./pages/User_Student/Profile";
import EquipmentCatalogue from "./pages/User_Student/EquipmentCatalogue";
import EquipmentDetails from "./pages/User_Student/EquipmentDetails";
import BorrowRequest from "./pages/User_Student/BorrowRequest";
import MyBorrowedItems from "./pages/User_Student/MyBorrowedItems";
import Notifications from "./pages/User_Student/Notifications";
import HelpSupport from "./pages/User_Student/HelpSupport";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                <Route path="/login" element={<Login />} />

                {/* Student (User) Pages */}
                <Route path="/student/dashboard" element={<Dashboard />} />
                <Route path="/student/profile" element={<Profile />} />

                {/* Equipment browsing */}
                <Route path="/student/browse" element={<EquipmentCatalogue />} />
                <Route path="/student/equipment/:id" element={<EquipmentDetails />} />

                {/* Borrowing */}
                <Route path="/student/borrow-request" element={<BorrowRequest />} />
                <Route path="/student/borrowed-items" element={<MyBorrowedItems />} />

                {/* Other pages */}
                <Route path="/student/notifications" element={<Notifications />} />
                <Route path="/student/help" element={<HelpSupport />} />

                {/* Default and fallback */}
                <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}


