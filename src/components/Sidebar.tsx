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
} from "lucide-react";
import AccountModal from "./AccountModal";
import ResetPasswordModal from "./ResetPasswordModal";

interface UserProfile {
  name: string;
  email: string;
  dob: string;
  avatar: string;
  age: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const popperRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        throw new Error("Not authenticated");
      }
    } catch (e) {
      console.error("Auth fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* Logo Section */}
          <div className="logo-container">
            <span className="logo-title">LifeTracker</span>
            <span className="logo-subtitle">Premium Habit Tracking</span>
          </div>

          {/* Navigation Section */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link href={item.path} key={item.path} style={{ textDecoration: "none" }}>
                  <div className={`nav-item ${isActive ? "active" : ""}`}>
                    <Icon size={18} />
                    <span>{item.name}</span>
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
              <div className="profile-popper">
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
              onClick={() => setIsPopperOpen(!isPopperOpen)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <Image
                  src={avatarPath}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="user-avatar"
                />
                <div className="user-info">
                  <span className="user-name">{user ? user.name : "Alex Rivera"}</span>
                  <span className="user-role">
                    {user ? `Age: ${user.age}` : ""}
                  </span>
                </div>
              </div>
              <ChevronUp size={16} style={{ color: "var(--text-muted)", opacity: 0.8 }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Account Settings Edit Modal */}
      {isAccountModalOpen && user && (
        <AccountModal
          currentUser={user}
          onClose={() => setIsAccountModalOpen(false)}
          onSave={fetchProfile}
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
