import React, { useState } from "react";
import { useLocation, useNavigate, NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, Bell, Plus, LayoutGrid, ShieldAlert, Package,
  ClipboardList, FileText, Shield, X, Upload, LogOut
} from "lucide-react";
import PropTypes from "prop-types";
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
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

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
  const { t } = useTranslation("common");
  const { t: tSec } = useTranslation("security");

  const unreadCount = 3;
  const currentPath = location.pathname;

  const navigationLinks = [
    { label: t("nav.dashboard"), path: "/security/dashboard", icon: LayoutGrid },
    { label: t("nav.devices"), path: "/security/devices", icon: Package },
    { label: t("nav.checkouts"), path: "/security/active-checkouts", icon: ClipboardList },
    { label: t("nav.accessLogs"), path: "/security/logs", icon: ShieldAlert },
    { label: t("nav.reports"), path: "/security/reports", icon: FileText },
  ];

  // Page-specific headers
  const getPageHeaders = () => {
    const hour = new Date().getHours();
    let timeGreeting = tSec("dashboard.title");
    if (hour < 12) {
      timeGreeting = `${t("nav.dashboard")}`;
    }

    return {
      "/security/dashboard": {
        title: tSec("dashboard.title"),
        description: null,
        actionButton: null,
      },
      "/security/devices": {
        title: tSec("devices.title"),
        description: null,
        actionButton: { label: tSec("devices.addDevice"), path: "/security/devices", icon: Plus },
        secondaryAction: { label: tSec("browseDevices.bulkUpload"), icon: Upload },
      },
      "/security/active-checkouts": {
        title: tSec("dashboard.stats.activeCheckouts"),
        description: null,
        actionButton: null,
      },
      "/security/logs": {
        title: tSec("accessLogs.title"),
        description: tSec("accessLogs.subtitle"),
        actionButton: null,
      },
      "/security/reports": {
        title: tSec("reports.title"),
        description: null,
        actionButton: null,
      },
      "/security/settings": {
        title: t("nav.config"),
        description: null,
        actionButton: null,
      },
      "/security/profile": {
        title: tSec("profile.title"),
        description: null,
        actionButton: null,
      },
      "/security/notifications": {
        title: tSec("notifications.title"),
        description: tSec("notifications.subtitle"),
        actionButton: null,
      },
    };
  };

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

  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full relative z-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-700/50">
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
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full backdrop-blur-sm border border-slate-700/50">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${active || isActive
                      ? "bg-white/15 text-white border border-white/10 shadow-sm"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>



          {/* Right: Language Switcher, Notifications, User */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="dark" />

            <Link
              to="/security/notifications"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t("nav.notifications")}
            >
              <Bell className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-[#8D8DC7] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <span className="hidden sm:block text-sm font-medium text-gray-300">
                    {user?.fullName || user?.name || user?.username || t("roles.security")}
                  </span>
                  <Avatar className="h-8 w-8 border-2 border-white/20">
                    <AvatarFallback className="bg-[#BEBEE0] text-[#1A2240] text-sm font-semibold">
                      {(user?.fullName || user?.name || user?.username || "S").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("auth.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/security/profile">{t("auth.myProfile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/login">{t("auth.logOut")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

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
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active || isActive
                        ? "bg-white/15 text-white border border-white/10"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
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
    </header>
  );
}

export default Topbar;