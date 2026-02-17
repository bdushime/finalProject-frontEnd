import PropTypes from "prop-types";
import { Navigate, useLocation, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  // 1. Get User Data
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();

  // 2. Not Logged In? -> Go to Login
  if (!user) {
    // We save 'location' in state so we can redirect them back after login (optional feature)
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Role Check
  const userRole = user.role;

  // If roles are defined for this route AND the user doesn't have the right role:
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    // Determine where they SHOULD go based on their role
    let fallback = "/login";
    
    switch (userRole) {
      case "Student":
        fallback = "/student/dashboard";
        break;
      case "IT":
      case "IT_Staff":
        fallback = "/it/dashboard";
        break;
      case "Security":
        fallback = "/security/dashboard";
        break;
      case "Admin":
        fallback = "/admin/dashboard";
        break;
      default:
        fallback = "/login";
    }

    // If they are ALREADY on their fallback page (e.g. infinite loop protection), just show it
    if (location.pathname.startsWith(fallback)) {
        return children ? children : <Outlet />;
    }
    
    // Otherwise, redirect them to their correct dashboard
    return <Navigate to={fallback} replace />;
  }

  // 4. Authorized! Render the page.
  // We use <Outlet /> because we are using this as a Layout Wrapper in App.js
  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};