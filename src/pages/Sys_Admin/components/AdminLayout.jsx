import React, { useState } from 'react';
import { Search, Bell, User, Menu, X, LayoutDashboard, Users, Settings, Database, Activity, FileText, Shield, LogOut } from 'lucide-react';
import logo from '../../../assets/images/logo8noback.png';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const AdminLayout = ({ children, heroContent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const brandColor = '#8D8DC7';
  const { t } = useTranslation("common");

  const navItems = [
    { label: t("nav.dashboard"), href: '/admin/dashboard', icon: LayoutDashboard },
    { label: t("nav.userMgmt"), href: '/admin/users', icon: Users },
    { label: t("nav.config"), href: '/admin/config', icon: Settings },
    { label: t("nav.data"), href: '/admin/data', icon: Database },
    { label: t("nav.monitoring"), href: '/admin/monitoring', icon: Activity },
    { label: t("nav.reports"), href: '/admin/reports', icon: FileText },
    { label: t("nav.security"), href: '/admin/security', icon: Shield },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 transition-all duration-300">

      {/* Floating Dark Container - Header + Hero */}
      <div className="bg-slate-900 rounded-[2rem] text-white shadow-2xl relative mb-8">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D8DC7] opacity-20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        </div>

        <header className="px-6 py-5 relative z-20 border-b border-slate-800/50">
          <div className="flex items-center justify-between">

            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-full transition-colors">
                {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
              </button>

              <div className="flex items-center space-x-3">
                {/* Logo Image */}
                <img src={logo} alt="Tracknity Logo" className="h-10 w-auto object-contain" />
                <span className="text-xl font-bold tracking-tight hidden sm:block">{t("misc.tracknity")}</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-800/50 p-1 rounded-full backdrop-blur-sm border border-slate-700/50">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Utility Icons */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search removed as per request */}

              {/* Language Switcher */}
              <LanguageSwitcher variant="dark" />

              <Link to="/admin/notifications" className="relative p-2 hover:bg-slate-800 rounded-full transition-colors group">
                <Bell className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                <span style={{ backgroundColor: brandColor }} className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              </Link>

              <div className="flex items-center space-x-3 pl-2 sm:border-l border-slate-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-slate-800/50 rounded-full p-1 pr-3 transition-colors outline-none group">
                      <div style={{ backgroundColor: brandColor }} className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-slate-800 shadow-lg shadow-[#8D8DC7]/20 group-hover:scale-105 transition-transform">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white group-hover:text-[#8D8DC7] transition-colors">{t("roles.admin")}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">System</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl bg-white/95 backdrop-blur-lg mt-2">
                    <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-xl mb-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-800">{t("auth.systemAdmin")}</p>
                        <p className="text-xs text-[#8D8DC7] font-medium">admin@tracknity.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild className="rounded-lg focus:bg-slate-50 focus:text-[#8D8DC7] cursor-pointer p-2.5 transition-colors font-medium text-slate-600">
                      <Link to="/admin/profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t("auth.myProfile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer p-2.5 transition-colors font-medium flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      {t("auth.logOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-gray-300 hover:text-white font-medium flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Hero Content Slot - This will contain the StatsCards */}
        {heroContent && (
          <div className="px-6 pb-8 pt-2">
            {heroContent}
          </div>
        )}
      </div>

      {/* Main Content Area - Rendered OUTSIDE the dark bubble */}
      <main className="px-2 pb-8">
        {children}
      </main>

      {/* Footer */}
      <div className="w-full text-center text-gray-400 text-xs py-4 mt-auto">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </div>
  );
};

export default AdminLayout;
