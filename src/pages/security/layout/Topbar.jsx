import React, { useState } from "react";
import { useLocation, useNavigate, NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, Bell, Plus, LayoutGrid, ShieldAlert, Package,
  ClipboardList, FileText, Shield, X, Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/pages/auth/AuthContext";
import logo from "@/assets/tracknity_logo.jpeg";
import smallLogo from "@/assets/logo_small.png";

const navigationLinks = [
  { label: "Dashboard", path: "/security/dashboard", icon: LayoutGrid },
  { label: "Devices", path: "/security/devices", icon: Package },
  // { label: "Active Checkouts", path: "/security/active-checkouts", icon: ClipboardList },
  { label: "Access Logs", path: "/security/logs", icon: ShieldAlert },
  { label: "Gate keeper", path: "/gate-verification", icon: Shield },
  { label: "Reports", path: "/security/reports", icon: FileText },
];

const getPageHeaders = () => {
  const hour = new Date().getHours();
  let timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return {
    "/security/dashboard": {
      title: `${timeGreeting}, Security Officer!`,
      description: "Monitor equipment access, security events, and system activity in real-time",

    },
    "/security/devices": {
      title: "Device Management",
      description: "Browse, add, edit, and manage all equipment in the system.",
      actionButton: { label: "Add Device", path: "/security/devices", icon: Plus },
      secondaryAction: { label: "Bulk Upload", icon: Upload },
    },
    "/security/device": {
      title: "Device Details",
      description: "View complete information about this device.",
    },
    // "/security/active-checkouts": {
    //   title: "Active Checkouts",
    //   description: "View and monitor all currently checked out equipment.",
    //   actionButton: { label: "New Checkout", path: "/security/active-checkouts", icon: Plus },
    // },
    "/security/logs": { title: "Access Logs", description: "View comprehensive logs of all activities.", actionButton: null },
    "/security/reports": { title: "Reports", description: "Generate and view detailed reports.", actionButton: null },
    "/security/settings": { title: "Settings", description: "Configure system settings.", actionButton: null },
    "/security/profile": { title: "Profile", description: "Manage your account details.", actionButton: null },
    "/security/notifications": { title: "Notifications", description: "View security alerts.", actionButton: null },
  };
};

const getPageHeader = (pathname, headers) => {
  if (headers[pathname]) {
    return headers[pathname];
  }

  if (pathname.startsWith("/security/device/")) {
    return headers["/security/device"];
  }
  if (pathname.startsWith("/security/device-movement/")) {
    return {
      title: "Device Movement",
      description: "Track device location and movement history.",
      backButton: { label: "Back to Devices", path: "/security/devices" },
    };
  }

  // Default fallback
  return headers["/security/dashboard"];
};

function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = 3;
  const currentPath = location.pathname;
  const pageHeaders = getPageHeaders();
  const pageHeader = getPageHeader(currentPath, pageHeaders);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const handleActionClick = () => {
    if (currentPath === "/security/devices") {
      window.dispatchEvent(new CustomEvent("openAddDeviceDialog"));
    } else if (pageHeader.actionButton) {
      navigate(pageHeader.actionButton.path);
    }
  };

  const handleBulkUploadClick = () => {
    window.dispatchEvent(new CustomEvent("openBulkUploadDialog"));
  };

  return (
    <header className="w-full bg-[#0A1128] rounded-b-[2rem] shadow-xl">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between h-14">

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <Link to="/security/dashboard" className="flex-shrink-0">
              <img src={smallLogo} alt="Logo" className="h-10 w-10 md:hidden rounded-full" />
              <img src={logo} alt="Tracknity" className="hidden md:block h-10 w-auto rounded" />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all ${isActive ? "bg-[#1A2240] text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/security/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0A1128]">
                  {unreadCount}
                </span>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="border-none p-0 sm:px-2 flex items-center gap-3 hover:bg-white/5">
                  <span className="hidden sm:block text-sm font-medium text-white">{user?.name || "Officer"}</span>
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarFallback className="bg-[#BEBEE0] text-[#1A2240] font-bold">
                      {user?.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2 bg-[#BEBEE0] border-none">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/security/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/security/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => navigate("/login")}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-1 pb-4 animate-in slide-in-from-top-2 z-50 duration-200">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "bg-[#1A2240] text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[#BEBEE0] text-xs font-semibold uppercase tracking-wider">{formattedDate}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {pageHeader.title}
            </h1>
            {pageHeader.description && (
              <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed">
                {pageHeader.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {pageHeader.backButton && (
              <Button
                onClick={() => navigate(pageHeader.backButton.path)}
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/30 hover:bg-white/10 text-white font-bold py-6 px-6 rounded-2xl transition-transform active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {pageHeader.backButton.label}
              </Button>
            )}

            {pageHeader.actionButton && (
              <Button
                onClick={handleActionClick}
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#0A1128] font-bold py-6 px-6 rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                <Plus className="h-5 w-5 mr-2" />
                {pageHeader.actionButton.label}
              </Button>
            )}

            {pageHeader.secondaryAction && (
              <Button
                onClick={handleBulkUploadClick}
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/30 hover:bg-white/10 text-white font-bold py-6 px-6 rounded-2xl transition-transform active:scale-95"
              >
                <Upload className="h-5 w-5 mr-2" />
                {pageHeader.secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;