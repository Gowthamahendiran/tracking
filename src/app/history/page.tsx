"use client";

import { useEffect, useState } from "react";
import { HabitEntry } from "@/lib/db";
import { Calendar, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useHabits } from "@/context/HabitContext";

export default function History() {
  const { entries, loading } = useHabits();

  // Group by month
  const getGroupedByMonth = () => {
    const groups: { [key: string]: HabitEntry[] } = {};
    entries.forEach((e) => {
      const date = new Date(e.date);
      const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(e);
    });
    return Object.entries(groups);
  };

  const grouped = getGroupedByMonth();

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1>Log History</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Browse your archived habit sheets and metrics by month.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading archive logs...
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No logged entries in history yet.
          </div>
        ) : (
          grouped.map(([month, monthEntries]) => {
            // Count average weight and total steps in month
            const avgWeight = Math.round((monthEntries.reduce((acc, curr) => acc + curr.weight, 0) / monthEntries.length) * 10) / 10;
            const totalSteps = monthEntries.reduce((acc, curr) => acc + curr.steps, 0);

            return (
              <div 
                key={month}
                className="history-month-card"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ backgroundColor: "var(--bg-sidebar)", padding: "12px", borderRadius: "8px", color: "var(--primary-color)" }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{month}</h3>
                    <div 
                      className="history-month-meta"
                      style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}
                    >
                      <span>{monthEntries.length} logged entries</span>
                      <span>•</span>
                      <span>Avg. weight: {avgWeight} kg</span>
                      <span>•</span>
                      <span>Steps logged: {totalSteps.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link href="/tracker" style={{ textDecoration: "none" }}>
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      fontSize: "13px", 
                      fontWeight: 600, 
                      color: "var(--primary-color)",
                      cursor: "pointer"
                    }}
                  >
                    <span>View sheet</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
