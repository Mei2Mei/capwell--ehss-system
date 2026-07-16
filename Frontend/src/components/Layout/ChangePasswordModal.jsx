import { useState } from "react";
import api from "../../api/axios";
import "./ChangePasswordModal.css";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.current_password || !form.new_password || !form.confirm_password)
      return setError("All fields are required.");
    if (form.new_password !== form.confirm_password)
      return setError("New passwords do not match.");
    if (form.new_password.length < 6)
      return setError("New password must be at least 6 characters.");
    try {
      await api.put("/users/change-password", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password.");
    }
  };

  const copyPassword = () => {
    if (!form.new_password) return;
    navigator.clipboard.writeText(form.new_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="cpw-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="cpw-modal">
        <h2 className="cpw-title">Change Password</h2>

        {success ? (
          <div className="cpw-success">
            ✓ Password changed successfully.
            <button
              className="cpw-btn-primary"
              style={{ marginTop: 16 }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Current Password */}
            <div className="cpw-form-group">
              <label className="cpw-label">Current Password</label>
              <div className="cpw-input-wrap">
                <input
                  className="cpw-input"
                  type={show.current ? "text" : "password"}
                  value={form.current_password}
                  onChange={(e) =>
                    setForm({ ...form, current_password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="cpw-eye-btn"
                  title={show.current ? "Hide password" : "Show password"}
                  onClick={() => setShow({ ...show, current: !show.current })}
                >
                  {show.current ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="cpw-form-group">
              <label className="cpw-label">New Password</label>
              <div className="cpw-input-wrap">
                <input
                  className="cpw-input"
                  type={show.new ? "text" : "password"}
                  value={form.new_password}
                  onChange={(e) =>
                    setForm({ ...form, new_password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="cpw-eye-btn"
                  title={show.new ? "Hide password" : "Show password"}
                  onClick={() => setShow({ ...show, new: !show.new })}
                >
                  {show.new ? "🙈" : "👁️"}
                </button>
                <button
                  type="button"
                  className="cpw-copy-btn"
                  title={copied ? "Copied!" : "Copy new password"}
                  onClick={copyPassword}
                  title="Copy password"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="cpw-form-group">
              <label className="cpw-label">Confirm New Password</label>
              <div className="cpw-input-wrap">
                <input
                  className="cpw-input"
                  type={show.confirm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm({ ...form, confirm_password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="cpw-eye-btn"
                  title={show.confirm ? "Hide password" : "Show password"}
                  onClick={() => setShow({ ...show, confirm: !show.confirm })}
                >
                  {show.confirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div className="cpw-error">{error}</div>}

            <div className="cpw-buttons">
              <button className="cpw-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="cpw-btn-primary" onClick={handleSubmit}>
                Update Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
