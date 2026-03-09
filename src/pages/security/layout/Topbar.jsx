import React, { useState, useEffect } from "react";
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
// import logo from "@/assets/no-bg_logo.png";
import smallLogo from "@/assets/no-bg_logo.png";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import api from "@/utils/api";

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
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const { t } = useTranslation("common");
  const { t: tSec } = useTranslation("security");

  const unreadCount = 3;
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchBorrowed = async () => {
      try {
        const res = await api.get('/transactions/active');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const checkedOutCount = list.filter(tx => tx.status === 'Checked Out' || tx.status === 'Overdue').length;
        setTotalBorrowed(checkedOutCount);
      } catch (err) {
        console.error('Failed to fetch total borrowed items:', err);
      }
    };
    fetchBorrowed();
  }, [currentPath]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const displayName = user?.fullName || user?.name || user?.username || t("roles.security");
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayRole = user?.role || t("roles.security");

  return (
    <header className="w-full relative z-20">
      <div className="mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between h-12 sm:h-14">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            <Link
              to="/security/dashboard"
              className="flex items-center gap-2 backdrop-blur-md px-2 sm:px-4 py-1.5 hover:bg-white/50 transition-all group"
            >
              <img
                src={smallLogo}
                alt="Tracknity"
                className="w-9 h-9 sm:w-12 sm:h-12 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-lg lg:text-xl font-bold text-[#ccd5e5] font-serif tracking-tight hidden md:block">
                {t("misc.tracknity")}
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links — only visible on lg+ */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-800/50 p-1 rounded-full backdrop-blur-sm border border-slate-700/50 mx-2 flex-shrink min-w-0">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  title={link.label}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${active || isActive
                      ? "bg-white/15 text-white border border-white/10 shadow-sm"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Borrowed Pill, Language Switcher, Notifications, User */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">

            {/* Total Borrowed Pill — visible md+ */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-sky-900/40 border border-sky-700/50 rounded-full text-sky-100">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Borrowed: <span className="text-white ml-0.5 sm:ml-1">{totalBorrowed}</span>
              </span>
            </div>

            <LanguageSwitcher variant="dark" />

            <Link
              to="/security/notifications"
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label={t("nav.notifications")}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1.5 sm:right-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-[#8D8DC7] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 sm:h-11 pl-1 sm:pl-1.5 pr-2 lg:pr-5 rounded-full bg-slate-800/20 backdrop-blur-md border border-white/30 flex items-center gap-2 sm:gap-3 hover:bg-white/30 transition-all hover:shadow-sm group hover:scale-[1.02]">
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200 flex-shrink-0">
                    <span className="text-black font-bold text-xs sm:text-sm">
                      {displayInitial}
                    </span>
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-sm font-bold text-white group-hover:text-[#BEBEE0] transition-colors truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#BEBEE0]/80">
                      {displayRole}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-xl bg-white/90 backdrop-blur-lg">
                <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-xl mb-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[#0b1d3a]">{displayName}</p>
                    <p className="text-xs text-[#126dd5] font-medium uppercase tracking-wider">
                      {displayRole}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg focus:bg-slate-50 focus:text-[#126dd5] cursor-pointer p-3 transition-colors"
                >
                  <Link to="/security/profile" className="flex items-center gap-2 font-medium">
                    {t("auth.myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem
                  asChild
                  className="rounded-lg focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer p-3 transition-colors"
                >
                  <Link to="/login" onClick={handleLogout} className="flex items-center gap-2 font-medium">
                    {t("auth.logOut")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu — visible below lg */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-white/20 pt-3 sm:pt-4">
            {/* Borrowed pill inside mobile menu for small screens */}
            <div className="flex md:hidden items-center gap-2 px-4 py-2.5 mb-2 bg-sky-900/40 border border-sky-700/50 rounded-xl text-sky-100">
              <Package className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Borrowed: <span className="text-white ml-1">{totalBorrowed}</span>
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active || isActive
                        ? "bg-white/15 text-white border border-white/10"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
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