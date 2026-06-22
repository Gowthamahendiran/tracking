"use client";

import { useState } from "react";
import { HabitEntry } from "@/lib/db";
import { TrendingUp } from "lucide-react";

interface WeightChartProps {
  entries: HabitEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "ALL">("7D");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Helper to format local "YYYY-MM-DD" to "Jun 22" safely
  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  // Helper to convert Date object to local "YYYY-MM-DD" safely
  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to get Sunday of the week containing date d
  const getSunday = (d: Date) => {
    const day = d.getDay(); // 0 is Sunday, ..., 6 is Saturday
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  // Parse reference date from latest entry, falling back to current system date
  let referenceDate = new Date();
  if (entries.length > 0) {
    const [year, month, day] = entries[0].date.split("-").map(Number);
    referenceDate = new Date(year, month - 1, day);
  }

  // Generate calendar dates for the selected timeframe
  const getCalendarDates = (): Date[] => {
    const calendarDates: Date[] = [];

    if (timeframe === "7D") {
      const sunday = getSunday(referenceDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        calendarDates.push(d);
      }
    } else if (timeframe === "1M") {
      const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
      const daysInMonth = endOfMonth.getDate();
      for (let i = 0; i < daysInMonth; i++) {
        const d = new Date(startOfMonth);
        d.setDate(startOfMonth.getDate() + i);
        calendarDates.push(d);
      }
    } else {
      // ALL timeframe: range from earliest to latest entry
      const chronoEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
      if (chronoEntries.length > 0) {
        const [sYear, sMonth, sDay] = chronoEntries[0].date.split("-").map(Number);
        const [eYear, eMonth, eDay] = chronoEntries[chronoEntries.length - 1].date.split("-").map(Number);
        const start = new Date(sYear, sMonth - 1, sDay);
        const end = new Date(eYear, eMonth - 1, eDay);

        if (start.getTime() === end.getTime()) {
          const sunday = getSunday(start);
          for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            calendarDates.push(d);
          }
        } else {
          const temp = new Date(start);
          while (temp <= end) {
            calendarDates.push(new Date(temp));
            temp.setDate(temp.getDate() + 1);
          }
        }
      } else {
        // Fallback if no entries at all
        const sunday = getSunday(referenceDate);
        for (let i = 0; i < 7; i++) {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          calendarDates.push(d);
        }
      }
    }

    return calendarDates;
  };

  const calendarDates = getCalendarDates();

  // Map calendar dates to entries
  const entryMap = new Map<string, HabitEntry>();
  entries.forEach((e) => {
    entryMap.set(e.date, e);
  });

  // Plot dimensions
  const PaddingLeft = 45;
  const PaddingRight = 20;
  const PaddingTop = 20;
  const PaddingBottom = 35;
  const PlotWidth = 600 - PaddingLeft - PaddingRight;
  const PlotHeight = 220 - PaddingTop - PaddingBottom;

  // Determine points along the X-axis
  const points = calendarDates.map((dateObj, index) => {
    const dateStr = toLocalDateString(dateObj);
    const x = calendarDates.length > 1
      ? PaddingLeft + (index / (calendarDates.length - 1)) * PlotWidth
      : PaddingLeft + PlotWidth / 2;
    
    const entry = entryMap.get(dateStr);

    return {
      dateStr,
      dateObj,
      x,
      hasEntry: !!entry,
      weight: entry ? entry.weight : null,
      entry: entry || null,
    };
  });

  const activePoints = points.filter((p) => p.hasEntry && p.weight !== null) as {
    dateStr: string;
    dateObj: Date;
    x: number;
    hasEntry: true;
    weight: number;
    entry: HabitEntry;
  }[];

  // If no weight data recorded in the timeframe, render empty state
  if (activePoints.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2>Weight Trend</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Track your weight progress over time
            </p>
          </div>
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

        <div 
          style={{ 
            height: "220px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: "12px",
            border: "1px dashed var(--border-color)",
            borderRadius: "8px",
            marginTop: "10px"
          }}
        >
          <div 
            style={{ 
              backgroundColor: "var(--badge-blue-bg)", 
              color: "var(--primary-color)", 
              padding: "12px", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "15px" }}>No weight data yet</div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Start logging your weight to see your progress here.</div>
        </div>
      </div>
    );
  }

  // Calculate dynamic scales and ticks for Y axis
  const activeWeights = activePoints.map((p) => p.weight);
  const maxW = Math.max(...activeWeights);
  const minW = Math.min(...activeWeights);

  let yMin = Math.floor(minW - 1);
  let yMax = Math.ceil(maxW + 1);
  if (minW === maxW) {
    yMin = Math.floor(minW - 5);
    yMax = Math.ceil(maxW + 5);
  }

  const tickRange = yMax - yMin;
  const step = Math.ceil(tickRange / 4) || 1;
  const start = Math.floor(yMin);

  const yTicks = [start + step * 4, start + step * 3, start + step * 2, start + step * 1, start];
  const actualMax = yTicks[0];
  const actualMin = yTicks[4];
  const denom = actualMax - actualMin || 1;

  // Calculate Y coordinates for the active plotted points
  const plottedPoints = activePoints.map((pt) => {
    const y = PaddingTop + PlotHeight - ((pt.weight - actualMin) / denom) * PlotHeight;
    return {
      id: pt.entry.id,
      x: pt.x,
      y,
      weight: pt.weight,
      dateFormatted: formatDateLabel(pt.dateStr),
    };
  });

  const pathD = plottedPoints.map((pt, index) => `${index === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  const areaD = plottedPoints.length > 1
    ? `${pathD} L ${plottedPoints[plottedPoints.length - 1].x} ${PaddingTop + PlotHeight} L ${plottedPoints[0].x} ${PaddingTop + PlotHeight} Z`
    : "";

  // Dynamic label display density logic
  const showLabel = (index: number, total: number) => {
    if (total <= 7) return true;
    if (total <= 31) {
      if (index === 0 || index === total - 1) return true;
      return index % 5 === 0;
    }
    if (index === 0 || index === total - 1) return true;
    const interval = Math.ceil(total / 8);
    return index % interval === 0;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h2>Weight Trend</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
            Track your weight progress over time
          </p>
        </div>
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

      <div style={{ position: "relative", width: "100%", marginTop: "20px" }}>
        {/* SVG Container */}
        <svg 
          viewBox="0 0 600 220" 
          width="100%" 
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Left Y-Axis line */}
          <line
            x1={PaddingLeft}
            y1={PaddingTop}
            x2={PaddingLeft}
            y2={PaddingTop + PlotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Bottom X-Axis line */}
          <line
            x1={PaddingLeft}
            y1={PaddingTop + PlotHeight}
            x2={600 - PaddingRight}
            y2={PaddingTop + PlotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Y Axis Ticks & Labels */}
          {yTicks.map((tick, index) => {
            const y = PaddingTop + (index / (yTicks.length - 1)) * PlotHeight;
            return (
              <g key={`y-axis-${tick}-${index}`}>
                {/* Y Axis Tick Mark */}
                <line
                  x1={PaddingLeft - 6}
                  y1={y}
                  x2={PaddingLeft}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                {/* Y Axis Label */}
                <text
                  x={PaddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks & Labels */}
          {calendarDates.map((dateObj, index) => {
            const x = calendarDates.length > 1
              ? PaddingLeft + (index / (calendarDates.length - 1)) * PlotWidth
              : PaddingLeft + PlotWidth / 2;
            const dateFormatted = formatDateLabel(toLocalDateString(dateObj));
            const labelVisible = showLabel(index, calendarDates.length);

            return (
              <g key={`x-tick-${index}`}>
                {labelVisible && (
                  <>
                    <line
                      x1={x}
                      y1={PaddingTop + PlotHeight}
                      x2={x}
                      y2={PaddingTop + PlotHeight + 6}
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={PaddingTop + PlotHeight + 22}
                      textAnchor="middle"
                      fill="var(--text-main)"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {dateFormatted}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* The Area under the Line */}
          {plottedPoints.length > 1 && (
            <path
              d={areaD}
              fill="url(#chart-gradient)"
            />
          )}

          {/* The Trend Line */}
          {plottedPoints.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Dots */}
          {plottedPoints.map((pt, index) => {
            return (
              <g key={`point-${pt.id}-${index}`}>
                {/* Hollow Dot at each data point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint === pt.id ? "7" : "5"}
                  fill="#ffffff"
                  stroke="var(--primary-color)"
                  strokeWidth="2.5"
                  style={{ transition: "r 0.1s ease" }}
                />

                {/* Larger transparent hover target for easier mouse interaction */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="15"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredPoint(pt.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML Tooltips overlay */}
        {plottedPoints.map((pt) => {
          if (hoveredPoint !== pt.id) return null;
          return (
            <div
              key={`tooltip-${pt.id}`}
              className="chart-tooltip"
              style={{
                display: "block",
                position: "absolute",
                left: `${((pt.x / 600) * 100).toFixed(2)}%`,
                top: `${((pt.y / 220) * 100).toFixed(2)}%`,
                bottom: "auto", // Override CSS class bottom: 105%
                transform: "translate(-50%, -125%)",
                transition: "all 0.1s ease",
                zIndex: 50,
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "2px" }}>{pt.dateFormatted}</div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>{pt.weight} kg</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
