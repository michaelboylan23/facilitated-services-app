import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export function Login() {
  const { loginWithPin, joinSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"staff" | "session">("staff");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [error, setError] = useState("");

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = loginWithPin(name, pin);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed.");
    }
  };

  const handleSessionJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!sessionCode.trim()) {
      setError("Please enter a session code.");
      return;
    }
    const result = joinSession(name, sessionCode);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Failed to join session.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Facilitated Services</h1>
        <p className="login-subtitle">Project Assessment Tool</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "staff" ? "active" : ""}`}
            onClick={() => { setMode("staff"); setError(""); }}
          >
            Staff Login
          </button>
          <button
            className={`login-tab ${mode === "session" ? "active" : ""}`}
            onClick={() => { setMode("session"); setError(""); }}
          >
            Join Session
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        {mode === "staff" ? (
          <form onSubmit={handleStaffLogin} className="login-form">
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label>
              PIN
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Admin or Facilitator PIN"
                autoComplete="off"
              />
            </label>
            <button type="submit" className="btn btn-primary login-btn">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSessionJoin} className="login-form">
            <label>
              Your Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label>
              Session Code
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="6-digit code from facilitator"
                autoComplete="off"
                maxLength={6}
              />
            </label>
            <button type="submit" className="btn btn-primary login-btn">
              Join Assessment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
