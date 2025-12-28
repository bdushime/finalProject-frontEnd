import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import smallLogo from "@/assets/logo_small.png";
import logo from "@/assets/tracknity_logo.jpeg";
import { Settings, Bell, Calendar, Plus } from "lucide-react";
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

function Topbar({ onMenuClick }) {
  const links = [
    { label: "Security Dashboard", path: "/security/dashboard" },
    { label: "Devices", path: "/security/devices" },
    { label: "Active Checkouts", path: "/security/active-checkouts" },
    // { label: "Settings", path: "/security/settings" },
    // { label: "Notifications", path: "/security/notifications" },
    // { label: "Profile", path: "/security/profile" },
    { label: "Access Logs", path: "/security/logs" },
  ];

  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path);
  };
  const unreadCount = 3;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="w-full h-full gap-2 sticky top-0 z-30 transition-all duration-300 bg-[#0A1128] opacity-100 shadow-sm rounded-b-xl p-2">
      <div className="w-full flex gap-2 justify-between sticky top-0 z-30 transition-all duration-300 ">
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden border-none"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <img
          src={smallLogo}
          alt="Tracknity"
          className="block md:hidden w-12 rounded-full"
        />
        <img
          src={logo}
          alt="Tracknity"
          className="hidden md:block rounded-full w-32 h-14"
        />
        <div className="flex items-center gap-2 px-4">
          <nav className="flex rounded-full flex-col sm:flex-row items-center sm:items-center justify-betweeen gap-1 sm:gap-0 ">
            {links.map((link) => {
              const active = isLinkActive(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    [
                      " flex w-full justify-center items-center text-sm font-medium transition-colors px-3 py-2",
                      active || isActive
                        ? "bg-[#1A2240] text-gray-100 shadow-sm rounded-full"
                        : "text-slate-600 hover:bg-[#343264] hover:text-gray-100 rounded-full",
                    ].join(" ")
                  }
                >
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/security/settings"
            className="p-2 gap-1 rounded-full  flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          <Link
            to="/security/notifications"
            className="relative h-10 w-10 rounded-full  flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/security/profile"
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="h-8 w-8 rounded-full bg-[#0b69d4] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-[#0b1d3a]">Promise</p>
              <p className="text-[11px] text-gray-500">Security</p>
            </div>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-16 my-5 px-4">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, Security officer
        </h1>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {" "}
            <Calendar className="h-4 w-4" />{" "}
            <span className="text-gray-500"> {formattedDate}</span>
          </p>
          <Link to="/security/add-device">
            <button
              // onClick={() => console.log("Add Device")}
              className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity border border-gray-400 bg-[#BEBEE0] text-gray-700 rounded-2xl py-2 px-4 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Device</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
