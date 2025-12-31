import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";

const DESKTOP_BREAKPOINT = 640; 

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT) {
        return true;
      }
      const stored = localStorage.getItem("sidebarOpen");
      if (stored !== null) {
        return stored === "1";
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-[#0b1d3a]/15">
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/30 sm:hidden z-30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out"
      >
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
        {/* <p > Welcome back to this</p> */}
        <main className="flex-1 max-w-[1920px] mx-auto w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
