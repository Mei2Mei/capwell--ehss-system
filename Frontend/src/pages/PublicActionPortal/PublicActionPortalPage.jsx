import { useEffect, useState } from "react";
import axios from "axios";
import "./PublicActionPortalPage.css";
import logo from "../../assets/logo.jpg";

const BASE = import.meta.env.VITE_API_URL;

const STATUS_CLASS = {
  Open: "pap-badge open",
  "In Progress": "pap-badge inprogress",
  Closed: "pap-badge closed",
};

const DEPARTMENTS = [
  "HR",
  "Finance",
  "Operations",
  "Safety",
  "Maintenance",
  "IT",
  "Production",
  "Sales",
];

export default function PublicActionPortal() {
  const [actions, setActions] = useState([]);
  const [form, setForm] = useState({
    description: "",
    department: "",
    reporter_name: "",
    reporter_email: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE}/public/actions`)
      .then((r) => setActions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.description) return setError("Please describe the issue.");
    try {
      await axios.post(`${BASE}/public/actions/submit`, form);
      setSubmitted(true);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Submission failed. Please try again.",
      );
    }
  };

  return (
    <div className="pap-page">
      {/* Header */}
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

      <div className="pap-content">
        {/* Submit form */}
        <div className="pap-card">
          <h2 className="pap-card-title">🚩 Report a Safety Issue or Action</h2>
          <p className="pap-card-sub">
            Use this form to report workplace hazards, non-conformances, or
            request corrective action. Your submission is reviewed by the EHSS
            team.
          </p>

          {submitted ? (
            <div className="pap-success">
              ✓ Your report has been submitted successfully. The EHSS team will
              review it shortly.
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

        {/* Open actions */}
        <div className="pap-card">
          <h2 className="pap-card-title">📋 Open Action Items</h2>
          <p className="pap-card-sub">
            Currently tracked open and in-progress actions.
          </p>
          <div className="pap-table-wrap">
            {loading ? (
              <div className="pap-empty">Loading...</div>
            ) : (
              <table className="pap-table">
                <thead>
                  <tr>
                    {[
                      "ID",
                      "Description",
                      "Department",
                      "Assigned To",
                      "Due Date",
                      "Priority",
                      "Status",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actions.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="pap-empty">
                          No open action items at this time.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    actions.map((a) => (
                      <tr key={a.id}>
                        <td>#{a.id}</td>
                        <td className="pap-desc">{a.description}</td>
                        <td>{a.department || "—"}</td>
                        <td>{a.assigned_to || "—"}</td>
                        <td>
                          {a.due_date
                            ? new Date(a.due_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <span
                            className={`pap-priority pap-priority-${(a.priority || "").toLowerCase()}`}
                          >
                            {a.priority || "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={STATUS_CLASS[a.status] || "pap-badge"}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="pap-footer">
        © {new Date().getFullYear()} EHSS Management System
      </div>
    </div>
  );
}
