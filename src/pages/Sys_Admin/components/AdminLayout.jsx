import React, { useState } from 'react';
import { Search, Bell, User, Menu, X, LayoutDashboard, Users, Settings, Database, Activity, FileText, Shield } from 'lucide-react';
import logo from '../../../assets/images/logo8noback.png';

const AdminLayout = ({ children, heroContent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const brandColor = '#8D8DC7';

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Mgmt', href: '/admin/users', icon: Users },
    { label: 'Config', href: '/admin/config', icon: Settings },
    { label: 'Data', href: '/admin/data', icon: Database },
    { label: 'Monitoring', href: '/admin/monitoring', icon: Activity },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Security', href: '/admin/security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 transition-all duration-300">

      {/* Floating Dark Container - Header + Hero */}
      <div className="bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden mb-8">
        {/* Background Glow Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D8DC7] opacity-20 blur-[100px] rounded-full pointer-events-none -mr-20 -mt-20"></div>

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
                <span className="text-xl font-bold tracking-tight hidden sm:block">Tracknity</span>
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
              <div className="relative hidden md:block group">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#8D8DC7] transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-slate-800/50 text-sm text-white pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] w-48 transition-all border border-transparent focus:border-[#8D8DC7]/30"
                />
              </div>

              <button className="relative p-2 hover:bg-slate-800 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-gray-300" />
                <span style={{ backgroundColor: brandColor }} className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-slate-900"></span>
              </button>

              <div className="flex items-center space-x-3 pl-2 sm:border-l border-slate-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">Admin</p>
                </div>
                <div style={{ backgroundColor: brandColor }} className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-slate-800">
                  <User className="w-5 h-5" />
                </div>
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
        &copy; 2025 Tracknity Management System. v1.0.0
      </div>
    </div>
  );
};

export default AdminLayout;
