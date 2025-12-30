import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Landing
import Landing from "./pages/Landing";

// Auth
import Auth from "./pages/auth/Auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerify from "./pages/auth/OTPVerify";

// Admin pages
import AdminDashboard from "./pages/Sys_Admin/Dashboard";
import UsersList from "./pages/Sys_Admin/UserManagement/UsersList";
import ConfigPage from "./pages/Sys_Admin/Configuration/ConfigPage";
import { DataPage, MonitoringPage, ReportsPage, SecurityPage, TrackingPage, ScannerPage } from "./pages/Sys_Admin/routes_stubs";

// Student (User) pages
import Dashboard from "./pages/User_Student/Dashboard";
import Profile from "./pages/User_Student/Profile";
import EquipmentCatalogue from "./pages/User_Student/EquipmentCatalogue";
import EquipmentDetails from "./pages/User_Student/EquipmentDetails";
import BorrowRequest from "./pages/User_Student/BorrowRequest";
import MyBorrowedItems from "./pages/User_Student/MyBorrowedItems";
import Notifications from "./pages/User_Student/Notifications";
import HelpSupport from "./pages/User_Student/HelpSupport";
import ReturnEquipment from "./pages/User_Student/ReturnEquipment";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<Landing />} />

                {/* Auth Pages */}
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/otp-verify" element={<OTPVerify />} />

                {/* Student (User) Pages */}
                <Route path="/student/dashboard" element={<Dashboard />} />
                <Route path="/student/profile" element={<Profile />} />

                {/* Equipment browsing */}
                <Route path="/student/browse" element={<EquipmentCatalogue />} />
                <Route path="/student/equipment/:id" element={<EquipmentDetails />} />

                {/* Borrowing */}
                <Route path="/student/borrow-request" element={<BorrowRequest />} />
                <Route path="/student/borrowed-items" element={<MyBorrowedItems />} />
                <Route path="/student/return" element={<ReturnEquipment />} />

                {/* Other pages */}
                <Route path="/student/notifications" element={<Notifications />} />
                <Route path="/student/help" element={<HelpSupport />} />

                {/* Admin Pages */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersList />} />
                <Route path="/admin/config" element={<ConfigPage />} />
                <Route path="/admin/data" element={<DataPage />} />
                <Route path="/admin/monitoring" element={<MonitoringPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="/admin/security" element={<SecurityPage />} />
                <Route path="/admin/tracking" element={<TrackingPage />} />
                <Route path="/admin/scan" element={<ScannerPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}


