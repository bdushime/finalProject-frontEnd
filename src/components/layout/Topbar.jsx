import PropTypes from "prop-types";
import {
  Bell,
  Menu,
  Settings,
  LayoutGrid,
  Package,
  ClipboardList,
  User,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { useLocation, Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { useAuth } from "@/pages/auth/AuthContext";
import logo from "@/assets/tracknity_logo.jpeg";
import smallLogo from "@/assets/logo_small.png";

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
  // { label: "Profile", path: "/it/profile", icon: User },
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

const pageTitles = {
  "/it/dashboard": "Dashboard",
  "/it/browse": "Devices",
  "/it/current-checkouts": "Borrowed Items",
  "/it/history": "Reports",
  "/it/notifications": "Notifications",
  // "/it/profile": "Profile",
  "/settings": "Settings",
};
const formattedDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date());

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const role = user?.role ?? "student";
  const links = getLinksForRole(role);
  const notificationPath =
    role === "it" ? "/it/notifications" : "/it/notifications";
  const profilePath = role === "it" ? "/it/profile" : "/it/profile";

  const isLinkActive = (path) => {
    if (location.pathname === path) return true;
    if (path === "/student/dashboard" || path === "/it/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="">
    <div
      className={`w-full mt-2 px-1 flex items-center gap-2 justify-between transition-all duration-300 ${
        isScrolled ? " rounded-b-lg" : "bg-transparent"
      }`}
    >
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden border-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
      <div
        className={`${
          isMobileMenuOpen
            ? "flex flex-col justify-center items-center absolute top-full left-0 right-0 rounded-b-lg bg-yellow-50 shadow-lg p-4 gap-3 z-50 w-2/3"
            : "hidden"
        } sm:flex sm:flex-row sm:relative sm:shadow-none sm:p-0 items-center gap-1`}
      >
        <header
          className={`${
            !isMobileMenuOpen
              ? " rounded-full border border-gray-300 shadow-sm w-full sm:w-auto"
              : "empty:hidden"
          }`}
        >
          <div
            className={`${
              !isMobileMenuOpen
                ? "flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-1"
                : "empty:hidden justify-center items-center"
            }`}
          >
            <nav className="flex flex-col sm:flex-row items-stretch sm:items-center justify-betweeen gap-1 sm:gap-0">
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
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")
                    }
                  >
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </header>
        <Link to="/settings" className="w-full sm:w-auto">
          <Button
            variant="outline"
            aria-label="Settings"
            className={`border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto ${
              isMobileMenuOpen ? "justify-center border-none shadow-none" : ""
            }`}
          >
            {isMobileMenuOpen ? (
              <span className="text-sm font-medium transition-colors">
                Settings
              </span>
            ) : (
              <>
                <Settings className="h-4 w-4" />{" "}
                <span className="text-sm font-medium ">Settings</span>
              </>
            )}
          </Button>
        </Link>

        {!isMobileMenuOpen && (
          <Link to={notificationPath} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              aria-label="Settings"
              className={`border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto ${
                isMobileMenuOpen ? "justify-center border-none shadow-none" : ""
              }`}
            >
              {isMobileMenuOpen ? (
                <span className="text-sm font-medium">Notifications</span>
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`border-gray-300 text-sm font-medium transition-colors shadow-sm rounded-full px-6 py-5 w-full sm:w-auto ${
                isMobileMenuOpen ? "justify-center border-none shadow-none" : ""
              }`}
            >
              {isMobileMenuOpen ? (
                <span className="text-sm font-medium transition-colors ">
                  My Account
                </span>
              ) : (
                <Avatar>
                  <AvatarFallback className="text-md font-bold">
                    JS
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="border-none bg-[#BEBEE0] rounded-lg"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={profilePath}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* <div className="flex flex-col mt-24 sm:flex-row sm:items-center sm:justify-between gap-4"> */}

      {/* Mobile Action Button */}

      {/* </div> */}
    </div>
      <div className="flex flex-col justify-center p-4 mt-4 sticky top-0 z-30">
        <p className="text-gray-900 text-2xl font-bold">Welcome dear User</p>
        <p className="text-gray-500 text-sm sm:text-base">{formattedDate}</p>
        {/* {pageHeader.subtitle && (
              <p className="text-gray-400 text-sm mt-1 hidden sm:block">
                {pageHeader.subtitle}
              </p>
            )} */}
      </div>
      </div>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
