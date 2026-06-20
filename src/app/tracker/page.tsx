"use client";

import { useEffect, useState } from "react";
import { getEntries, calculateStats, HabitEntry, minutesToSleepString } from "@/lib/db";
import AddEntryModal from "../../components/AddEntryModal";
import {
  Bell,
  HelpCircle,
  Plus,
  Zap,
  Filter,
  ArrowUpDown,
  Search,
  Download,
  Lock,
  Edit2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function DailyTracker() {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HabitEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);

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

  // Filter and Search logic
  const getFilteredEntries = () => {
    let result = [...entries];
    
    // Sort
    result.sort((a, b) => {
      if (sortAsc) {
        return a.date.localeCompare(b.date);
      } else {
        return b.date.localeCompare(a.date);
      }
    });

    // Search query
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.date.includes(query) ||
          e.day.toLowerCase().includes(query) ||
          e.yoga.toLowerCase().includes(query) ||
          e.runJog.toLowerCase().includes(query) ||
          e.cardio.toLowerCase().includes(query) ||
          e.hindi.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const filtered = getFilteredEntries();

  const handleEditClick = (entry: HabitEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  // Export to CSV helper
  const handleExport = () => {
    const headers = ["Date", "Day", "Weight (kg)", "Yoga", "Run/Jog", "Steps", "Cardio", "Python/AI (hrs)", "Hindi", "Sleep"];
    const csvRows = [headers.join(",")];
    
    entries.forEach((e) => {
      const row = [
        e.date,
        e.day,
        e.weight,
        `"${e.yoga}"`,
        `"${e.runJog}"`,
        e.steps,
        `"${e.cardio}"`,
        e.pythonAi,
        `"${e.hindi}"`,
        `"${minutesToSleepString(e.sleepMinutes)}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LifeTracker_Habits_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom status badges matching screenshot
  const renderYogaBadge = (yogaVal: string) => {
    if (yogaVal === "Rest Day") return <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Rest Day</span>;
    if (yogaVal === "Missed" || yogaVal === "---") return <span className="badge-red">Missed</span>;
    return <span className="badge-green">{yogaVal}</span>;
  };

  const renderRunBadge = (runVal: string) => {
    if (runVal === "No Run") return <span className="badge-red">No Run</span>;
    if (runVal === "Missed" || runVal === "---") return <span style={{ color: "var(--text-light)" }}>---</span>;
    return <span className="badge-green">{runVal}</span>;
  };

  const renderPythonBadge = (hours: number) => {
    if (hours <= 0) return <span style={{ color: "var(--text-light)" }}>---</span>;
    return <span className="badge-blue">{hours.toFixed(1)} {hours === 1 ? "hour" : "hours"}</span>;
  };

  const renderHindiBadge = (hindiVal: string) => {
    if (hindiVal === "Missed" || hindiVal === "---") return <span style={{ color: "var(--text-light)" }}>Missed</span>;
    return <span className="badge-orange">{hindiVal}</span>;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading Habit Logs...
      </div>
    );
  }

  return (
    <>
      {/* Top Header Row */}
      <div className="view-header">
        <div className="nav-tabs">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="nav-tab">Daily Tracker</div>
          </Link>
          <div className="nav-tab active">Today</div>
          <div className="nav-tab">Calendar View</div>
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
          <button className="btn-primary" onClick={handleAddNewClick}>
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

      {/* Main logs table panel */}
      <div className="table-container">
        {/* Table top controls */}
        <div className="table-controls">
          <div className="controls-left">
            <button className="btn-secondary" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
              Showing {filtered.length} entries for current week
            </span>
          </div>

          <div className="controls-right">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search logs..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="btn-secondary" onClick={handleExport} title="Export to CSV">
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Table data grid */}
        <div style={{ overflowX: "auto" }}>
          <table className="tracker-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Weight</th>
                <th>Yoga</th>
                <th>Run/Jog</th>
                <th>Steps</th>
                <th>Cardio</th>
                <th>Python/AI</th>
                <th>Hindi</th>
                <th>Sleep</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                    No entries found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td className="cell-bold">
                      <div className="cell-date-lock">
                        <span>{entry.date}</span>
                        <Lock className="lock-icon" size={13} />
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontWeight: 500 }}>{entry.day}</td>
                    <td>{entry.weight} kg</td>
                    <td>{renderYogaBadge(entry.yoga)}</td>
                    <td>{renderRunBadge(entry.runJog)}</td>
                    <td>{entry.steps.toLocaleString()}</td>
                    <td style={{ fontStyle: entry.cardio === "---" ? "normal" : "italic", color: entry.cardio === "---" ? "var(--text-light)" : "inherit" }}>
                      {entry.cardio}
                    </td>
                    <td>{renderPythonBadge(entry.pythonAi)}</td>
                    <td>{renderHindiBadge(entry.hindi)}</td>
                    <td>{minutesToSleepString(entry.sleepMinutes)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => handleEditClick(entry)} 
                          style={{ background: "none", cursor: "pointer", color: "var(--primary-color)", padding: "4px" }}
                          title="Edit log"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary statistics row below the table */}
      <div className="metrics-row" style={{ marginTop: "10px" }}>
        {/* Card 1: Sleep */}
        <div className="metric-card">
          <span className="metric-label" style={{ fontSize: "11px" }}>Avg. Sleep</span>
          <span className="metric-value" style={{ fontSize: "24px" }}>{stats.avgSleep}</span>
          <span className="metric-desc trend-up">
            <TrendingUp size={12} />
            <span>+12% vs last week</span>
          </span>
        </div>

        {/* Card 2: Yoga Sessions */}
        <div className="metric-card">
          <span className="metric-label" style={{ fontSize: "11px" }}>Yoga Sessions</span>
          <span className="metric-value" style={{ fontSize: "24px" }}>{stats.yogaSessions}</span>
          <span className="metric-desc trend-up" style={{ color: "#b45309" }}>
            <span>On target</span>
          </span>
        </div>

        {/* Card 3: Avg Steps */}
        <div className="metric-card">
          <span className="metric-label" style={{ fontSize: "11px" }}>Avg. Steps</span>
          <span className="metric-value" style={{ fontSize: "24px" }}>{stats.avgSteps.toLocaleString()}</span>
          <span className="metric-desc trend-up">
            <span>Above goal (10k)</span>
          </span>
        </div>

        {/* Card 4: Learning Hours */}
        <div className="metric-card">
          <span className="metric-label" style={{ fontSize: "11px" }}>Learning Hours</span>
          <span className="metric-value" style={{ fontSize: "24px" }}>{stats.learningHours} hrs</span>
          <span className="metric-desc trend-up" style={{ color: "var(--primary-color)" }}>
            <span>Top 5% of users</span>
          </span>
        </div>
      </div>

      {/* Edit Entry Modal */}
      {isModalOpen && (
        <AddEntryModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
          onSave={fetchEntries}
          existingEntry={editingEntry}
        />
      )}
    </>
  );
}
