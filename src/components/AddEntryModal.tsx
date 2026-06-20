"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { saveEntry, HabitEntry, minutesToSleepString, sleepStringToMinutes } from "@/lib/db";

interface AddEntryModalProps {
  onClose: () => void;
  onSave: () => void;
  existingEntry?: HabitEntry | null;
}

export default function AddEntryModal({ onClose, onSave, existingEntry }: AddEntryModalProps) {
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("74.0");
  const [yoga, setYoga] = useState("20 mins");
  const [runJog, setRunJog] = useState("No Run");
  const [steps, setSteps] = useState("10000");
  const [cardio, setCardio] = useState("---");
  const [pythonAi, setPythonAi] = useState("2.0");
  const [hindi, setHindi] = useState("Duolingo");
  const [sleepHours, setSleepHours] = useState("7");
  const [sleepMins, setSleepMins] = useState("30");

  useEffect(() => {
    if (existingEntry) {
      setDate(existingEntry.date);
      setWeight(existingEntry.weight.toString());
      setYoga(existingEntry.yoga);
      setRunJog(existingEntry.runJog);
      setSteps(existingEntry.steps.toString());
      setCardio(existingEntry.cardio);
      setPythonAi(existingEntry.pythonAi.toString());
      setHindi(existingEntry.hindi);
      
      const totalMins = existingEntry.sleepMinutes;
      setSleepHours(Math.floor(totalMins / 60).toString());
      setSleepMins((totalMins % 60).toString());
    } else {
      // Set to today's date formatted as YYYY-MM-DD
      const today = new Date();
      setDate(today.toISOString().split("T")[0]);
    }
  }, [existingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("Please select a date.");
      return;
    }

    // Determine Day of week from Date
    const parsedDate = new Date(date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[parsedDate.getDay()];

    const totalSleepMinutes = (parseInt(sleepHours, 10) || 0) * 60 + (parseInt(sleepMins, 10) || 0);

    const entry: HabitEntry = {
      id: date,
      date,
      day: dayName,
      weight: parseFloat(weight) || 74.0,
      yoga,
      runJog,
      steps: parseInt(steps, 10) || 0,
      cardio,
      pythonAi: parseFloat(pythonAi) || 0,
      hindi,
      sleepMinutes: totalSleepMinutes,
    };

    await saveEntry(entry);
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{existingEntry ? "Edit Habit Log" : "Add Habit Log"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Row 1: Date & Weight */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  disabled={!!existingEntry}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Yoga & Run/Jog */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Yoga Session</label>
                <select 
                  className="form-select" 
                  value={yoga} 
                  onChange={(e) => setYoga(e.target.value)}
                >
                  <option value="10 mins">10 mins</option>
                  <option value="15 mins">15 mins</option>
                  <option value="20 mins">20 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="Rest Day">Rest Day</option>
                  <option value="Missed">Missed</option>
                  <option value="---">---</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Run / Jog</label>
                <select 
                  className="form-select" 
                  value={runJog} 
                  onChange={(e) => setRunJog(e.target.value)}
                >
                  <option value="No Run">No Run</option>
                  <option value="5km Jog">5km Jog</option>
                  <option value="10km Run">10km Run</option>
                  <option value="Missed">Missed</option>
                  <option value="---">---</option>
                </select>
              </div>
            </div>

            {/* Row 3: Steps & Cardio */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Step Count</label>
                <input
                  type="number"
                  className="form-input"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cardio Activity</label>
                <select 
                  className="form-select" 
                  value={cardio} 
                  onChange={(e) => setCardio(e.target.value)}
                >
                  <option value="---">---</option>
                  <option value="Swim (45m)">Swim (45m)</option>
                  <option value="Swim (30m)">Swim (30m)</option>
                  <option value="Cycling (30m)">Cycling (30m)</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Step">Step</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
            </div>

            {/* Row 4: Learning Hours & Language */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Learning (Python/AI) Hrs</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={pythonAi}
                  onChange={(e) => setPythonAi(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Language Practice</label>
                <select 
                  className="form-select" 
                  value={hindi} 
                  onChange={(e) => setHindi(e.target.value)}
                >
                  <option value="Duolingo">Duolingo</option>
                  <option value="Vocab">Vocab</option>
                  <option value="Missed">Missed</option>
                  <option value="---">---</option>
                </select>
              </div>
            </div>

            {/* Row 5: Sleep hours & mins */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sleep Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  className="form-input"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sleep Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  className="form-input"
                  value={sleepMins}
                  onChange={(e) => setSleepMins(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {existingEntry ? "Save Changes" : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
