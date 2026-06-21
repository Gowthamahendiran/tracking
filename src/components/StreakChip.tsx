"use client";

import { useHabits } from "@/context/HabitContext";
import { calculateStats } from "@/lib/db";
import { Flame } from "lucide-react";

export default function StreakChip() {
  const { entries } = useHabits();
  const stats = calculateStats(entries);

  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "6px", 
        backgroundColor: "var(--badge-blue-bg)", 
        color: "var(--badge-blue-text)", 
        padding: "6px 12px", 
        borderRadius: "9999px",
        fontSize: "14px",
        fontWeight: 600
      }}
    >
      <Flame size={14} fill="currentColor" style={{ color: "#ef4444" }} />
      <span>{stats.streakDays} Day Streak</span>
    </div>
  );
}
