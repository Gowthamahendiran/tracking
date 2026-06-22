"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Database, Shield, Sliders, CheckCircle2, AlertCircle, Key } from "lucide-react";

export default function Settings() {
  const [firebaseStatus, setFirebaseStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFirebaseStatus(isFirebaseConfigured);
    setLoading(false);
  }, []);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Configure your personal profile preferences and backend database connections.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Firebase Status Panel */}
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={20} color="var(--primary-color)" />
            <h2>Backend Database Connection</h2>
          </div>

          {loading ? (
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Checking connection status...</p>
          ) : firebaseStatus ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  backgroundColor: "var(--badge-green-bg)", 
                  color: "var(--badge-green-text)", 
                  padding: "10px 16px", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "max-content"
                }}
              >
                <CheckCircle2 size={16} />
                <span>Firebase Connected & Firestore Synced</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Your logs are being written directly to your Firebase firestore collection. Your changes are synchronized across sessions.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  backgroundColor: "var(--badge-orange-bg)", 
                  color: "var(--badge-orange-text)", 
                  padding: "10px 16px", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  width: "max-content"
                }}
              >
                <AlertCircle size={16} />
                <span>Mock Storage Mode Active (Offline)</span>
              </div>
              
              <div style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: "1.6" }}>
                <p style={{ marginBottom: "8px" }}>
                  The app is currently running in local fallback mode. Logs are stored securely in your web browser's <code>localStorage</code>.
                </p>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>
                  To link your Firebase database, configure the environment variables:
                </p>
                
                <div 
                  style={{ 
                    backgroundColor: "var(--bg-sidebar)", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    border: "1px solid var(--border-color)",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div># Fill these in your project's .env.local file:</div>
                  <div>NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key</div>
                  <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id</div>
                  <div>NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id</div>
                </div>
                
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>
                  After adding the variables to <code>.env.local</code>, restart the development server. The project will automatically initialize your firestore database.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Preferences mock panel */}
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sliders size={20} color="var(--primary-color)" />
            <h2>Preferences</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>Weight Units</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Select your preferred unit for tracking weight</div>
              </div>
              <select className="form-select" style={{ width: "100px" }} defaultValue="lbs">
                <option value="lbs">lbs (lbs)</option>
                <option value="kg">kg (kg)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>Weekly Step Goal</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Set your target steps per day</div>
              </div>
              <input type="number" className="form-input" style={{ width: "100px", textAlign: "right" }} defaultValue={10000} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>Notification Reminders</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Receive a daily alert if logs are missing by 9:00 PM</div>
              </div>
              <input type="checkbox" style={{ width: "20px", height: "20px", cursor: "pointer" }} defaultChecked />
            </div>
          </div>
        </div>

        {/* Security / Info */}
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={20} color="var(--primary-color)" />
            <h2>App Information</h2>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            <p><strong>App Version:</strong> 1.0.0</p>
            <p><strong>Privacy:</strong> Your data is stored strictly in your browser local storage or synced to your own secure Firebase instance. We do not store or track any of your personal logs on third-party servers.</p>
          </div>
        </div>

      </div>
    </>
  );
}
