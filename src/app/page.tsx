"use client";

import { useEffect, useState } from "react";
import { getEntries, calculateStats, HabitEntry } from "@/lib/db";
import WeightChart from "../components/WeightChart";
import WeeklyConsistency from "../components/WeeklyConsistency";
import YearlyHeatmap from "../components/YearlyHeatmap";
import AddEntryModal from "../components/AddEntryModal";
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

export default function Dashboard() {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const stats = calculateStats(entries);

  // Helper to convert kg to lbs
  const toLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

  // Latest weight from entries
  const currentWeightLbs = entries.length > 0 ? toLbs(entries[0].weight) : 174.5;
  const weightChangeLbs = -12.4; // Matching screenshots design by default

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <>
      {/* Top Header Row */}
      <div className="view-header">
        <div className="nav-tabs">
          <div className="nav-tab active">Dashboard</div>
          <Link href="/tracker" style={{ textDecoration: "none" }}>
            <div className="nav-tab">Daily</div>
          </Link>
        </div>

        <div className="header-right">
          {/* Streak pill */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              backgroundColor: "var(--badge-blue-bg)", 
              color: "var(--badge-blue-text)", 
              padding: "6px 16px", 
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            <Zap size={14} fill="currentColor" />
            <span>Streak: {stats.streakDays} Days</span>
          </div>

          {/* Add Entry Button */}
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Entry</span>
          </button>

          <button style={{ background: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <Bell size={20} />
          </button>

          <button style={{ background: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Greeting Banner */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1>Good Morning, Alex</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Here's how your health and habits are trending today.
        </p>
      </div>

      {/* Quick Stats Grid Row */}
      <div className="metrics-row">
        {/* Card 1: Weight */}
        <div className="metric-card">
          <span className="metric-label">Current Weight</span>
          <span className="metric-value">{currentWeightLbs} <span style={{ fontSize: "14px", fontWeight: 500 }}>lbs</span></span>
          <span className="metric-desc trend-down">
            <TrendingDown size={14} />
            <span>-0.8 lbs this week</span>
          </span>
        </div>

        {/* Card 2: Weight Change */}
        <div className="metric-card">
          <span className="metric-label">Weight Change</span>
          <span className="metric-value">{weightChangeLbs} <span style={{ fontSize: "14px", fontWeight: 500 }}>lbs total</span></span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Since Jan 1st</span>
          </span>
        </div>

        {/* Card 3: Current Streak */}
        <div className="metric-card">
          <span className="metric-label">Current Streak</span>
          <span className="metric-value">{stats.streakDays} <span style={{ fontSize: "14px", fontWeight: 500 }}>Days</span></span>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#f1f5f9", borderRadius: "9999px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: "65%", height: "100%", backgroundColor: "var(--primary-color)" }}></div>
          </div>
        </div>

        {/* Card 4: Longest Streak */}
        <div className="metric-card">
          <span className="metric-label">Longest Streak</span>
          <span className="metric-value">45 <span style={{ fontSize: "14px", fontWeight: 500 }}>Days</span></span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Last achieved Feb 12</span>
          </span>
        </div>

        {/* Card 5: Completion Rate */}
        <div className="metric-card">
          <span className="metric-label">Completion Rate</span>
          <span className="metric-value">{stats.completionRate}%</span>
          <span className="metric-desc trend-down">
            <TrendingDown size={14} />
            <span>-2% from last month</span>
          </span>
        </div>

        {/* Card 6: Total Entries */}
        <div className="metric-card">
          <span className="metric-label">Total Entries</span>
          <span className="metric-value">156</span>
          <span className="metric-desc" style={{ color: "var(--text-muted)" }}>
            <span>Across 12 habits</span>
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <AddEntryModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchEntries} 
        />
      )}
    </>
  );
}
