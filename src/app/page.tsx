"use client";

import { useEffect, useState } from "react";
import { calculateStats, HabitEntry } from "@/lib/db";
import WeightChart from "../components/WeightChart";
import WeeklyConsistency from "../components/WeeklyConsistency";
import YearlyHeatmap from "../components/YearlyHeatmap";
import { 
  Bell, 
  HelpCircle, 
  Plus, 
  Sparkles,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Layers
} from "lucide-react";
import Link from "next/link";
import StreakChip from "@/components/StreakChip";

import { useHabits } from "@/context/HabitContext";

export default function Dashboard() {
  const { entries, loading, user } = useHabits();

  const stats = calculateStats(entries);

  // Helper to convert kg to lbs
  const toLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

  // Latest weight from entries
  const currentWeightLbs = entries.length > 0 ? toLbs(entries[0].weight) : 0;
  
  // Dynamic weight change calculation
  let weightChangeLbs = 0;
  if (entries.length > 1) {
    const latestWeight = entries[0].weight;
    const earliestWeight = entries[entries.length - 1].weight;
    weightChangeLbs = toLbs(latestWeight - earliestWeight);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <>

      {/* Greeting Banner */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <h1 style={{ margin: 0 }}>Good Morning, {user ? user.name.split(" ")[0] : "Alex"}</h1>
          <StreakChip />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
          Here's how your health and habits are trending today.
        </p>
      </div>

      {/* Quick Stats Grid Row */}
      <div className="metrics-row">
        {/* Card 1: Weight */}
        <div className="metric-card">
          <span className="metric-label">Current Weight</span>
          <span className="metric-value">
            {currentWeightLbs > 0 ? `${currentWeightLbs} ` : "--- "}
            {currentWeightLbs > 0 && <span style={{ fontSize: "14px", fontWeight: 500 }}>lbs</span>}
          </span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Last logged weight</span>
          </span>
        </div>

        {/* Card 2: Weight Change */}
        <div className="metric-card">
          <span className="metric-label">Weight Change</span>
          <span className="metric-value">
            {weightChangeLbs !== 0 ? `${weightChangeLbs > 0 ? "+" : ""}${weightChangeLbs} ` : "0.0 "}
            <span style={{ fontSize: "14px", fontWeight: 500 }}>lbs total</span>
          </span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Since first log</span>
          </span>
        </div>

        {/* Card 3: Current Streak */}
        <div className="metric-card">
          <span className="metric-label">Current Streak</span>
          <span className="metric-value">{stats.streakDays} <span style={{ fontSize: "14px", fontWeight: 500 }}>Days</span></span>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: `${Math.min(100, stats.streakDays * 10)}%`, height: "100%", backgroundColor: "var(--primary-color)" }}></div>
          </div>
        </div>

        {/* Card 4: Longest Streak */}
        <div className="metric-card">
          <span className="metric-label">Longest Streak</span>
          <span className="metric-value">{stats.longestStreak} <span style={{ fontSize: "14px", fontWeight: 500 }}>Days</span></span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>All-time record</span>
          </span>
        </div>

        {/* Card 5: Completion Rate */}
        <div className="metric-card">
          <span className="metric-label">Completion Rate</span>
          <span className="metric-value">{stats.completionRate}%</span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Avg completion rate</span>
          </span>
        </div>

        {/* Card 6: Total Entries */}
        <div className="metric-card">
          <span className="metric-label">Total Entries</span>
          <span className="metric-value">{stats.totalEntries}</span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Total days logged</span>
          </span>
        </div>
      </div>

      {/* Charts Grid Layout */}
      <div className="dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Weight Trend Chart */}
          <WeightChart entries={entries} />

          {/* Heatmap Graph */}
          <YearlyHeatmap entries={entries} />
        </div>

        <div>
          {/* Weekly Consistency progress */}
          <WeeklyConsistency entries={entries} />
        </div>
      </div>

    </>
  );
}
