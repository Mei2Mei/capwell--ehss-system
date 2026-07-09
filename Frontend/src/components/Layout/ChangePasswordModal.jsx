import { useState } from "react";
import api from "../../api/axios";
import "./ChangePasswordModal.css";

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
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
            <div className="cpw-form-group">
              <label className="cpw-label">Current Password</label>
              <input
                className="cpw-input"
                type="password"
                value={form.current_password}
                onChange={(e) =>
                  setForm({ ...form, current_password: e.target.value })
                }
              />
            </div>
            <div className="cpw-form-group">
              <label className="cpw-label">New Password</label>
              <input
                className="cpw-input"
                type="password"
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
              />
            </div>
            <div className="cpw-form-group">
              <label className="cpw-label">Confirm New Password</label>
              <input
                className="cpw-input"
                type="password"
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
              />
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
