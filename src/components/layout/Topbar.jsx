import PropTypes from "prop-types";
import { Bell, Menu, Search } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
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

const pageTitles = {
  "/it/dashboard": "Dashboard",
  "/it/browse": "Devices",
  "/it/current-checkouts": "Borrowed Items",
  "/it/history": "Reports",
  "/it/notifications": "Notifications",
  "/it/profile": "Profile",
  "/settings": "Settings",
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  const role = user?.role || "it";
  const notificationPath =
    role === "it" ? "/it/notifications" : "/it/notifications";
  const profilePath =
    role === "it" ? "/it/profile" : "/it/profile";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // scrolled more than 10px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-30 w-full border-b transition-all duration-300 bg-[#BEBEE0] shadow-sm border-gray-100
        
      `}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-xl font-bold text-slate-700">{pageTitle}</h1>

          <div className="relative hidden sm:block ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 w-72 border-gray-300 shadow-sm bg-background rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={notificationPath}>
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifications"
              className="relative border-gray-300 shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-12 h-12 border border-gray-300 shadow-sm rounded-full flex items-center justify-center"
              >
                <Avatar>
                  <AvatarFallback className="text-md font-bold">JS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="border-none bg-[#BEBEE0] rounded-lg">
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
      </div>
    </header>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
