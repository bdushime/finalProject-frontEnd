import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Bell,
  User,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Radio,
  LogOut,
} from "lucide-react";
import logo from "@/assets/images/logo_white.svg";
import { useAuth } from "@/pages/auth/AuthContext";

const baseStudentLinks = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutGrid },
  { label: "Equipment", path: "/student/browse", icon: Package },
  {
    label: "Borrowed Items",
    path: "/student/borrowed-items",
    icon: ClipboardList,
  },
  { label: "Notifications", path: "/student/notifications", icon: Bell },
  { label: "Profile", path: "/student/profile", icon: User },
  { label: "Help & Support", path: "/student/help", icon: HelpCircle },
];

const baseItLinks = [
  { label: "Dashboard", path: "/it/dashboard", icon: LayoutGrid },
  { label: "Browse Equipment", path: "/it/browse", icon: Package },
  {
    label: "Current Checkouts",
    path: "/it/current-checkouts",
    icon: ClipboardList,
  },
  {
    label: "IoT Live View",
    path: "/it/iot-tracker",
    icon: Radio,
  },
  { label: "Notifications", path: "/it/notifications", icon: Bell },
  { label: "Profile", path: "/it/profile", icon: User },
];

const baseAdminLinks = [
  { label: "Admin Dashboard", path: "/admin/dashboard", icon: LayoutGrid },
  { label: "User Management", path: "/admin/users", icon: ShieldCheck },
];

const baseSecurityLinks = [
  {
    label: "Security Dashboard",
    path: "/security/dashboard",
    icon: LayoutGrid,
  },
  { label: "Access Logs", path: "/security/logs", icon: ShieldAlert },
];

function getLinksForRole(role) {
  switch (role) {
    case "it":
      return baseItLinks;
    case "admin":
      return baseAdminLinks;
    case "security":
      return baseSecurityLinks;
    case "student":
    default:
      return baseStudentLinks;
  }
}

const DESKTOP_BREAKPOINT = 640; // keep in sync with DashboardLayout
const SIDEBAR_WIDTH_MINI = 64;
const SIDEBAR_WIDTH_OPEN = 240;

const sidebarVariants = {
  closed: { x: -260, opacity: 0 },
  mini: { x: 0, width: SIDEBAR_WIDTH_MINI, opacity: 1 }, // slim icon-only rail
  open: { x: 0, width: SIDEBAR_WIDTH_OPEN, opacity: 1 },
};

export default function Sidebar({ isOpen, onWidthChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const role = user?.role ?? "student";
  const links = getLinksForRole(role);

  const isDesktop =
    typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;
  const isMobile = !isDesktop;


  const showSidebar = isOpen || isDesktop;
  const effectiveExpanded = isDesktop ? !isCollapsed || isHovered : true;
  // console.log("effectiveExpanded", effectiveExpanded);

  const currentVariant = !showSidebar
    ? "closed"
    : isMobile
    ? "open"
    : effectiveExpanded
    ? "open"
    : "mini";


  useEffect(() => {
    if (!onWidthChange) return;

    if (!showSidebar) {
      onWidthChange(0);
    } else if (effectiveExpanded) {
      onWidthChange(SIDEBAR_WIDTH_OPEN);
    } else {
      onWidthChange(SIDEBAR_WIDTH_MINI);
    }
  }, [showSidebar, effectiveExpanded, onWidthChange]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    if (path === "/student/dashboard" || path === "/it/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AnimatePresence initial={false}>
      {showSidebar && (
        <motion.aside
          key="sidebar"
          initial="closed"
          animate={currentVariant}
          exit="closed"
          variants={sidebarVariants}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 26,
            mass: 0.9,
          }}
          onMouseEnter={() => isCollapsed && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed left-0 top-0 z-40 h-screen bg-[#1A2240] dark:bg-[#1E2546] text-white flex flex-col shadow-lg"
          aria-label="Sidebar navigation"
        >
          {/* Header / Logo */}
          <motion.div
            layout
            className="flex justify-center items-center gap-3 px-4 py-4 border-b border-white/10"
            style={{ overflow: "visible" }}
          >
            <img
              src={logo}
              alt="Tracknity"
              className={`w-full h-full transition-all duration-300 ${
                effectiveExpanded ? "w-18 h-18" : "w-16 h-16"
              }`}
            />
          </motion.div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={() =>
                    [
                      "relative flex items-center rounded-lg text-sm font-medium transition-colors",
                      effectiveExpanded
                        ? "px-3 py-2"
                        : "px-2 py-2 justify-center",
                      active
                        ? "bg-white/12 text-white shadow-sm"
                        : "text-white/70 hover:bg-white/8 hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {effectiveExpanded && (
                    <span className="ml-3 truncate">{link.label}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 px-2 py-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className={[
                "flex items-center rounded-lg text-xs font-medium text-red-200 hover:text-white hover:bg-red-600/70 transition-colors",
                effectiveExpanded
                  ? "px-3 py-2"
                  : "px-2 py-2 justify-center mb-1",
              ].join(" ")}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {effectiveExpanded && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
