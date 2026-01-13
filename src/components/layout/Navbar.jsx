import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { Menu } from "lucide-react";

// Define navigation items based on role (keeping your existing structure)
const navLinks = {
    student: [
        { name: "Dashboard", path: "/student/dashboard" },
        { name: "Browse Equipment", path: "/student/browse" },
        { name: "My Checkouts", path: "/student/current-checkouts" },
        { name: "History", path: "/student/history" },
        { name: "Notifications", path: "/student/notifications" },
    ],
    admin: [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Users", path: "/admin/users" },
        { name: "Equipment", path: "/admin/equipment" },
        { name: "Reports", path: "/admin/reports" },
    ],
    itStaff: [
        { name: "Dashboard", path: "/it-staff/dashboard" },
        { name: "Maintenance", path: "/it-staff/maintenance" },
        { name: "Requests", path: "/it-staff/requests" },
    ],
    security: [
        { name: "Dashboard", path: "/security/dashboard" },
        { name: "Verify Returns", path: "/security/returns" },
    ],
};

// But for your image, we need just these 4 items:
const imageNavItems = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Equipment", path: "/student/browse" },
    { name: "Borrowed Items", path: "/student/borrowed-items" },
    { name: "Report", path: "/student/report" },
    { name: "Score", path: "/student/score" },
];

export default function Navbar({ role = "REGULAR_USER" }) {
    const [open, setOpen] = useState(false);

    // Use your existing role logic, but I'll use the imageNavItems for now
    // You can switch back to role-based if needed
    const links = imageNavItems; // Use the exact 4 items from your image

    return (
        <nav className="w-full bg-white sticky top-0 z-40">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                {/* Left: Brand - Exactly like your image */}
                <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">
                        Tracknity
                    </span>
                </div>

                {/* Right: Navigation Links - Exactly like your image */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `text-base font-medium ${isActive
                                    ? "text-black"
                                    : "text-black hover:text-gray-700"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* Mobile Menu Trigger - Hidden on desktop */}
                <div className="md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64">
                            <div className="mt-8 flex flex-col gap-1">
                                {links.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setOpen(false)}
                                        className={({ isActive }) =>
                                            `px-4 py-3 text-base font-medium ${isActive
                                                ? "text-black"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`
                                        }
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}

Navbar.propTypes = {
    role: PropTypes.string,
};