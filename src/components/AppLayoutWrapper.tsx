"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/context/HabitContext";
import Sidebar from "./Sidebar";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useHabits();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner-outer"></div>
        </div>
        <p className="loading-text">Loading data</p>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      {/* Mobile Top Navigation Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="mobile-logo-container">
            <Image
              src="/spowerlogo.png"
              alt="SPOWER Logo"
              width={28}
              height={28}
            />
            <span className="mobile-logo-title">SPOWER</span>
          </div>
        </div>
        <div className="mobile-header-right">
          {/* Visual balance */}
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
