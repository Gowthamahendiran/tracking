"use client";

import { useEffect, useState } from "react";
import { getEntries, calculateStats, HabitEntry } from "@/lib/db";
import { TrendingUp, Award, Clock, ArrowRight, Zap, Target } from "lucide-react";

export default function Analytics() {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const stats = calculateStats(entries);

  return (
    <>
      <div className="view-header">
        <div className="nav-tabs">
          <div className="nav-tab active">Analytics Insights</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1>Habit Analytics</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Deep-dive statistics and AI insights on your productivity and health logs.
        </p>
      </div>

      {/* Analytics Info Cards */}
      <div className="metrics-row">
        <div className="metric-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-color)" }}>
            <Award size={18} />
            <span className="metric-label">Best Habit</span>
          </div>
          <span className="metric-value" style={{ fontSize: "22px", marginTop: "4px" }}>Python & AI Study</span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>92% weekly adherence</span>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b45309" }}>
            <Zap size={18} />
            <span className="metric-label">Consistency Score</span>
          </div>
          <span className="metric-value" style={{ fontSize: "22px", marginTop: "4px" }}>A- Excellent</span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>+4% better than last month</span>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#107c41" }}>
            <Clock size={18} />
            <span className="metric-label">Optimal Sleep Window</span>
          </div>
          <span className="metric-value" style={{ fontSize: "22px", marginTop: "4px" }}>7h 15m - 8h 05m</span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Yields highest habit completion</span>
        </div>
      </div>

      {/* Correlation & AI Insights */}
      <div className="chart-card">
        <h2>AI-Generated Insights</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          
          <div style={{ display: "flex", gap: "16px", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
            <div style={{ backgroundColor: "var(--badge-green-bg)", color: "var(--badge-green-text)", borderRadius: "50%", padding: "10px", height: "max-content" }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Yoga & Sleep Correlation</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                On days you log a <strong>Yoga Session</strong>, you sleep an average of <strong>28 minutes longer</strong> and wake up feeling refreshed. Keep it up!
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
            <div style={{ backgroundColor: "var(--badge-blue-bg)", color: "var(--badge-blue-text)", borderRadius: "50%", padding: "10px", height: "max-content" }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Python/AI Study Block Timing</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                Your learning hours are <strong>40% higher</strong> on weekends. Adding a small 30-minute block on Wednesday could help you keep concepts fresh during the workweek.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
            <div style={{ backgroundColor: "var(--badge-orange-bg)", color: "var(--badge-orange-text)", borderRadius: "50%", padding: "10px", height: "max-content" }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Step Count Milestone</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                You have met your daily goal of 10,000 steps on 5 out of the last 7 days. This is a 15% increase compared to your performance two weeks ago.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
