"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { HabitEntry, getEntries, saveEntry, deleteEntry } from "@/lib/db";

export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  avatar: string;
  age: number;
}

interface HabitContextType {
  entries: HabitEntry[];
  loading: boolean;
  user: UserProfile | null;
  saveHabitEntry: (entry: HabitEntry) => Promise<void>;
  deleteHabitEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (e) {
      console.error("Failed to fetch entries in context provider:", e);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to fetch user in context provider:", e);
      setUser(null);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await Promise.allSettled([
          refreshEntries(),
          refreshUser()
        ]);
      } catch (e) {
        console.error("Error initializing app data:", e);
      } finally {
        setLoading(false);
      }
    };
    initData();
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
        user,
        saveHabitEntry,
        deleteHabitEntry,
        refreshEntries,
        refreshUser,
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
