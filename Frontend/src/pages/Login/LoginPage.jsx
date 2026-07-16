import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";
import logo from "../../assets/Logo.png";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      login(data.token, data.user);
    } catch (err) {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Left branded panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-logo">🛡️</div>
          <h1 className="login-brand-title">EHSS Management System</h1>
          <p className="login-brand-sub">
            Environmental, Health, Safety &amp; Sustainability
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span className="login-feature-icon">📊</span>
              <div className="login-feature-text">
                <strong>10 Integrated Modules</strong>
                Safety, PPE, Compliance, Sustainability and more
              </div>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">🔒</span>
              <div className="login-feature-text">
                <strong>Role-Based Access</strong>
                Secure access control for all staff levels
              </div>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">📋</span>
              <div className="login-feature-text">
                <strong>Full Audit Trail</strong>
                Every action logged and traceable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="login-right-header">
          <img src={logo} alt="EHSS" className="login-right-logo" />
          <h2 className="login-right-title">Welcome back</h2>
          <p className="login-right-sub">Sign in to your account to continue</p>
        </div>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="login-field">
            <label className="login-label">Email address</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-password-wrap">
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="login-footer">
          © {new Date().getFullYear()} EHSS Management System
        </div>
      </div>
    </div>
  );
}
