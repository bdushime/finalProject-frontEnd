import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Plus, LayoutGrid, ShieldAlert, Package, ClipboardList, FileText } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
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
import PropTypes from "prop-types";

const navigationLinks = [
  { label: "Dashboard", path: "/security/dashboard", icon: LayoutGrid },
  { label: "Devices", path: "/security/devices", icon: Package },
  { label: "Active Checkouts", path: "/security/active-checkouts", icon: ClipboardList },
  { label: "Access Logs", path: "/security/logs", icon: ShieldAlert },
  { label: "Reports", path: "/security/reports", icon: FileText },
];

// Page-specific headers with titles and descriptions
const getPageHeaders = () => {
  const hour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (hour >= 12 && hour < 18) {
    timeGreeting = "Good afternoon";
  } else if (hour >= 18) {
    timeGreeting = "Good evening";
  }

  return {
    "/security/dashboard": {
      title: `${timeGreeting}, Security Officer!`,
      description: "Monitor equipment access, security events, and system activity in real-time",
      actionButton: { label: "New Log Entry", path: "/security/logs", icon: Plus },
    },
    "/security/devices": {
      title: "Device Management",
      description: "Browse, add, edit, and manage all equipment in the system. Track device status, location, and availability",
      actionButton: { label: "Add Device", path: "/security/devices", icon: Plus },
    },
    "/security/active-checkouts": {
      title: "Active Checkouts",
      description: "View and monitor all currently checked out equipment. Track due dates, borrowers, and checkout status",
      actionButton: { label: "New Checkout", path: "/security/active-checkouts", icon: Plus },
    },
    "/security/logs": {
      title: "Access Logs",
      description: "View comprehensive logs of all equipment access activities, security events, and system operations",
      actionButton: { label: "New Log Entry", path: "/security/logs", icon: Plus },
    },
    "/security/reports": {
      title: "Reports",
      description: "Generate and view detailed reports on equipment inventory, damaged items, lost equipment, and utilization statistics",
      actionButton: null,
    },
    "/security/settings": {
      title: "Settings",
      description: "Configure system settings, security preferences, and user account options",
      actionButton: null,
    },
    "/security/profile": {
      title: "Profile",
      description: "Manage your security officer profile, update personal information, and view account details",
      actionButton: null,
    },
    "/security/notifications": {
      title: "Notifications",
      description: "View and manage all security alerts, system notifications, and important updates",
      actionButton: null,
    },
  };
};

function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const unreadCount = 3;
  const currentPath = location.pathname;
  const pageHeaders = getPageHeaders();
  const pageHeader = pageHeaders[currentPath] || pageHeaders["/security/dashboard"];

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const isLinkActive = (path) => {
    if (currentPath === path) return true;
    return currentPath.startsWith(path);
  };

  const handleActionClick = () => {
    if (currentPath === "/security/devices") {
      // For devices page, we'll trigger the add dialog via a custom event
      window.dispatchEvent(new CustomEvent("openAddDeviceDialog"));
    } else {
      navigate(pageHeader.actionButton.path);
    }
  };

  return (
    <div className="w-full bg-[#0A1128] rounded-b-3xl">
      {/* Top Navigation Bar */}
      <div className="w-full text-white px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link to="/security/dashboard" className="flex items-center gap-2">
              <img
                src={smallLogo}
                alt="Tracknity"
                className="block md:hidden w-10 h-10 rounded-full"
              />
              <img
                src={logo}
                alt="Tracknity"
                className="hidden md:block h-10 w-auto rounded"
              />
            </Link>
            </div>
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        active || isActive
                          ? "bg-[#1A2240] text-white rounded-full"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          

          {/* Right: Notifications, User */}
          <div className="flex items-center gap-4">
            <Link
              to="/security/notifications"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || "Security Officer"}
                  </span>
                  <Avatar className="h-8 w-8 border-2 border-white/20">
                    <AvatarFallback className="bg-[#BEBEE0] text-[#1A2240] text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/security/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/security/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/login">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <nav className="flex flex-col gap-2">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active || isActive
                          ? "bg-[#1A2240] text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Dynamic Page Header */}
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-100">
              {pageHeader.title}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mb-2">
              {formattedDate}
            </p>
            {pageHeader.description && (
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
                {pageHeader.description}
              </p>
            )}
          </div>
          
          {/* Action Button */}
          {pageHeader.actionButton && (
            <Button
              onClick={handleActionClick}
              className="bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {pageHeader.actionButton.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func,
};

export default Topbar;
