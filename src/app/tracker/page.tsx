"use client";

import { useEffect, useState } from "react";
import { calculateStats, HabitEntry, minutesToSleepString } from "@/lib/db";
import { useHabits } from "@/context/HabitContext";
import {
  Bell,
  HelpCircle,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  Download,
  Lock,
  Edit2,
  Trash2,
  TrendingUp,
  Scale,
  Flower2,
  Activity,
  Footprints,
  Heart,
  Code,
  BookOpen,
  Moon,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import StreakChip from "@/components/StreakChip";

// Helper parsers for DB strings to form numbers
const parseYogaMin = (yogaStr: string): number => {
  if (!yogaStr || yogaStr.includes("Rest") || yogaStr.includes("Missed") || yogaStr === "---") return 0;
  const match = yogaStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const parseRunKm = (runStr: string): number => {
  if (!runStr || runStr.includes("No") || runStr.includes("Missed") || runStr === "---") return 0;
  const match = runStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const parseCardio = (cardioStr: string) => {
  if (!cardioStr || cardioStr === "---" || cardioStr.includes("Missed")) {
    return { activity: "---", minutes: 0 };
  }
  // check format "Swim (45m)"
  const match = cardioStr.match(/([a-zA-Z\s]+)\((\d+)m\)/);
  if (match) {
    return { activity: match[1].trim(), minutes: parseInt(match[2], 10) };
  }
  return { activity: cardioStr, minutes: 0 };
};

const parseHindiMin = (hindiStr: string): number => {
  if (!hindiStr || hindiStr === "---" || hindiStr.includes("Missed")) return 0;
  const match = hindiStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function DailyTracker() {
  const { entries, loading, saveHabitEntry } = useHabits();

  // Form States
  const [formDate, setFormDate] = useState("");
  const [weight, setWeight] = useState("0");
  const [meditationMins, setMeditationMins] = useState("0");
  const [runKm, setRunKm] = useState("0");
  const [steps, setSteps] = useState("0");
  const [cardioActivity, setCardioActivity] = useState("---");
  const [cardioMins, setCardioMins] = useState("0");
  const [aiStudyHours, setAiStudyHours] = useState("0");
  const [hindiMins, setHindiMins] = useState("0");
  const [sleepHours, setSleepHours] = useState("0");

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Default form date to today
    const today = new Date().toISOString().split("T")[0];
    setFormDate(today);
  }, []);

  // Fetch / update form fields when Date changes
  useEffect(() => {
    if (!formDate || entries.length === 0) return;

    const existing = entries.find((e) => e.date === formDate);
    if (existing) {
      setWeight(existing.weight.toString());
      setMeditationMins(parseYogaMin(existing.yoga).toString());
      setRunKm(parseRunKm(existing.runJog).toString());
      setSteps(existing.steps.toString());

      const parsedCard = parseCardio(existing.cardio);
      setCardioActivity(parsedCard.activity);
      setCardioMins(parsedCard.minutes.toString());

      setAiStudyHours(existing.pythonAi.toString());
      setHindiMins(parseHindiMin(existing.hindi).toString());

      const hours = Math.round((existing.sleepMinutes / 60) * 10) / 10;
      setSleepHours(hours.toString());
    } else {
      // Set to defaults
      setWeight("0");
      setMeditationMins("0");
      setRunKm("0");
      setSteps("0");
      setCardioActivity("---");
      setCardioMins("0");
      setAiStudyHours("0");
      setHindiMins("0");
      setSleepHours("0");
    }
  }, [formDate, entries]);

  const stats = calculateStats(entries);

  // Handle Form Submission
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate) return;

    const parsedDate = new Date(formDate);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[parsedDate.getDay()];

    const sleepHrsNum = parseFloat(sleepHours) || 0;
    const totalSleepMinutes = Math.round(sleepHrsNum * 60);

    const medNum = parseInt(meditationMins, 10) || 0;
    const yogaStr = medNum > 0 ? `${medNum} mins` : "Rest Day";

    const runNum = parseInt(runKm, 10) || 0;
    const runStr = runNum > 0 ? `${runNum}km Run` : "No Run";

    const cardioNum = parseInt(cardioMins, 10) || 0;
    const cardioStr = cardioActivity !== "---" && cardioNum > 0
      ? `${cardioActivity} (${cardioNum}m)`
      : "---";

    const hindiNum = parseInt(hindiMins, 10) || 0;
    const hindiStr = hindiNum > 0 ? `${hindiNum} mins` : "---";

    const entry: HabitEntry = {
      id: formDate,
      date: formDate,
      day: dayName,
      weight: parseFloat(weight) || 74.0,
      yoga: yogaStr,
      runJog: runStr,
      steps: parseInt(steps, 10) || 0,
      cardio: cardioStr,
      pythonAi: parseFloat(aiStudyHours) || 0,
      hindi: hindiStr,
      sleepMinutes: totalSleepMinutes,
    };

    setIsSaving(true);
    try {
      await saveHabitEntry(entry);
      // Give a tiny artificial delay for premium UX transition
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Save entry failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    setMeditationMins("0");
    setRunKm("0");
    setSteps("10000");
    setCardioActivity("---");
    setCardioMins("0");
    setAiStudyHours("0");
    setHindiMins("0");
    setSleepHours("7.5");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "16px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading Habits Hub...
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>Habit Tracking</h1>
            <StreakChip />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
            Log your daily activities and build better habits
          </p>
        </div>
      </div>

      {/* SECTION 1: LOG YOUR ACTIVITIES CARD */}
      <div className="chart-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>Log Your Activities</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Enter your activities for the current date
            </p>
          </div>

          {/* Dynamic Date Selector */}
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-main)",
              backgroundColor: "var(--bg-sidebar)",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              cursor: "pointer"
            }}
          />
        </div>

        <form onSubmit={handleSaveForm} style={{ marginTop: "10px" }}>
          {/* Row 1: Weight, Meditation, Run/Jog */}
          <div className="log-form-grid">
            <div className="form-group">
              <label className="form-label">Weight</label>
              <div className="input-suffix-wrapper">
                <Scale size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  step="0.1"
                  className="form-input form-input-with-prefix-suffix"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <span className="input-suffix">kg</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Meditation</label>
              <div className="input-suffix-wrapper">
                <Flower2 size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  className="form-input form-input-with-prefix-suffix"
                  value={meditationMins}
                  onChange={(e) => setMeditationMins(e.target.value)}
                  required
                />
                <span className="input-suffix">minutes</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Run / Jog</label>
              <div className="input-suffix-wrapper">
                <Activity size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  step="0.1"
                  className="form-input form-input-with-prefix-suffix"
                  value={runKm}
                  onChange={(e) => setRunKm(e.target.value)}
                  required
                />
                <span className="input-suffix">km</span>
              </div>
            </div>
          </div>

          {/* Row 2: Steps, Activity */}
          <div className="log-form-grid-2">
            <div className="form-group">
              <label className="form-label">Steps</label>
              <div className="input-suffix-wrapper">
                <Footprints size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  className="form-input form-input-with-prefix-suffix"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                />
                <span className="input-suffix">steps</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <Heart size={16} className="input-prefix-icon" />
                  <select
                    className="form-select form-input-with-prefix"
                    value={cardioActivity}
                    onChange={(e) => setCardioActivity(e.target.value)}
                  >
                    <option value="---">---</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Shuttle">Shuttle</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Swim">Swim</option>
                  </select>
                </div>
                <div className="input-suffix-wrapper" style={{ width: "140px" }}>
                  <input
                    type="number"
                    className="form-input form-input-with-suffix"
                    value={cardioMins}
                    onChange={(e) => setCardioMins(e.target.value)}
                    disabled={cardioActivity === "---"}
                  />
                  <span className="input-suffix">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: AI Study, Hindi Study, Sleep */}
          <div className="log-form-grid-3">
            <div className="form-group">
              <label className="form-label">AI Study</label>
              <div className="input-suffix-wrapper">
                <Code size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  step="0.5"
                  className="form-input form-input-with-prefix-suffix"
                  value={aiStudyHours}
                  onChange={(e) => setAiStudyHours(e.target.value)}
                  required
                />
                <span className="input-suffix">hours</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hindi Study</label>
              <div className="input-suffix-wrapper">
                <BookOpen size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  className="form-input form-input-with-prefix-suffix"
                  value={hindiMins}
                  onChange={(e) => setHindiMins(e.target.value)}
                  required
                />
                <span className="input-suffix">minutes</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sleep</label>
              <div className="input-suffix-wrapper">
                <Moon size={16} className="input-prefix-icon" />
                <input
                  type="number"
                  step="0.1"
                  className="form-input form-input-with-prefix-suffix"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  required
                />
                <span className="input-suffix">hours</span>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="form-actions-row">
            <button
              type="button"
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={handleResetForm}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#4f46e5" }}
            >
              {saveSuccess ? <Check size={14} /> : <Check size={14} />}
              <span>{saveSuccess ? "Saved!" : "Save Entry"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading Overlay Spinner */}
      {isSaving && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            padding: "32px 48px",
            borderRadius: "16px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <Loader2 className="animate-spin" style={{ color: "#4f46e5" }} size={40} />
            <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-main)" }}>Saving Entry...</span>
          </div>
        </div>
      )}
    </>
  );
}
