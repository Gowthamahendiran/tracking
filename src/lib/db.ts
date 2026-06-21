export interface HabitEntry {
  id: string; // date string "YYYY-MM-DD"
  date: string; // YYYY-MM-DD
  day: string; // Monday, Tuesday, etc.
  weight: number; // in kg (e.g. 74.2)
  yoga: string; // "20 mins", "Rest Day", "10 mins", "15 mins", "Missed"
  runJog: string; // "No Run", "5km Jog", "10km Run", "Missed"
  steps: number; // step count (e.g. 12402)
  cardio: string; // "Swim (45m)", "---", "Cycling (30m)", "Missed"
  pythonAi: number; // hours (e.g. 2.5, 4.0, 1.0)
  hindi: string; // "Duolingo", "Vocab", "Missed", "---"
  sleepMinutes: number; // e.g. 444 minutes = 7h 24m
}

export interface HabitStats {
  avgSleep: string;
  yogaSessions: string; // e.g. "5/7"
  avgSteps: number;
  learningHours: number;
  streakDays: number;
  longestStreak: number;
  completionRate: number; // %
  totalEntries: number;
}

// Convert sleep minutes to "7h 24m"
export function minutesToSleepString(minutes: number): string {
  if (!minutes || minutes <= 0) return "00h 00m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

// Convert "7h 24m" to minutes
export function sleepStringToMinutes(sleepStr: string): number {
  if (!sleepStr) return 0;
  const match = sleepStr.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    return hours * 60 + mins;
  }
  const hoursOnly = sleepStr.match(/(\d+)\s*h/);
  if (hoursOnly) {
    return parseInt(hoursOnly[1], 10) * 60;
  }
  const minsOnly = sleepStr.match(/(\d+)\s*m/);
  if (minsOnly) {
    return parseInt(minsOnly[1], 10);
  }
  return 0;
}

// Fetch all entries sorted by date descending via Server API Route
export async function getEntries(): Promise<HabitEntry[]> {
  try {
    const res = await fetch("/api/entries");
    if (res.ok) {
      const entries: HabitEntry[] = await res.json();
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    }
  } catch (e) {
    console.error("Failed to get entries via API:", e);
  }
  return [];
}

// Save or edit an entry via Server API Route
export async function saveEntry(entry: HabitEntry): Promise<void> {
  try {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      throw new Error("Failed to save entry");
    }
  } catch (e) {
    console.error("Failed to save entry via API:", e);
    throw e;
  }
}

// Delete an entry via Server API Route
export async function deleteEntry(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/entries?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete entry");
    }
  } catch (e) {
    console.error("Failed to delete entry via API:", e);
    throw e;
  }
}

// Calculate stats based on current entries
export function calculateStats(entries: HabitEntry[]): HabitStats {
  if (entries.length === 0) {
    return {
      avgSleep: "00h 00m",
      yogaSessions: "0/7",
      avgSteps: 0,
      learningHours: 0,
      streakDays: 0,
      longestStreak: 0,
      completionRate: 0,
      totalEntries: 0,
    };
  }

  // Sort ascending to analyze streaks
  const sortedAsc = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const recent7 = entries.slice(0, 7);

  // 1. Avg sleep over recent entries
  const totalSleepMins = recent7.reduce((acc, curr) => acc + curr.sleepMinutes, 0);
  const avgSleepMins = Math.round(totalSleepMins / (recent7.length || 1));
  const avgSleep = minutesToSleepString(avgSleepMins);

  // 2. Yoga sessions (non-missed, non-rest days in last 7 days)
  const activeYoga = recent7.filter(
    (e) => e.yoga !== "Rest Day" && e.yoga !== "Missed" && e.yoga !== "---" && e.yoga.includes("min")
  ).length;
  const yogaSessions = `${activeYoga}/7`;

  // 3. Avg steps in last 7 days
  const totalSteps = recent7.reduce((acc, curr) => acc + curr.steps, 0);
  const avgSteps = Math.round(totalSteps / (recent7.length || 1));

  // 4. Learning hours (Python/AI) in last 7 entries
  const learningHours = parseFloat(
    recent7.reduce((acc, curr) => acc + (curr.pythonAi || 0), 0).toFixed(1)
  );

  // 5. Streaks (consecutive days of recording entries)
  let streakDays = 0;
  let longestStreak = 0;
  if (sortedAsc.length > 0) {
    let currentStreak = 0;
    
    // Find consecutive days ending at the last entry
    let lastDate: Date | null = null;
    
    // Go from right to left to get current streak
    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      const entryDate = new Date(sortedAsc[i].date);
      if (lastDate === null) {
        currentStreak = 1;
        lastDate = entryDate;
      } else {
        const diffTime = Math.abs(lastDate.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
          lastDate = entryDate;
        } else if (diffDays > 1) {
          break;
        }
      }
    }
    streakDays = currentStreak;

    // Calculate longest streak overall
    let tempStreak = 0;
    let prevDate: Date | null = null;
    for (let i = 0; i < sortedAsc.length; i++) {
      const entryDate = new Date(sortedAsc[i].date);
      if (prevDate === null) {
        tempStreak = 1;
        prevDate = entryDate;
      } else {
        const diffTime = Math.abs(entryDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
        prevDate = entryDate;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // 6. Completion Rate
  let totalHabitOpportunities = 0;
  let totalHabitsCompleted = 0;

  entries.forEach((e) => {
    // Yoga
    totalHabitOpportunities++;
    if (e.yoga !== "Rest Day" && e.yoga !== "Missed" && e.yoga !== "---") {
      totalHabitsCompleted++;
    }
    // Run
    totalHabitOpportunities++;
    if (e.runJog !== "No Run" && e.runJog !== "Missed" && e.runJog !== "---") {
      totalHabitsCompleted++;
    }
    // Steps (goal >= 8000 count as complete)
    totalHabitOpportunities++;
    if (e.steps >= 8000) {
      totalHabitsCompleted++;
    }
    // Python/AI
    totalHabitOpportunities++;
    if (e.pythonAi > 0) {
      totalHabitsCompleted++;
    }
    // Hindi
    totalHabitOpportunities++;
    if (e.hindi !== "Missed" && e.hindi !== "---") {
      totalHabitsCompleted++;
    }
    // Sleep (>= 6 hours)
    totalHabitOpportunities++;
    if (e.sleepMinutes >= 360) {
      totalHabitsCompleted++;
    }
  });

  const completionRate = totalHabitOpportunities > 0 
    ? Math.round((totalHabitsCompleted / totalHabitOpportunities) * 100) 
    : 0;

  return {
    avgSleep,
    yogaSessions,
    avgSteps,
    learningHours,
    streakDays,
    longestStreak,
    completionRate,
    totalEntries: entries.length,
  };
}
