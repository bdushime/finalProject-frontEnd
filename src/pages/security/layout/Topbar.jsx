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
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

function Topbar({ onMenuClick }) {
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
        actionButton: null,
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
      window.dispatchEvent(new CustomEvent("openAddDeviceDialog"));
    } else if (pageHeader.actionButton) {
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
