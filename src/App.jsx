import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Landing & Auth
import Landing from "./pages/Landing";
import Auth from "./pages/auth/Auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTPVerify from "./pages/auth/OTPVerify";

// Admin pages
import AdminDashboard from "./pages/Sys_Admin/Dashboard";
import UsersList from "./pages/Sys_Admin/UserManagement/UsersList";
import ConfigPage from "./pages/Sys_Admin/Configuration/ConfigPage";
import { DataPage, MonitoringPage, ReportsPage, SecurityPage, TrackingPage, ScannerPage } from "./pages/Sys_Admin/routes_stubs";
import AdminNotifications from "./pages/Sys_Admin/AdminNotifications";
import AdminProfile from "./pages/Sys_Admin/AdminProfile";

// Student (User) pages
import Dashboard from "./pages/User_Student/Dashboard";
import Profile from "./pages/User_Student/Profile";
import EquipmentCatalogue from "./pages/User_Student/EquipmentCatalogue";
import EquipmentDetails from "./pages/User_Student/EquipmentDetails";
import PackageDetails from "./pages/User_Student/PackageDetails";
import BorrowRequest from "./pages/User_Student/BorrowRequest";
import MyBorrowedItems from "./pages/User_Student/MyBorrowedItems";
import Notifications from "./pages/User_Student/Notifications";
import HelpSupport from "./pages/User_Student/HelpSupport";
import ReturnEquipment from "./pages/User_Student/ReturnEquipment";
import Score from "./pages/User_Student/Score";
import Report from "./pages/User_Student/Report";

// IT Staff pages
import { Dashboard as ITStaffDashboard } from "./pages/IT_Staff/Dashboard";
import BrowseEquipment from "./pages/IT_Staff/BrowseEquipment";
import SimpleReports from "./pages/IT_Staff/SimpleReports"; // Used SimpleReports as requested
import ITStaffProfile from "./pages/IT_Staff/Profile";
import ITStaffNotifications from "./pages/IT_Staff/ITStaffNotifications";
import ITStaffEquipmentDetails from "./pages/IT_Staff/EquipmentDetails";
import IoTTrackerLiveView from "./pages/IT_Staff/IoTTrackerLiveView";
import CurrentCheckouts from "./pages/IT_Staff/CurrentCheckouts";
import CheckoutHistory from "./pages/IT_Staff/CheckoutHistory";
import SearchResults from "./pages/IT_Staff/SearchResults";
import ClassroomManagement from "./pages/IT_Staff/ClassroomManagement";

// IT Staff checkout flow

import ScanQRCode from "./pages/IT_Staff/checkout/ScanQRCode";
import CaptureCondition from "./pages/IT_Staff/checkout/CaptureCondition";
import CheckoutForm from "./pages/IT_Staff/checkout/CheckoutForm";
import DigitalSignature from "./pages/IT_Staff/checkout/DigitalSignature";
import CheckoutConfirmation from "./pages/IT_Staff/checkout/CheckoutConfirmation";

// IT Staff return flow
import SelectReturnItem from "./pages/IT_Staff/return/SelectReturnItem";
import ReturnScan from "./pages/IT_Staff/return/ReturnScan";
import ReturnConfirmation from "./pages/IT_Staff/return/ReturnConfirmation";

// Security pages
import SecurityDashboard from "./pages/security/SecurityDashboard";
import Accesslogs from "./pages/security/Accesslogs";
import ActiveCheckouts from "./pages/security/checkouts/ActiveCheckouts";
import BrowseDevices from "./pages/security/BrowseDevices";
import SecurityReports from "./pages/security/Reports";
import SecurityNotifications from "./pages/security/Notifications";
import DeviceMovementHistory from "./pages/security/DeviceMovementHistory";
import SecurityProfile from "./pages/security/Profile";

import { Toaster } from "sonner";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
                {/* ==========================
            PUBLIC ROUTES
        =========================== */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/otp-verify" element={<OTPVerify />} />

                {/* Student (User) Pages */}
                <Route path="/student/dashboard" element={<Dashboard />} />
                <Route path="/student/profile" element={<Profile />} />
                <Route path="/student/browse" element={<EquipmentCatalogue />} />
                <Route path="/student/equipment/:id" element={<EquipmentDetails />} />
                <Route path="/student/package/:packageId" element={<PackageDetails />} />
                <Route path="/student/borrow-request" element={<BorrowRequest />} />
                <Route path="/student/borrowed-items" element={<MyBorrowedItems />} />
                <Route path="/student/return" element={<ReturnEquipment />} />
                <Route path="/student/score" element={<Score />} />
                <Route path="/student/report" element={<Report />} />
                <Route path="/student/notifications" element={<Notifications />} />
                <Route path="/student/help" element={<HelpSupport />} />

                {/* IT Staff Pages */}
                <Route path="/it/dashboard" element={<ITStaffDashboard />} />
                <Route path="/it/browse" element={<BrowseEquipment />} />
                {/* <Route path="/it/reports" element={<ITReportsPage />} /> */}
                <Route path="/it/reports" element={<SimpleReports />} />
                <Route path="/it/profile" element={<ITStaffProfile />} />
                <Route path="/it/notifications" element={<ITStaffNotifications />} />
                <Route path="/it/equipment/:id" element={<ITStaffEquipmentDetails />} />
                <Route path="/it/iot-tracker" element={<IoTTrackerLiveView />} />
                <Route path="/it/current-checkouts" element={<CurrentCheckouts />} />
                <Route path="/it/checkout-history" element={<CheckoutHistory />} />
                <Route path="/it/search-results" element={<SearchResults />} />
                <Route path="/it/classrooms" element={<ClassroomManagement />} />

                {/* IT Staff Checkout Flow (UPDATED PATHS) 📦 */}

                <Route path="/it/checkout/scan" element={<ScanQRCode />} />
                <Route path="/it/checkout/photo" element={<CaptureCondition />} />
                <Route path="/it/checkout/details" element={<CheckoutForm />} />
                <Route path="/it/checkout/sign" element={<DigitalSignature />} />
                <Route path="/it/checkout/confirmation" element={<CheckoutConfirmation />} />

                {/* IT Staff Return Flow */}
                <Route path="/it/return/select-item" element={<SelectReturnItem />} />
                <Route path="/it/return/scan" element={<ReturnScan />} />
                <Route path="/it/return/confirmation" element={<ReturnConfirmation />} />

                {/* Security Pages */}
                <Route path="/security/dashboard" element={<SecurityDashboard />} />
                <Route path="/security/logs" element={<Accesslogs />} />
                <Route path="/security/active-checkouts" element={<ActiveCheckouts />} />
                <Route path="/security/devices" element={<BrowseDevices />} />
                <Route path="/security/reports" element={<SecurityReports />} />
                <Route path="/security/notifications" element={<SecurityNotifications />} />
                <Route path="/security/device-movement/:deviceId" element={<DeviceMovementHistory />} />
                <Route path="/security/device-movement" element={<DeviceMovementHistory />} />

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
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/profile" element={<AdminProfile />} />

                {/* Fallback */}
                {/* ==========================
            🔒 STUDENT ROUTES
        =========================== */}
                <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                    <Route path="/student/dashboard" element={<Dashboard />} />
                    <Route path="/student/profile" element={<Profile />} />
                    <Route path="/student/browse" element={<EquipmentCatalogue />} />
                    <Route path="/student/package/:packageId" element={<PackageDetails />} />
                    <Route path="/student/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/student/borrow-request" element={<BorrowRequest />} />
                    <Route path="/student/borrowed-items" element={<MyBorrowedItems />} />
                    <Route path="/student/return" element={<ReturnEquipment />} />
                    <Route path="/student/score" element={<Score />} />
                    <Route path="/student/report" element={<Report />} />
                    <Route path="/student/notifications" element={<Notifications />} />
                    <Route path="/student/help" element={<HelpSupport />} />
                </Route>

                {/* ==========================
            🔒 IT STAFF ROUTES
        =========================== */}
                <Route element={<ProtectedRoute allowedRoles={['IT', 'IT_Staff']} />}>
                    <Route path="/it/dashboard" element={<ITStaffDashboard />} />
                    <Route path="/it/browse" element={<BrowseEquipment />} />
                    <Route path="/it/reports" element={<SimpleReports />} />
                    <Route path="/it/profile" element={<ITStaffProfile />} />
                    <Route path="/it/notifications" element={<ITStaffNotifications />} />
                    <Route path="/it/equipment/:id" element={<ITStaffEquipmentDetails />} />
                    <Route path="/it/iot-tracker" element={<IoTTrackerLiveView />} />
                    <Route path="/it/current-checkouts" element={<CurrentCheckouts />} />
                    <Route path="/it/checkout-history" element={<CheckoutHistory />} />
                    <Route path="/it/search-results" element={<SearchResults />} />
                    <Route path="/it/classrooms" element={<ClassroomManagement />} />

                    {/* Checkout Flow */}

                    <Route path="/it/checkout/scan" element={<ScanQRCode />} />
                    <Route path="/it/checkout/photo" element={<CaptureCondition />} />
                    <Route path="/it/checkout/details" element={<CheckoutForm />} />
                    <Route path="/it/checkout/sign" element={<DigitalSignature />} />
                    <Route path="/it/checkout/confirmation" element={<CheckoutConfirmation />} />

                    {/* Return Flow */}
                    <Route path="/it/return/select-item" element={<SelectReturnItem />} />
                    <Route path="/it/return/scan" element={<ReturnScan />} />
                    <Route path="/it/return/confirmation" element={<ReturnConfirmation />} />
                </Route>

                {/* ==========================
            🔒 SECURITY ROUTES
        =========================== */}
                <Route element={<ProtectedRoute allowedRoles={['Security']} />}>
                    <Route path="/security/dashboard" element={<SecurityDashboard />} />
                    <Route path="/security/logs" element={<Accesslogs />} />
                    <Route path="/security/active-checkouts" element={<ActiveCheckouts />} />
                    <Route path="/security/devices" element={<BrowseDevices />} />
                    <Route path="/security/reports" element={<SecurityReports />} />
                    <Route path="/security/notifications" element={<SecurityNotifications />} />
                    <Route path="/security/device-movement/:deviceId" element={<DeviceMovementHistory />} />
                    <Route path="/security/device-movement/:deviceId" element={<DeviceMovementHistory />} />
                    <Route path="/security/device-movement" element={<DeviceMovementHistory />} />
                    <Route path="/security/profile" element={<SecurityProfile />} />
                </Route>

                {/* ==========================
            🔒 ADMIN ROUTES
        =========================== */}
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UsersList />} />
                    <Route path="/admin/config" element={<ConfigPage />} />
                    <Route path="/admin/data" element={<DataPage />} />
                    <Route path="/admin/monitoring" element={<MonitoringPage />} />
                    <Route path="/admin/reports" element={<ReportsPage />} />
                    <Route path="/admin/security" element={<SecurityPage />} />
                    <Route path="/admin/tracking" element={<TrackingPage />} />
                    <Route path="/admin/scan" element={<ScannerPage />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}