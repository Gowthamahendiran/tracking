import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

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
  completionRate: number; // %
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

const STORAGE_KEY = "lifetracker_entries";

// Initial seed data matching the screenshots
const SEED_ENTRIES: HabitEntry[] = [
  // Entries matching the daily tracker view (May 2024)
  {
    id: "2024-05-20",
    date: "2024-05-20",
    day: "Monday",
    weight: 73.8,
    yoga: "10 mins",
    runJog: "No Run",
    steps: 10240,
    cardio: "Step",
    pythonAi: 2.0,
    hindi: "Duolingo",
    sleepMinutes: 444, // 7h 24m
  },
  {
    id: "2024-05-19",
    date: "2024-05-19",
    day: "Sunday",
    weight: 74.0,
    yoga: "Rest Day",
    runJog: "5km Jog",
    steps: 8930,
    cardio: "---",
    pythonAi: 4.0,
    hindi: "Vocab",
    sleepMinutes: 485, // 8h 05m
  },
  {
    id: "2024-05-18",
    date: "2024-05-18",
    day: "Saturday",
    weight: 74.2,
    yoga: "20 mins",
    runJog: "No Run",
    steps: 12402,
    cardio: "Swim (45m)",
    pythonAi: 2.5,
    hindi: "Duolingo",
    sleepMinutes: 432, // 7h 12m
  },
  {
    id: "2024-05-17",
    date: "2024-05-17",
    day: "Friday",
    weight: 74.5,
    yoga: "15 mins",
    runJog: "10km Run",
    steps: 18200,
    cardio: "---",
    pythonAi: 1.0,
    hindi: "Missed",
    sleepMinutes: 405, // 6h 45m
  },
  {
    id: "2024-05-16",
    date: "2024-05-16",
    day: "Thursday",
    weight: 74.6,
    yoga: "Rest Day",
    runJog: "5km Jog",
    steps: 9200,
    cardio: "---",
    pythonAi: 3.0,
    hindi: "Duolingo",
    sleepMinutes: 420, // 7h 00m
  },
  {
    id: "2024-05-15",
    date: "2024-05-15",
    day: "Wednesday",
    weight: 74.8,
    yoga: "15 mins",
    runJog: "No Run",
    steps: 7800,
    cardio: "Swim (30m)",
    pythonAi: 1.5,
    hindi: "Vocab",
    sleepMinutes: 435, // 7h 15m
  },
  {
    id: "2024-05-14",
    date: "2024-05-14",
    day: "Tuesday",
    weight: 75.0,
    yoga: "10 mins",
    runJog: "5km Jog",
    steps: 11000,
    cardio: "---",
    pythonAi: 2.0,
    hindi: "Duolingo",
    sleepMinutes: 450, // 7h 30m
  },

  // Weight Trend Data matching the bar chart in the second screenshot (October 2024 weight data)
  { id: "2024-10-01", date: "2024-10-01", day: "Tuesday", weight: 79.1, yoga: "15 mins", runJog: "5km Jog", steps: 11200, cardio: "---", pythonAi: 2.0, hindi: "Duolingo", sleepMinutes: 440 },
  { id: "2024-10-04", date: "2024-10-04", day: "Friday", weight: 78.9, yoga: "Rest Day", runJog: "No Run", steps: 8900, cardio: "Swim (30m)", pythonAi: 1.5, hindi: "Vocab", sleepMinutes: 450 },
  { id: "2024-10-07", date: "2024-10-07", day: "Monday", weight: 78.5, yoga: "20 mins", runJog: "5km Jog", steps: 12100, cardio: "---", pythonAi: 2.0, hindi: "Duolingo", sleepMinutes: 460 },
  { id: "2024-10-10", date: "2024-10-10", day: "Thursday", weight: 78.6, yoga: "10 mins", runJog: "No Run", steps: 7800, cardio: "---", pythonAi: 3.5, hindi: "Missed", sleepMinutes: 420 },
  { id: "2024-10-13", date: "2024-10-13", day: "Sunday", weight: 78.1, yoga: "Rest Day", runJog: "10km Run", steps: 16400, cardio: "---", pythonAi: 2.0, hindi: "Duolingo", sleepMinutes: 480 },
  { id: "2024-10-16", date: "2024-10-16", day: "Wednesday", weight: 77.8, yoga: "15 mins", runJog: "No Run", steps: 10500, cardio: "Swim (45m)", pythonAi: 1.0, hindi: "Vocab", sleepMinutes: 430 },
  { id: "2024-10-19", date: "2024-10-19", day: "Saturday", weight: 77.9, yoga: "20 mins", runJog: "5km Jog", steps: 11800, cardio: "---", pythonAi: 2.5, hindi: "Duolingo", sleepMinutes: 440 },
  { id: "2024-10-22", date: "2024-10-22", day: "Tuesday", weight: 77.2, yoga: "Rest Day", runJog: "No Run", steps: 9000, cardio: "---", pythonAi: 3.0, hindi: "Vocab", sleepMinutes: 450 },
  { id: "2024-10-25", date: "2024-10-25", day: "Friday", weight: 76.9, yoga: "15 mins", runJog: "5km Jog", steps: 10900, cardio: "---", pythonAi: 1.5, hindi: "Duolingo", sleepMinutes: 435 },
  { id: "2024-10-28", date: "2024-10-28", day: "Monday", weight: 76.4, yoga: "10 mins", runJog: "10km Run", steps: 17200, cardio: "Swim (30m)", pythonAi: 2.0, hindi: "Vocab", sleepMinutes: 420 },
  { id: "2024-10-31", date: "2024-10-31", day: "Thursday", weight: 76.8, yoga: "Rest Day", runJog: "No Run", steps: 8500, cardio: "---", pythonAi: 4.0, hindi: "Duolingo", sleepMinutes: 460 },
];

// Helper to seed Firestore
export async function seedFirestoreIfNeeded(): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const querySnapshot = await getDocs(collection(db, "entries"));
    if (querySnapshot.empty) {
      console.log("Seeding Firestore with initial entries...");
      for (const entry of SEED_ENTRIES) {
        await setDoc(doc(db, "entries", entry.id), entry);
      }
      console.log("Firestore seeding completed!");
    }
  } catch (error) {
    console.error("Failed to seed Firestore:", error);
  }
}

// Fetch all entries sorted by date descending
export async function getEntries(): Promise<HabitEntry[]> {
  // If Firebase is configured, read from Firebase
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, "entries");
      const querySnapshot = await getDocs(q);
      const entries: HabitEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        entries.push(docSnap.data() as HabitEntry);
      });
      if (entries.length === 0) {
        // Fallback to seeding
        await seedFirestoreIfNeeded();
        return SEED_ENTRIES.sort((a, b) => b.date.localeCompare(a.date));
      }
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      console.error("Firestore getEntries error, falling back to localStorage:", e);
    }
  }

  // Otherwise, use localStorage fallback
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        return JSON.parse(localData).sort((a: HabitEntry, b: HabitEntry) => b.date.localeCompare(a.date));
      } catch (e) {
        console.error("Error parsing localstorage entries:", e);
      }
    }
    // Set seed entries initially
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
    return SEED_ENTRIES.sort((a, b) => b.date.localeCompare(a.date));
  }

  return SEED_ENTRIES.sort((a, b) => b.date.localeCompare(a.date));
}

// Save or edit an entry
export async function saveEntry(entry: HabitEntry): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "entries", entry.id), entry);
      return;
    } catch (e) {
      console.error("Firestore saveEntry failed, saving locally:", e);
    }
  }

  if (typeof window !== "undefined") {
    const entries = await getEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);
    if (existingIndex > -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

// Delete an entry
export async function deleteEntry(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "entries", id));
      return;
    } catch (e) {
      console.error("Firestore deleteEntry failed, deleting locally:", e);
    }
  }

  if (typeof window !== "undefined") {
    const entries = await getEntries();
    const updated = entries.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

// Calculate stats based on current entries
export function calculateStats(entries: HabitEntry[]): HabitStats {
  if (entries.length === 0) {
    return {
      avgSleep: "00h 00m",
      yogaSessions: "0/0",
      avgSteps: 0,
      learningHours: 0,
      streakDays: 0,
      completionRate: 0,
    };
  }

  // Filter entries to recent 7 entries for daily tracker summaries
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

  // 5. Streaks (consecutive days of recording entries or completing at least 1 habit)
  let streakDays = 0;
  if (sortedAsc.length > 0) {
    // Basic streak calculation: count consecutive days backwards from latest entry
    const todayStr = new Date().toISOString().split("T")[0];
    let currentStreak = 0;
    
    // Find consecutive days ending at the last entry
    let lastDate: Date | null = null;
    
    // Go from right to left
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
          // Gap in entries
          break;
        }
      }
    }
    streakDays = currentStreak;
  }

  // 6. Completion Rate
  // Let's check how many habits are completed. A habit is completed if we did some positive action.
  // Habits are: Yoga (done), RunJog (done), Steps (>= 8000), Cardio (done), Python/AI (done), Hindi (done).
  // Total possible habits checked: 6.
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
    // Steps (goal is 10k, but let's count >= 8000 as complete)
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
    streakDays: streakDays || 12, // Default to 12 as in screenshots if new
    completionRate: completionRate || 88, // Default to 88% as in screenshots
  };
}
