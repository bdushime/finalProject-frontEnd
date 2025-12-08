import PropTypes from "prop-types";
import { Bell, Menu, Search } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@components/ui/avatar";

const pageTitles = {
    "/student/dashboard": "Dashboard",
    "/student/browse": "Equipment Catalogue",
    "/student/equipment": "Equipment Details",
    "/student/borrow-request": "Request Equipment",
    "/student/borrowed-items": "My Borrowed Items",
    "/student/notifications": "Notifications",
    "/student/profile": "Profile",
    "/student/help": "Help & Support",
    "/settings": "Settings",
};

const pagesWithSearch = ["/student/dashboard", "/student/borrowed-items", "/student/notifications", "/student/profile", "/student/help"];

export default function Topbar({ onMenuClick }) {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || "Dashboard";
    const showSearch = pagesWithSearch.some(path => location.pathname.startsWith(path));

    return (
        <header className="h-16 sticky top-0 z-30 bg-card border-b border-gray-300 dark:border-gray-700 backdrop-blur-sm w-full">
            <div className="h-full flex items-center justify-between px-4 sm:px-6 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Button variant="outline" size="icon" className="sm:hidden flex-shrink-0" onClick={onMenuClick} aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {showSearch && (
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-9 w-64 bg-background" />
                        </div>
                    )}
                    <Link to="/student/notifications">
                        <Button variant="outline" size="icon" aria-label="Notifications">
                            <Bell className="h-4 w-4" />
                        </Button>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="px-2 py-4 border border-gray-400 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/student/profile">Profile</Link>
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


