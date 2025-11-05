import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Student pages
import Login from "./pages/auth/Login";
import { Dashboard } from "./pages/student/Dashboard";
import Profile from "./pages/student/Profile";
import BrowseEquipment from "./pages/student/BrowseEquipment";
import EquipmentDetails from "./pages/student/EquipmentDetails";
import SearchResults from "./pages/student/SearchResults";

import SelectEquipment from "./pages/student/checkout/SelectEquipment";
import ScanQRCode from "./pages/student/checkout/ScanQRCode";
import CaptureCondition from "./pages/student/checkout/CaptureCondition";
import CheckoutDetails from "./pages/student/checkout/CheckoutDetails";
import DigitalSignature from "./pages/student/checkout/DigitalSignature";
import CheckoutConfirmation from "./pages/student/checkout/CheckoutConfirmation";

import SelectReturnItem from "./pages/student/return/SelectReturnItem";
import ReturnScan from "./pages/student/return/ReturnScan";
import ReturnConfirmation from "./pages/student/return/ReturnConfirmation";

import ScoreDashboard from "./pages/student/ScoreDashboard";
import CurrentCheckouts from "./pages/student/CurrentCheckouts";
import CheckoutHistory from "./pages/student/CheckoutHistory";
import Notifications from "./pages/student/Notifications";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Auth */}
				<Route path="/login" element={<Login />} />

				{/* Student main */}
				<Route path="/student/dashboard" element={<Dashboard />} />
				<Route path="/student/profile" element={<Profile />} />

				{/* Equipment browsing */}
				<Route path="/student/browse" element={<BrowseEquipment />} />
				<Route path="/student/equipment/:id" element={<EquipmentDetails />} />
				<Route path="/student/search" element={<SearchResults />} />

				{/* Checkout workflow */}
				<Route path="/student/checkout/select" element={<SelectEquipment />} />
				<Route path="/student/checkout/scan" element={<ScanQRCode />} />
				<Route path="/student/checkout/photo" element={<CaptureCondition />} />
				<Route path="/student/checkout/details" element={<CheckoutDetails />} />
				<Route path="/student/checkout/sign" element={<DigitalSignature />} />
				<Route path="/student/checkout/done" element={<CheckoutConfirmation />} />

				{/* Return workflow */}
				<Route path="/student/return/select" element={<SelectReturnItem />} />
				<Route path="/student/return/scan" element={<ReturnScan />} />
				<Route path="/student/return/done" element={<ReturnConfirmation />} />

				{/* Accountability & history */}
				<Route path="/student/score" element={<ScoreDashboard />} />
				<Route path="/student/current-checkouts" element={<CurrentCheckouts />} />
				<Route path="/student/history" element={<CheckoutHistory />} />
				<Route path="/student/notifications" element={<Notifications />} />

				{/* Default and fallback */}
				<Route path="/" element={<Navigate to="/student/dashboard" replace />} />
				<Route path="*" element={<Navigate to="/student/dashboard" replace />} />
			</Routes>
		</BrowserRouter>
	);
}


