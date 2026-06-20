"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";

interface ResetPasswordModalProps {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess("Password updated successfully!");
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <h2>Reset Password</h2>
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

            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="password-wrapper">
                <Lock size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="form-input password-input"
                  style={{ paddingLeft: "36px" }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-wrapper">
                <Lock size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Choose new password"
                  className="form-input password-input"
                  style={{ paddingLeft: "36px" }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-wrapper">
                <Lock size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="form-input password-input"
                  style={{ paddingLeft: "36px" }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
