"use client";

import { useEffect, useState } from "react";
import { HabitEntry, minutesToSleepString } from "@/lib/db";
import { useHabits } from "@/context/HabitContext";
import {
  ArrowUpDown,
  Search,
  Download,
  Lock,
  Inbox,
} from "lucide-react";
import StreakChip from "@/components/StreakChip";

export default function AllActivities() {
  const { entries, loading } = useHabits();

  // History Tab States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);


  // All Activities Tab Filter and Sort logic
  const getAllActivitiesFiltered = () => {
    let result = [...entries];

    result.sort((a, b) => {
      if (sortAsc) {
        return a.date.localeCompare(b.date);
      } else {
        return b.date.localeCompare(a.date);
      }
    });

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

  const filteredAll = getAllActivitiesFiltered();

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading Activities History...
      </div>
    );
  }

  return (
    <>
      {/* Page Title & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>All Activities</h1>
            <StreakChip />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
            Review and search all your archived habit logs.
          </p>
        </div>
      </div>

      <div className="table-container">
        {/* Table top controls */}
        <div className="table-controls">
          <div className="controls-left">
            <button className="btn-secondary" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
              Showing {filteredAll.length} entries total
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
                <th>Meditation</th>
                <th>Run/Jog</th>
                <th>Steps</th>
                <th>Activity</th>
                <th>AI Study</th>
                <th>Hindi Study</th>
                <th>Sleep</th>
              </tr>
            </thead>
            <tbody>
              {filteredAll.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: 0 }}>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                      height: "500px",
                      color: "var(--text-muted)",
                      backgroundColor: "var(--bg-card)",
                      borderRadius: "0 0 12px 12px"
                    }}>
                      <Inbox size={48} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                      <span style={{ fontSize: "16px", fontWeight: 500 }}>No logged records found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAll.map((entry) => (
                  <tr key={entry.id}>
                    <td className="cell-bold">
                      <div className="cell-date-lock">
                        <span>{entry.date}</span>
                        <Lock className="lock-icon" size={13} />
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontWeight: 500 }}>{entry.day}</td>
                    <td>{entry.weight} kg</td>
                    <td>{entry.yoga}</td>
                    <td>{entry.runJog}</td>
                    <td>{entry.steps.toLocaleString()}</td>
                    <td>{entry.cardio}</td>
                    <td>{entry.pythonAi.toFixed(1)} hrs</td>
                    <td>{entry.hindi}</td>
                    <td>{minutesToSleepString(entry.sleepMinutes)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
