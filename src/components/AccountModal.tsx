"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Calendar } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  name: string;
  email: string;
  dob: string;
  avatar: string;
  age: number;
}

interface AccountModalProps {
  onClose: () => void;
  onSave: () => void;
  currentUser: UserProfile;
}

export default function AccountModal({ onClose, onSave, currentUser }: AccountModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("1.png");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setDob(currentUser.dob || "");
      setSelectedAvatar(currentUser.avatar || "1.png");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          dob,
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully!");
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 800);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}
            {success && (
              <div 
                style={{ 
                  backgroundColor: "var(--badge-green-bg)", 
                  color: "var(--badge-green-text)", 
                  padding: "10px 14px", 
                  borderRadius: "8px", 
                  fontSize: "13px", 
                  fontWeight: 600,
                  border: "1px solid rgba(16, 124, 65, 0.15)"
                }}
              >
                {success}
              </div>
            )}

            {/* Avatar Selection Grid */}
            <div className="form-group">
              <label className="form-label">Change Avatar</label>
              <div className="avatar-selector">
                {["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"].map((av) => (
                  <div
                    key={av}
                    className={`avatar-option ${selectedAvatar === av ? "selected" : ""}`}
                    onClick={() => setSelectedAvatar(av)}
                  >
                    <Image
                      src={`/Avatar/${av}`}
                      alt={`Avatar option ${av}`}
                      width={50}
                      height={50}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">Date of Birth (DOB)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Calendar size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
