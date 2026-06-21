"use client";

import { useState } from "react";
import { HabitEntry } from "@/lib/db";

interface WeightChartProps {
  entries: HabitEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "ALL">("1M");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Helper to convert kg to lbs
  const toLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

  // Filter entries based on timeframe
  const getFilteredEntries = () => {
    // Sort chronological for chart
    const chronoEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    
    if (timeframe === "7D") {
      return chronoEntries.slice(-7);
    } else if (timeframe === "1M") {
      return chronoEntries.slice(-30);
    } else {
      return chronoEntries;
    }
  };

  const filtered = getFilteredEntries();

  // Find min and max weight for scaling the chart
  const weights = filtered.map((e) => toLbs(e.weight || 74));
  const maxWeight = Math.max(...weights, 180);
  const minWeight = Math.min(...weights, 150) - 2; // offset to show variance
  const weightRange = maxWeight - minWeight;

  // Formatting date for label
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>Weight Trend</h2>
        <div className="chart-timeframe">
          {(["7D", "1M", "ALL"] as const).map((t) => (
            <button
              key={t}
              className={`timeframe-btn ${timeframe === t ? "active" : ""}`}
              onClick={() => setTimeframe(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bar-chart-container">
        {filtered.map((entry, index) => {
          const weightLbs = toLbs(entry.weight);
          // Calculate percentage height
          const heightPercent = ((weightLbs - minWeight) / weightRange) * 75 + 15; // scale between 15% and 90%

          // Label frequency
          const showLabel = 
            filtered.length <= 7 || 
            index === 0 || 
            index === Math.floor(filtered.length / 3) || 
            index === Math.floor((filtered.length / 3) * 2) || 
            index === filtered.length - 1;

          return (
            <div key={entry.id} className="bar-col">
              {/* Tooltip */}
              <div 
                className="chart-tooltip"
                style={{ 
                  display: hoveredBar === entry.id ? "block" : "none",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div>{formatDateLabel(entry.date)}</div>
                <div style={{ fontWeight: 700 }}>{weightLbs} lbs</div>
                <div style={{ fontSize: "9px", opacity: 0.8 }}>({entry.weight} kg)</div>
              </div>

              {/* Bar Fill wrapper */}
              <div className="bar-fill-wrapper">
                <div
                  className="bar-fill"
                  style={{ height: `${heightPercent}%` }}
                  onMouseEnter={() => setHoveredBar(entry.id)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              </div>

              {/* X Axis Label */}
              <span className="bar-label">
                {showLabel ? formatDateLabel(entry.date) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
