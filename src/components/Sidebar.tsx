"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  History,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  age: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch logged in user details
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Fallback or leave as null (middleware redirects if not on login/register)
      });
  }, []);

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

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Daily Tracker",
      path: "/tracker",
      icon: CalendarDays,
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

  return (
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

      {/* Sidebar Footer (Upgrade Pro & Profile) */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Upgrade Card */}
        <div className="upgrade-box">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={16} />
            <span className="upgrade-title">Upgrade to Pro</span>
          </div>
          <span className="upgrade-desc">
            Unlock advanced analytics, yearly calendars, and unlimited habit tracking.
          </span>
          <div className="upgrade-btn">Go Premium</div>
        </div>

        {/* User Card */}
        <div className="user-profile" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={40}
              height={40}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{user ? user.name : "Alex Rivera"}</span>
              <span className="user-role">
                {user ? `Free Member (Age: ${user.age})` : "Free Member"}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: "var(--text-muted)", 
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Log Out"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
