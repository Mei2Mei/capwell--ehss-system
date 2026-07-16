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
      <div className="login-card">
        <img src={logo} alt="EHSS" className="sidebar-logo-img" />
        <h1 className="login-title">EHSS Management System</h1>
        <p className="login-subtitle">
          Environmental, Health, Safety & Sustainability
        </p>

        <div className="login-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="login-form"
          >
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@capwell.com"
              />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-password-wrap">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
