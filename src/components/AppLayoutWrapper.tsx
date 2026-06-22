"use client";

import { useHabits } from "@/context/HabitContext";
import Sidebar from "./Sidebar";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useHabits();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner-outer"></div>
        </div>
        <p className="loading-text">Loading data</p>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
