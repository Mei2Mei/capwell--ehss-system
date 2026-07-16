import { useState } from "react";
import axios from "axios";
import "./PublicActionPortalPage.css";
import logo from "../../assets/Logo.png";

const BASE = import.meta.env.VITE_API_URL;

const DEPARTMENTS = [
  "HR",
  "Finance",
  "Operations",
  "Safety",
  "Maintenance",
  "IT",
  "Production",
  "Sales",
  "Engineering",
  "QA",
];

export default function PublicActionPortal() {
  const [form, setForm] = useState({
    description: "",
    department: "",
    reporter_name: "",
    reporter_email: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState(null);
  const [error, setError] = useState("");

  // Check status
  const [refInput, setRefInput] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.description) return setError("Please describe the issue.");
    try {
      const res = await axios.post(`${BASE}/public/actions/submit`, form);
      setReferenceId(res.data.id);
      setSubmitted(true);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Submission failed. Please try again.",
      );
    }
  };

  const handleCheckStatus = async () => {
    if (!refInput.trim())
      return setStatusError("Please enter a reference number.");
    setStatusLoading(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const res = await axios.get(
        `${BASE}/public/actions/status/${refInput.trim()}`,
      );
      setStatusResult(res.data);
    } catch (err) {
      setStatusError("No submission found with that reference number.");
    } finally {
      setStatusLoading(false);
    }
  };

  const STATUS_COLOR = {
    Pending: { bg: "#f3f4f6", color: "#6b7280" },
    Open: { bg: "#fef9e7", color: "#e67e22" },
    "In Progress": { bg: "#eaf2fb", color: "#1a5276" },
    Completed: { bg: "#eafaf1", color: "#27ae60" },
    Closed: { bg: "#eafaf1", color: "#27ae60" },
  };

  return (
    <div className="pap-page">
      {/* Topbar */}
      <div className="pap-topbar">
        <div className="pap-logo-area">
          <img src={logo} alt="EHSS" className="pap-logo-img" />
          <div>
            <div className="pap-logo-title">EHSS Management System</div>
            <div className="pap-logo-sub">
              Environmental, Health, Safety & Sustainability
            </div>
          </div>
        </div>
        <div className="pap-portal-label">Public Action Tracker Portal</div>
      </div>

      {/* Hero */}
      <div className="pap-hero">
        <h1 className="pap-hero-title">Safety Issue Reporting Portal</h1>
        <p className="pap-hero-sub">
          Report workplace hazards, non-conformances, or request corrective
          action
        </p>
      </div>

      <div className="pap-content">
        {/* Info strip */}
        <div
          style={{
            display: "flex",
            gap: 20,
            margin: "0 0 4px 0",
            padding: "14px 20px",
            background: "linear-gradient(135deg, #eaf2fb, #e8f8f5)",
            borderRadius: 10,
            border: "1px solid #d4e6f1",
          }}
        >
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a5276" }}>
              24/7
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>Available</div>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#27ae60" }}>
              Anonymous
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              Submissions accepted
            </div>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a5276" }}>
              EHSS
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>
              Team reviews all reports
            </div>
          </div>
        </div>

        {/* Submit form */}
        <div className="pap-card">
          <h2 className="pap-card-title">🚩 Report a Safety Issue or Action</h2>
          <p className="pap-card-sub">
            Use this form to report workplace hazards, non-conformances, or
            request corrective action. Your submission is reviewed by the EHSS
            team.
          </p>

          {submitted ? (
            <div className="pap-success-wrap">
              <div className="pap-success">
                <span style={{ fontSize: 28 }}>✅</span>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}
                  >
                    Report submitted successfully!
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>
                    The EHSS team will review your report shortly.
                  </div>
                </div>
              </div>

              {referenceId && (
                <div className="pap-reference">
                  <div className="pap-reference-label">
                    Your Reference Number
                  </div>
                  <div className="pap-reference-number">#{referenceId}</div>
                  <div className="pap-reference-hint">
                    Save this number. Use it below to check the status of your
                    report at any time.
                  </div>
                </div>
              )}

              <button
                className="pap-btn-submit"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    description: "",
                    department: "",
                    reporter_name: "",
                    reporter_email: "",
                  });
                  setReferenceId(null);
                }}
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <>
              <div className="pap-form-group">
                <label className="pap-form-label">
                  Issue Description <span className="pap-required">*</span>
                </label>
                <textarea
                  className="pap-textarea"
                  placeholder="Describe the safety issue, hazard, or action required..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="pap-form-grid">
                <div className="pap-form-group">
                  <label className="pap-form-label">Department</label>
                  <select
                    className="pap-form-input"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option value="">— Select (optional) —</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="pap-form-group">
                  <label className="pap-form-label">Your Name</label>
                  <input
                    className="pap-form-input"
                    placeholder="Optional"
                    value={form.reporter_name}
                    onChange={(e) =>
                      setForm({ ...form, reporter_name: e.target.value })
                    }
                  />
                </div>
                <div className="pap-form-group">
                  <label className="pap-form-label">Your Email</label>
                  <input
                    className="pap-form-input"
                    type="email"
                    placeholder="Optional"
                    value={form.reporter_email}
                    onChange={(e) =>
                      setForm({ ...form, reporter_email: e.target.value })
                    }
                  />
                </div>
              </div>
              {error && <div className="pap-error">{error}</div>}
              <button className="pap-btn-submit" onClick={handleSubmit}>
                Submit Report
              </button>
            </>
          )}
        </div>

        {/* Check status */}
        <div className="pap-card">
          <h2 className="pap-card-title">🔍 Check Your Submission Status</h2>
          <p className="pap-card-sub">
            Enter the reference number you received after submitting your
            report.
          </p>

          <div className="pap-status-row">
            <input
              className="pap-form-input"
              placeholder="e.g. 27"
              value={refInput}
              onChange={(e) =>
                setRefInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              style={{ flex: 1 }}
            />
            <button
              className="pap-btn-submit"
              onClick={handleCheckStatus}
              disabled={statusLoading}
            >
              {statusLoading ? "Checking..." : "Check Status"}
            </button>
          </div>

          {statusError && (
            <div className="pap-error" style={{ marginTop: 12 }}>
              {statusError}
            </div>
          )}

          {statusResult && (
            <div className="pap-status-result">
              <div className="pap-status-ref">Reference #{statusResult.id}</div>
              <div className="pap-status-concern">{statusResult.concern}</div>
              <div className="pap-status-row-info">
                <div>
                  <span className="pap-status-meta-label">Department</span>
                  <span className="pap-status-meta-value">
                    {statusResult.department || "—"}
                  </span>
                </div>
                <div>
                  <span className="pap-status-meta-label">Date Raised</span>
                  <span className="pap-status-meta-value">
                    {statusResult.date_raised
                      ? new Date(statusResult.date_raised).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="pap-status-meta-label">Assigned To</span>
                  <span className="pap-status-meta-value">
                    {statusResult.responsible || "Pending"}
                  </span>
                </div>
                <div>
                  <span className="pap-status-meta-label">Target Date</span>
                  <span className="pap-status-meta-value">
                    {statusResult.target_date
                      ? new Date(statusResult.target_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="pap-status-meta-label">Status</span>
                  <span
                    className="pap-status-badge"
                    style={{
                      background:
                        STATUS_COLOR[statusResult.status]?.bg || "#f3f4f6",
                      color: STATUS_COLOR[statusResult.status]?.color || "#333",
                    }}
                  >
                    {statusResult.status}
                  </span>
                </div>
              </div>
              {statusResult.action && (
                <div className="pap-status-action">
                  <span className="pap-status-meta-label">
                    Action being taken
                  </span>
                  <span>{statusResult.action}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pap-footer">
        © {new Date().getFullYear()} EHSS Management System
      </div>
    </div>
  );
}
