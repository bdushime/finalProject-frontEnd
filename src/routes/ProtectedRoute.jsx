import PropTypes from "prop-types";
import { useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import api from "@/utils/api";
import { useAuth } from "@/pages/auth/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.username || "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  const getRoleDashboardPath = (role) => {
    switch (role) {
      case "Student":
        return "/student/dashboard";
      case "IT":
      case "IT_Staff":
        return "/it/dashboard";
      case "Security":
        return "/security/dashboard";
      case "Admin":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };

  // 2. Not Logged In? -> Go to Login
  if (!user) {
    // We save 'location' in state so we can redirect them back after login (optional feature)
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const fallback = getRoleDashboardPath(user.role);

  // 3. Role Check
  const userRole = user.role;

  // If roles are defined for this route AND the user doesn't have the right role:
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    // Determine where they SHOULD go based on their role
    // If they are ALREADY on their fallback page (e.g. infinite loop protection), just show it
    if (location.pathname.startsWith(fallback)) {
        return children ? children : <Outlet />;
    }
    
    // Otherwise, redirect them to their correct dashboard
    return <Navigate to={fallback} replace />;
  }

  // 4. Force first-login users onto their dashboard where modal blocks interaction.
  if (user.mustChangePassword && location.pathname !== fallback) {
    return <Navigate to={fallback} replace />;
  }

  const validateProfileData = () => {
    const errors = {};

    if (!profileData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (!profileData.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (profileData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!profileData.confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm your new password.";
    } else if (profileData.confirmNewPassword !== profileData.newPassword) {
      errors.confirmNewPassword = "Passwords do not match.";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!validateProfileData()) return;

    const normalizedName = profileData.fullName.trim().replace(/\s+/g, " ");
    const nameParts = normalizedName.split(" ").filter(Boolean);
    if (nameParts.length < 2) {
      setProfileErrors((prev) => ({
        ...prev,
        fullName: "Please enter at least first name and last name.",
      }));
      return;
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    setProfileLoading(true);
    try {
      await api.put("/auth/reset-first-password", {
        firstName,
        lastName,
        newPassword: profileData.newPassword,
      });

      updateUser({
        fullName: normalizedName,
        mustChangePassword: false,
      });
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to complete profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // 4. Authorized! Render the page.
  // We use <Outlet /> because we are using this as a Layout Wrapper in App.js
  return (
    <>
      {children ? children : <Outlet />}
      {user.mustChangePassword && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600 mb-6">
              You must complete your profile before accessing the system.
            </p>

            {profileError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => {
                    setProfileData((prev) => ({ ...prev, fullName: e.target.value }));
                    setProfileErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                />
                {profileErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  New Password
                </label>
                <input
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => {
                    setProfileData((prev) => ({ ...prev, newPassword: e.target.value }));
                    setProfileErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                />
                {profileErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-[13px] font-semibold text-gray-700 tracking-[0.01em]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={profileData.confirmNewPassword}
                  onChange={(e) => {
                    setProfileData((prev) => ({ ...prev, confirmNewPassword: e.target.value }));
                    setProfileErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
                  }}
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-[10px] text-[15px] text-gray-900 bg-white outline-none transition-all focus:border-[#1864ab] focus:ring-2 focus:ring-[#1864ab]/10"
                />
                {profileErrors.confirmNewPassword && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.confirmNewPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full h-11 text-white border-none rounded-[10px] font-semibold cursor-pointer mt-2 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: profileLoading ? "#9ca3af" : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)" }}
              >
                {profileLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};