import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import Sidebar from "@/components/layout/Sidebar";
import Topbar from "./Topbar";

const DESKTOP_BREAKPOINT = 640; // matches `sm:` in Tailwind config

export default function MainLayout({ children, heroContent }) {
  // Controls visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Logic for mobile menu state if needed
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 transition-all duration-300">

      {/* Floating Dark Container - Header + Hero */}
      <div className="bg-slate-900 rounded-[2rem] text-white shadow-2xl relative mb-8 overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8D8DC7] opacity-20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500 opacity-10 blur-[80px] rounded-full -ml-10 -mb-10"></div>
        </div>

        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Hero Content Slot */}
        {heroContent && (
          <div className="px-6 pb-8 pt-2 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
            {heroContent}
          </div>
        )}
      </div>

      <main className="px-2 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      {/* Footer */}
      <div className="w-full text-center text-gray-400 text-xs py-4 mt-auto">
        Tracknity &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
};
