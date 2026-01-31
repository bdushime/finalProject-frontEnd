import PropTypes from "prop-types";
import { Navigate, useLocation, Outlet } from "react-router-dom"; // 👈 1. Import Outlet

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Normalize roles to ensure "Student" matches "student"
  const userRole = user.role; 
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    let fallback = "/login";
    
    // Simple fallback logic
    switch(userRole) {
        case "Student": fallback = "/student/dashboard"; break;
        case "IT":
        case "IT_Staff": fallback = "/it/dashboard"; break;
        case "Security": fallback = "/security/dashboard"; break;
        case "Admin": fallback = "/admin/dashboard"; break;
        default: fallback = "/login";
    }
    
    // Prevent infinite redirect loops if we are already at the fallback
    if (location.pathname.startsWith(fallback)) {
       return <Navigate to="/login" replace />; 
    }

    return <Navigate to={fallback} replace />;
  }

  // 👇 2. THE FIX: Return children OR the Outlet
  // If used as a wrapper <Route element={...}>, 'children' is null, so we render <Outlet/>
  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};