"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  History,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Lock,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AccountModal from "./AccountModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { useHabits } from "@/context/HabitContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, refreshUser } = useHabits();
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const popperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar_collapsed", String(nextState));
  };

  const handleSidebarClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("sidebar_collapsed", "false");
    }
  };

  // Handle clicking outside the popper to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popperRef.current && !popperRef.current.contains(event.target as Node)) {
        setIsPopperOpen(false);
      }
    }

    if (isPopperOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopperOpen]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleAccountClick = () => {
    setIsPopperOpen(false);
    setIsAccountModalOpen(true);
  };

  const handleResetClick = () => {
    setIsPopperOpen(false);
    setIsResetModalOpen(true);
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Track Habits",
      path: "/tracker",
      icon: CalendarDays,
    },
    {
      name: "All Activities",
      path: "/activities",
      icon: ClipboardList,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: TrendingUp,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const avatarPath = user && user.avatar ? `/Avatar/${user.avatar}` : "/Avatar/1.png";

  return (
    <>
      <aside 
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSidebarClick}
      >
        <div className="sidebar-top">
          {/* Logo Section */}
          <div className="sidebar-header" style={{ justifyContent: isCollapsed ? "center" : "space-between" }}>
            {!isCollapsed ? (
              <>
                <div className="logo-container">
                  <Image
                    src="/spowerlogo.png"
                    alt="SPOWER Logo"
                    width={32}
                    height={32}
                    className="logo-image"
                  />
                  <span className="logo-title">SPOWER</span>
                </div>
                <button className="toggle-sidebar-btn" onClick={toggleSidebar} title="Collapse Sidebar">
                  <ChevronLeft size={18} />
                </button>
              </>
            ) : (
              <div 
                className="logo-container" 
                style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {isHovered ? (
                  <ChevronRight size={22} style={{ color: "var(--primary-color)" }} />
                ) : (
                  <Image
                    src="/spowerlogo.png"
                    alt="SPOWER Logo"
                    width={32}
                    height={32}
                    className="logo-image"
                  />
                )}
              </div>
            )}
          </div>

          {/* Navigation Section */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link 
                  href={item.path} 
                  key={item.path} 
                  style={{ textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div 
                    className={`nav-item ${isActive ? "active" : ""}`}
                    data-tooltip={isCollapsed ? item.name : undefined}
                  >
                    <Icon size={18} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile Popper only - Upgrade Card removed) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Clickable User Card with Popper */}
          <div className="user-profile-wrapper" ref={popperRef}>
            {/* Popper Menu */}
            {isPopperOpen && (
              <div className="profile-popper" onClick={(e) => e.stopPropagation()}>
                <button className="popper-item" onClick={handleAccountClick}>
                  <User size={15} />
                  <span>Account</span>
                </button>
                <button className="popper-item" onClick={handleResetClick}>
                  <Lock size={15} />
                  <span>Reset Password</span>
                </button>
                <button className="popper-item logout-item" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}

            <div 
              className="user-profile-clickable"
              onClick={(e) => {
                e.stopPropagation();
                setIsPopperOpen(!isPopperOpen);
              }}
              data-tooltip={isCollapsed ? (user ? user.name : "Alex Rivera") : undefined}
              style={{ padding: isCollapsed ? "8px" : "12px 16px", justifyContent: isCollapsed ? "center" : "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: isCollapsed ? "0" : "12px", justifyContent: isCollapsed ? "center" : "flex-start", width: "100%" }}>
                <Image
                  src={avatarPath}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="user-avatar"
                />
                {!isCollapsed && (
                  <div className="user-info" style={{ textAlign: "left" }}>
                    <span className="user-name">{user ? user.name : "Alex Rivera"}</span>
                    <span className="user-role">
                      {user ? `Age: ${user.age}` : ""}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronUp size={16} style={{ color: "var(--text-muted)", opacity: 0.8 }} />}
            </div>
          </div>
        </div>
      </aside>

      {/* Account Settings Edit Modal */}
      {isAccountModalOpen && user && (
        <AccountModal
          currentUser={user}
          onClose={() => setIsAccountModalOpen(false)}
          onSave={refreshUser}
        />
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <ResetPasswordModal
          onClose={() => setIsResetModalOpen(false)}
        />
      )}
    </>
  );
}
