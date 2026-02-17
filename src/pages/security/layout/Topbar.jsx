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
import PropTypes from "prop-types";
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
        actionButton: { label: tSec("devices.addDevice") || "Add Device", path: "/security/devices", icon: Plus },
        secondaryAction: { label: "Bulk Upload", icon: Upload },
      },
      "/security/active-checkouts": {
        title: tSec("dashboard.activeCheckouts"),
        description: null,
        actionButton: null,
      },
      "/security/logs": {
        title: tSec("accessLogs.title"),
        description: null,
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
        title: t("nav.profile"),
        description: null,
        actionButton: null,
      },
      "/security/notifications": {
        title: tSec("notifications.title"),
        description: null,
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
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${active || isActive
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


          {/* Right: Language Switcher, Notifications, User */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="dark" />

            <Link
              to="/security/notifications"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t("nav.notifications")}
            >
              <Bell className="h-5 w-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0A1128]">
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
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || t("roles.security")}
                  </span>
                  <Avatar className="h-8 w-8 border-2 border-white/20">
                    <AvatarFallback className="bg-[#BEBEE0] text-[#1A2240] text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
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

      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[#BEBEE0] text-xs font-semibold uppercase tracking-wider">{formattedDate}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {pageHeader.title}
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mb-2">
              {formattedDate}
            </p>
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