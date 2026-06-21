"use client";

import { useState } from "react";
import { HabitEntry } from "@/lib/db";

interface YearlyHeatmapProps {
  entries: HabitEntry[];
}

export default function YearlyHeatmap({ entries }: YearlyHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; level: number } | null>(null);

  // Generate days for the past year (365 days) ending today
  const generateYearDays = () => {
    const days = [];
    const today = new Date();
    
    // We want to align the grid to start on a Sunday, so we go back 53 weeks (plus padding to reach Sunday)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);
    const startDayOfWeek = startDate.getDay(); // 0 is Sunday
    
    // Go back to the preceding Sunday
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const entriesMap = new Map<string, HabitEntry>();
    entries.forEach(e => entriesMap.set(e.date, e));

    const totalDays = 371; // 53 weeks * 7 days
    const tempDate = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = tempDate.toISOString().split("T")[0];
      let level = 0;

      // Check if we have a real entry
      if (entriesMap.has(dateStr)) {
        const e = entriesMap.get(dateStr)!;
        let completedCount = 0;
        if (e.yoga !== "Rest Day" && e.yoga !== "Missed" && e.yoga !== "---") completedCount++;
        if (e.runJog !== "No Run" && e.runJog !== "Missed" && e.runJog !== "---") completedCount++;
        if (e.steps >= 10000) completedCount++;
        if (e.pythonAi >= 2) completedCount++;
        if (e.hindi !== "Missed" && e.hindi !== "---") completedCount++;
        if (e.sleepMinutes >= 420) completedCount++; // 7h+
        
        level = Math.min(4, Math.ceil(completedCount / 1.5));
      }

      days.push({
        date: dateStr,
        level,
        dayOfWeek: tempDate.getDay(),
        formattedDate: tempDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });

      // Next day
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return days;
  };

  const days = generateYearDays();

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>Yearly Habit Volume</h2>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-grid-scroll">
          <div className="heatmap-grid">
            {days.map((day, idx) => (
              <div
                key={`${day.date}-${idx}`}
                className="heatmap-cell"
                data-level={day.level}
                onMouseEnter={() => setHoveredCell({ date: day.formattedDate, level: day.level })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {hoveredCell && hoveredCell.date === day.formattedDate && (
                  <div
                    className="chart-tooltip"
                    style={{
                      display: "block",
                      bottom: "125%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "10px",
                      padding: "4px 8px",
                    }}
                  >
                    {day.formattedDate}: {day.level * 2} habits completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-box" data-level="0"></div>
          <div className="legend-box" data-level="1"></div>
          <div className="legend-box" data-level="2"></div>
          <div className="legend-box" data-level="3"></div>
          <div className="legend-box" data-level="4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
