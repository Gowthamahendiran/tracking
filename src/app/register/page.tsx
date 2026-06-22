"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User, Calendar } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("1.png");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, email, password, avatar: selectedAvatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      // Registration success, redirect to dashboard.
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <div className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Get started with SPOWER today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Avatar Selector */}
          <div className="form-group">
            <label className="form-label">Select Avatar</label>
            <div className="avatar-selector">
              {["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"].map((av) => (
                <div
                  key={av}
                  className={`avatar-option ${selectedAvatar === av ? "selected" : ""}`}
                  onClick={() => setSelectedAvatar(av)}
                >
                  <Image
                    src={`/Avatar/${av}`}
                    alt={`Avatar ${av}`}
                    width={50}
                    height={50}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
              <input
                type="text"
                placeholder="E.g. John Doe"
                className="form-input"
                style={{ paddingLeft: "36px" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
              <input
                type="email"
                placeholder="E.g. johndoe@email.com"
                className="form-input"
                style={{ paddingLeft: "36px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Create Password</label>
            <div className="password-wrapper">
              <Lock size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Choose a strong password"
                className="form-input password-input"
                style={{ paddingLeft: "36px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-wrapper">
              <Lock size={16} style={{ position: "absolute", left: "12px", color: "var(--text-light)" }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className="form-input password-input"
                style={{ paddingLeft: "36px" }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }} disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link href="/login" className="auth-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
