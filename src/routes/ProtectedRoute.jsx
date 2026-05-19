import PropTypes from "prop-types";
import { useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import api from "@/utils/api";
import { useAuth } from "@/pages/auth/AuthContext";

// ─── password helpers ────────────────────────────────────────────────────────

const getPasswordScore = (p) => {
  if (p.length < 8) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const STRENGTH_CONFIG = [
  { label: "Too short", color: "#9ca3af" },
  { label: "Weak",      color: "#e24b4a" },
  { label: "Fair",      color: "#ef9f27" },
  { label: "Good",      color: "#1d9e75" },
  { label: "Strong",    color: "#1864ab" },
];

const BAR_ACTIVE_COLORS = ["", "#e24b4a", "#ef9f27", "#1d9e75", "#1864ab"];

// ─── small ui pieces ─────────────────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function StrengthMeter({ password }) {
  if (!password) return null;
  const score = getPasswordScore(password);
  const { label, color } = STRENGTH_CONFIG[score];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= score ? BAR_ACTIVE_COLORS[score] : "#e5e7eb",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>Strength</span>
      </div>
    </div>
  );
}

function MatchIndicator({ password, confirm }) {
  if (!confirm) return null;
  const ok = password === confirm;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {ok ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
      <span style={{ fontSize: 12, fontWeight: 500, color: ok ? "#1d9e75" : "#e24b4a" }}>
        {ok ? "Passwords match" : "Passwords don't match"}
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, updateUser } = useAuth();
  const location = useLocation();

  // existing modal state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState("");
  const [profileData,    setProfileData]     = useState({
    fullName:         user?.fullName || user?.username || "",
    newPassword:      "",
    confirmNewPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // new: show/hide toggles
  const [showNewPwd,     setShowNewPwd]     = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── helpers ───────────────────────────────────────────────────────────────

  const normalizeRole = (role) => {
    const value = (role || "").toString().trim().toLowerCase().replace(/[\s-]/g, "_");
    switch (value) {
      case "student":
        return "Student";
      case "admin":
        return "Admin";
      case "security":
        return "Security";
      case "gate_keeper":
        return "Gate_Keeper";
      case "IT":
      case "IT_Staff":
        return "IT_Staff";
      default:
        return role;
    }
  };

  const getRoleDashboardPath = (role) => {
    switch (normalizeRole(role)) {
      case "Student":   return "/student/dashboard";
      case "IT":  return "/it/dashboard";
      case "IT_Staff":  return "/it/dashboard";
      case "Security":  return "/security/dashboard";
      case "Gate_Keeper": return "/gate-verification";
      case "Admin":     return "/admin/dashboard";
      default:          console.log("No role found"); return "/login";
    }
  };

  // ── guards ────────────────────────────────────────────────────────────────

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = normalizeRole(user.role);
  const fallback = getRoleDashboardPath(userRole);
  const normalizedAllowedRoles = (allowedRoles || []).map(normalizeRole);

  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    if (location.pathname.startsWith(fallback)) {
      return children ? children : <Outlet />;
    }
    return <Navigate to={fallback} replace />;
  }

  if (userRole === "Student" && user.mustChangePassword && location.pathname !== fallback) {
    return <Navigate to={fallback} replace />;
  }

  // ── form logic (unchanged) ────────────────────────────────────────────────

  const validateProfileData = () => {
    const errors = {};
    if (!profileData.fullName.trim())
      errors.fullName = "Full name is required.";
    if (!profileData.newPassword)
      errors.newPassword = "New password is required.";
    else if (profileData.newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters.";
    if (!profileData.confirmNewPassword)
      errors.confirmNewPassword = "Please confirm your new password.";
    else if (profileData.confirmNewPassword !== profileData.newPassword)
      errors.confirmNewPassword = "Passwords do not match.";
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
    const lastName  = nameParts.slice(1).join(" ");

    setProfileLoading(true);
    try {
      await api.put("/auth/reset-first-password", {
        firstName,
        lastName,
        newPassword: profileData.newPassword,
      });
      updateUser({ fullName: normalizedName, mustChangePassword: false });
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to complete profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {children ? children : <Outlet />}

      {userRole === "Student" && user.mustChangePassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-6 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-[min(100%,28rem)] sm:max-w-lg bg-white rounded-[20px] shadow-2xl p-6 sm:p-8 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 text-navy-blue text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ background: "#e8f0fe" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              First-time setup
            </div>

            {/* Heading */}
            <h2 id="modal-title" className="text-[22px] font-bold text-gray-900 mb-1">
              Complete your profile
            </h2>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              Before accessing the system, set your full name and a secure password.
            </p>

            {/* Server error */}
            {profileError && (
              <div className="mb-4 flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">
                  Full name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.fullName}
                    placeholder="e.g. Alice Uwase"
                    onChange={(e) => {
                      setProfileData((prev) => ({ ...prev, fullName: e.target.value }));
                      setProfileErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    className="w-full h-11 pl-4 pr-11 border-[1.5px] border-gray-200 rounded-[10px] text-[14px] text-gray-900 bg-gray-50 outline-none transition-all focus:border-[#1864ab] focus:bg-white"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                {profileErrors.fullName && (
                  <p className="mt-1 text-[12px] text-red-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {profileErrors.fullName}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={profileData.newPassword}
                    placeholder="Min. 8 characters"
                    onChange={(e) => {
                      setProfileData((prev) => ({ ...prev, newPassword: e.target.value }));
                      setProfileErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    className="w-full h-11 pl-4 pr-11 border-[1.5px] border-gray-200 rounded-[10px] text-[14px] text-gray-900 bg-gray-50 outline-none transition-all focus:border-[#1864ab] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd((v) => !v)}
                    aria-label={showNewPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon open={showNewPwd} />
                  </button>
                </div>
                <StrengthMeter password={profileData.newPassword} />
                {profileErrors.newPassword && (
                  <p className="mt-1 text-[12px] text-red-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {profileErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={profileData.confirmNewPassword}
                    placeholder="Re-enter your password"
                    onChange={(e) => {
                      setProfileData((prev) => ({ ...prev, confirmNewPassword: e.target.value }));
                      setProfileErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
                    }}
                    className="w-full h-11 pl-4 pr-11 border-[1.5px] border-gray-200 rounded-[10px] text-[14px] text-gray-900 bg-gray-50 outline-none transition-all focus:border-[#1864ab] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon open={showConfirmPwd} />
                  </button>
                </div>
                <MatchIndicator
                  password={profileData.newPassword}
                  confirm={profileData.confirmNewPassword}
                />
                {profileErrors.confirmNewPassword && (
                  <p className="mt-1 text-[12px] text-red-600 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {profileErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full h-11 text-white border-none rounded-[10px] text-[14px] font-semibold cursor-pointer mt-2 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: profileLoading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #1864ab 0%, #6366f1 100%)",
                }}
              >
                {profileLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & continue"
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
  children:     PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};