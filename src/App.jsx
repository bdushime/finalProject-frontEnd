import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

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
import Score from "./pages/User_Student/Score";
import Report from "./pages/User_Student/Report";

// IT Staff pages
import { Dashboard as ITStaffDashboard } from "./pages/IT_Staff/Dashboard";
import BrowseEquipment from "./pages/IT_Staff/BrowseEquipment";
import ITStaffProfile from "./pages/IT_Staff/Profile";
import ITStaffNotifications from "./pages/IT_Staff/ITStaffNotifications";
import ITStaffEquipmentDetails from "./pages/IT_Staff/EquipmentDetails";
import IoTTrackerLiveView from "./pages/IT_Staff/IoTTrackerLiveView";
import CurrentCheckouts from "./pages/IT_Staff/CurrentCheckouts";
import CheckoutHistory from "./pages/IT_Staff/CheckoutHistory";
import SearchResults from "./pages/IT_Staff/SearchResults";
import ReportsPage from "./pages/IT_Staff/reports/ReportsPage";

// IT Staff checkout flow
import SelectEquipment from "./pages/IT_Staff/checkout/SelectEquipment";
import ScanQRCode from "./pages/IT_Staff/checkout/ScanQRCode";
import CaptureCondition from "./pages/IT_Staff/checkout/CaptureCondition";
import CheckoutDetailsDialog from "./pages/IT_Staff/checkout/CheckoutDetailsDialog";
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

export default function App() {
<<<<<<< HEAD
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
=======
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
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776

        {/* Student (User) Pages - protected */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Equipment browsing */}
        <Route
          path="/student/browse"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EquipmentCatalogue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/equipment/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EquipmentDetails />
            </ProtectedRoute>
          }
        />

<<<<<<< HEAD
        {/* Borrowing */}
        <Route
          path="/student/borrow-request"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BorrowRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/borrowed-items"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyBorrowedItems />
            </ProtectedRoute>
          }
        />
=======
                {/* Borrowing */}
                <Route path="/student/borrow-request" element={<BorrowRequest />} />
                <Route path="/student/borrowed-items" element={<MyBorrowedItems />} />
                <Route path="/student/return" element={<ReturnEquipment />} />
                <Route path="/student/score" element={<Score />} />
                <Route path="/student/report" element={<Report />} />
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776

        {/* Other student pages */}
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/help"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <HelpSupport />
            </ProtectedRoute>
          }
        />

<<<<<<< HEAD
        {/* IT Staff routes - protected */}
        <Route
          path="/it/dashboard"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ITStaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/browse"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <BrowseEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/reports"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
            <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/profile"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ITStaffProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/notifications"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ITStaffNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/equipment/:id"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ITStaffEquipmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/iot-tracker"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <IoTTrackerLiveView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/current-checkouts"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <CurrentCheckouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout-history"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <CheckoutHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/search-results"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <SearchResults />
            </ProtectedRoute>
          }
        />

        {/* IT Staff checkout flow */}
        <Route
          path="/it/checkout/select-equipment"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <SelectEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout/scan-qrcode"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ScanQRCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout/capture-condition"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <CaptureCondition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout/details"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <CheckoutDetailsDialog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout/signature"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <DigitalSignature />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/checkout/confirmation"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <CheckoutConfirmation />
            </ProtectedRoute>
          }
        />

        {/* IT Staff return flow */}
        <Route
          path="/it/return/select-item"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <SelectReturnItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/return/scan"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ReturnScan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it/return/confirmation"
          element={
            <ProtectedRoute allowedRoles={["it"]}>
              <ReturnConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Security routes - protected */}
        <Route
          path="/security/dashboard"
          element={
            <ProtectedRoute allowedRoles={["security"]}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/logs"
          element={
            <ProtectedRoute allowedRoles={["security"]}>
              <Accesslogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/active-checkouts"
          element={
            <ProtectedRoute allowedRoles={["security"]}>
              <ActiveCheckouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/devices"
          element={
            <ProtectedRoute allowedRoles={["security"]}>
              <BrowseDevices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/reports"
          element={
            <ProtectedRoute allowedRoles={["security"]}>
              <SecurityReports />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
=======
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
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776
}
