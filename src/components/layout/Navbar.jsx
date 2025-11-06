import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { Home, PackageSearch, ClipboardList, Clock, Bell, LayoutDashboard, Users, Package, FileText, MonitorSmartphone, Wrench, ClipboardCheck, ShieldCheck, QrCode, Menu } from "lucide-react";

const UserRole = {
    REGULAR_USER: "REGULAR_USER",
    ADMIN: "ADMIN",
    IT_STAFF: "IT_STAFF",
    SECURITY: "SECURITY",
};

const navLinks = {
    student: [
        { name: "Dashboard", path: "/student/dashboard", icon: Home },
        { name: "Browse Equipment", path: "/student/browse", icon: PackageSearch },
        { name: "My Checkouts", path: "/student/current-checkouts", icon: ClipboardList },
        { name: "History", path: "/student/history", icon: Clock },
        { name: "Notifications", path: "/student/notifications", icon: Bell },
    ],
    admin: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Equipment", path: "/admin/equipment", icon: Package },
        { name: "Reports", path: "/admin/reports", icon: FileText },
    ],
    itStaff: [
        { name: "Dashboard", path: "/it-staff/dashboard", icon: MonitorSmartphone },
        { name: "Maintenance", path: "/it-staff/maintenance", icon: Wrench },
        { name: "Requests", path: "/it-staff/requests", icon: ClipboardCheck },
    ],
    security: [
        { name: "Dashboard", path: "/security/dashboard", icon: ShieldCheck },
        { name: "Verify Returns", path: "/security/returns", icon: QrCode },
    ],
};

function LinkItem({ to, name, icon: Icon }) {
    return (
        <NavLink to={to} className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "text-blue-600 bg-blue-50 dark:bg-neutral-900" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"}`}>
            <Icon className="h-4 w-4" />
            <span>{name}</span>
        </NavLink>
    );
}

LinkItem.propTypes = {
    to: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
};

export default function Navbar({ role = UserRole.REGULAR_USER, userInitials = "US" }) {
    const [open, setOpen] = useState(false);
    const links = useMemo(() => {
        switch (role) {
            case UserRole.ADMIN:
                return navLinks.admin;
            case UserRole.IT_STAFF:
                return navLinks.itStaff;
            case UserRole.SECURITY:
                return navLinks.security;
            default:
                return navLinks.student;
        }
    }, [role]);

    return (
        <nav className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-linear-to-r from-blue-600 to-purple-600" />
                    <span className="font-semibold">Equipment Tracker</span>
                </div>

                <div className="hidden lg:flex items-center gap-1">
                    {links.map((l) => (
                        <LinkItem key={l.path} to={l.path} name={l.name} icon={l.icon} />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                            <div className="mt-6 flex flex-col gap-1">
                                {links.map((l) => (
                                    <NavLink key={l.path} to={l.path} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? "text-blue-600 bg-blue-50" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                                        <l.icon className="h-4 w-4" />
                                        <span>{l.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="px-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <NavLink to="/student/profile">My Profile</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <NavLink to="/settings">Settings</NavLink>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { /* hook logout */ }}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}

Navbar.propTypes = {
    role: PropTypes.oneOf(Object.values(UserRole)),
    userInitials: PropTypes.string,
};


