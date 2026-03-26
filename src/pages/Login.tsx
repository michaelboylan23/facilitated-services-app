import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export function Login() {
  const { loginWithMicrosoft, loginWithPin, joinSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"staff" | "session">("staff");
  const [showPinFallback, setShowPinFallback] = useState(false);
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
        <img src="/MBP_logo_navy.png" alt="MBP" className="login-logo" />
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
          <div className="login-form">
            {/* Primary: Microsoft sign-in */}
            <button onClick={loginWithMicrosoft} className="btn btn-microsoft login-btn">
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            {/* Fallback: PIN login (for local dev or non-Microsoft users) */}
            {showPinFallback ? (
              <form onSubmit={handleStaffLogin}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
                    Sign In with PIN
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPinFallback(true)}
                className="btn btn-secondary login-btn"
              >
                Sign in with PIN
              </button>
            )}
          </div>
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
