"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { HabitEntry, getEntries, saveEntry, deleteEntry } from "@/lib/db";

interface HabitContextType {
  entries: HabitEntry[];
  loading: boolean;
  saveHabitEntry: (entry: HabitEntry) => Promise<void>;
  deleteHabitEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (e) {
      console.error("Failed to fetch entries in context provider:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEntries();
  }, []);

  const saveHabitEntry = async (entry: HabitEntry) => {
    await saveEntry(entry);
    await refreshEntries();
  };

  const deleteHabitEntry = async (id: string) => {
    await deleteEntry(id);
    await refreshEntries();
  };

  return (
    <HabitContext.Provider
      value={{
        entries,
        loading,
        saveHabitEntry,
        deleteHabitEntry,
        refreshEntries,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}
