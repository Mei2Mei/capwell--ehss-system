// ─────────────────────────────────────────────────────────────
// SafetyPage.jsx — EHS Monthly Safety Metrics
// - Summary cards
// - Monthly data table
// - Auto-calculated TRIFR, LTIFR, Severity rate
// - Add new monthly record form
// - Incident rows highlighted
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { safetyRecords as initialRecords } from "../../data/safetyData";
import "./SafetyPage.css";

// ── Calculations ──────────────────────────────────────────────
// All three use 1,000,000 as multiplier — confirmed by Linda
function calcTRIFR(mti, lti, fatalities, workedHours) {
  if (!workedHours) return 0;
  return ((mti + lti + fatalities) * 1000000) / workedHours;
}
function calcLTIFR(lti, workedHours) {
  if (!workedHours) return 0;
  return (lti * 1000000) / workedHours;
}
function calcSeverity(daysAway, workedHours) {
  if (!workedHours) return 0;
  return (daysAway * 1000000) / workedHours;
}
function calcWorkedHours(staffNumbers) {
  // 48 hours/week × 4 weeks × staff count
  return staffNumbers * 48 * 4;
}
function formatMonth(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
function hasIncident(record) {
  return (
    record.fatalities > 0 ||
    record.medical_treatment_incidents > 0 ||
    record.lost_time_incidents > 0
  );
}

// Empty form template
const emptyForm = {
  period: "",
  staff_numbers: "",
  fatalities: "",
  medical_treatment_incidents: "",
  lost_time_incidents: "",
  days_away_from_work: "",
  hse_training_hours: "",
  first_aid_cases: "",
  near_misses: "",
  accident_investigations: "",
  hse_meetings: "",
  hse_inspections: "",
};

function SafetyPage() {
  const [records, setRecords] = useState(
    initialRecords.map((r) => ({
      ...r,
      trifr: calcTRIFR(
        r.medical_treatment_incidents,
        r.lost_time_incidents,
        r.fatalities,
        r.worked_hours,
      ),
      ltifr: calcLTIFR(r.lost_time_incidents, r.worked_hours),
      severity_rate: calcSeverity(r.days_away_from_work, r.worked_hours),
    })),
  );

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Live calculated preview while filling form ────────────
  const liveWorkedHours = form.staff_numbers
    ? calcWorkedHours(Number(form.staff_numbers))
    : 0;
  const liveTRIFR = calcTRIFR(
    Number(form.medical_treatment_incidents) || 0,
    Number(form.lost_time_incidents) || 0,
    Number(form.fatalities) || 0,
    liveWorkedHours,
  );
  const liveLTIFR = calcLTIFR(
    Number(form.lost_time_incidents) || 0,
    liveWorkedHours,
  );
  const liveSeverity = calcSeverity(
    Number(form.days_away_from_work) || 0,
    liveWorkedHours,
  );

  // ── Summary cards ─────────────────────────────────────────
  const totalIncidents = records.reduce(
    (sum, r) =>
      sum +
      r.medical_treatment_incidents +
      r.lost_time_incidents +
      r.fatalities,
    0,
  );
  const totalTraining = records.reduce(
    (sum, r) => sum + r.hse_training_hours,
    0,
  );
  const totalInspections = records.reduce(
    (sum, r) => sum + r.hse_inspections,
    0,
  );
  const avgTRIFR = records.length
    ? (records.reduce((sum, r) => sum + r.trifr, 0) / records.length).toFixed(2)
    : 0;

  // ── Helpers ───────────────────────────────────────────────
  function showBanner(msg) {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const e = {};
    if (!form.period) e.period = "Please select a month.";
    if (!form.staff_numbers || Number(form.staff_numbers) <= 0)
      e.staff_numbers = "Please enter staff numbers.";
    if (form.lost_time_incidents > 0 && Number(form.days_away_from_work) === 0)
      e.days_away_from_work = "Days away must be greater than 0 when LTI > 0.";
    if (
      Number(form.days_away_from_work) > 0 &&
      Number(form.lost_time_incidents) === 0
    )
      e.days_away_from_work = "Days away must be 0 when LTI = 0.";
    // Check duplicate month
    const dup = records.find((r) => r.period === form.period);
    if (dup) e.period = "A record for this month already exists.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const workedHours = calcWorkedHours(Number(form.staff_numbers));
    const mti = Number(form.medical_treatment_incidents) || 0;
    const lti = Number(form.lost_time_incidents) || 0;
    const fat = Number(form.fatalities) || 0;
    const days = Number(form.days_away_from_work) || 0;

    const newRecord = {
      id: Date.now(),
      period: form.period,
      staff_numbers: Number(form.staff_numbers),
      worked_hours: workedHours,
      fatalities: fat,
      medical_treatment_incidents: mti,
      lost_time_incidents: lti,
      days_away_from_work: days,
      hse_training_hours: Number(form.hse_training_hours) || 0,
      first_aid_cases: Number(form.first_aid_cases) || 0,
      near_misses: Number(form.near_misses) || 0,
      accident_investigations: Number(form.accident_investigations) || 0,
      hse_meetings: Number(form.hse_meetings) || 0,
      hse_inspections: Number(form.hse_inspections) || 0,
      trifr: calcTRIFR(mti, lti, fat, workedHours),
      ltifr: calcLTIFR(lti, workedHours),
      severity_rate: calcSeverity(days, workedHours),
    };

    setRecords(
      [...records, newRecord].sort(
        (a, b) => new Date(a.period) - new Date(b.period),
      ),
    );
    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
    showBanner(
      "Monthly safety record added. TRIFR, LTIFR and Severity rate calculated automatically.",
    );
  }

  return (
    <div className="safety-page">
      {showSuccess && (
        <div className="safety-success-banner">✓ {successMessage}</div>
      )}

      {/* Header */}
      <div className="safety-header">
        <div>
          <h1 className="safety-title">Safety Metrics — 2026</h1>
          <p className="safety-subtitle">
            TRIFR, LTIFR and Severity rate are calculated automatically — never
            entered manually.
          </p>
        </div>
        <button
          className="safety-btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setErrors({});
            setShowModal(true);
          }}
        >
          + Add monthly record
        </button>
      </div>

      {/* Summary cards */}
      <div className="safety-cards">
        <div className="safety-card">
          <div className="safety-card-label">TRIFR average YTD</div>
          <div
            className={`safety-card-value ${Number(avgTRIFR) > 0 ? "amber" : "green"}`}
          >
            {avgTRIFR}
          </div>
        </div>
        <div className="safety-card">
          <div className="safety-card-label">Total incidents YTD</div>
          <div
            className={`safety-card-value ${totalIncidents > 0 ? "red" : "green"}`}
          >
            {totalIncidents}
          </div>
        </div>
        <div className="safety-card">
          <div className="safety-card-label">Training hours YTD</div>
          <div className="safety-card-value">{totalTraining}</div>
        </div>
        <div className="safety-card">
          <div className="safety-card-label">Inspections YTD</div>
          <div className="safety-card-value">{totalInspections}</div>
        </div>
      </div>

      {/* Table */}
      <div className="safety-table-wrap">
        <table className="safety-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Staff</th>
              <th>Hours worked</th>
              <th>Fatalities</th>
              <th>MTI</th>
              <th>LTI</th>
              <th>Days lost</th>
              <th>Training hrs</th>
              <th>First aid</th>
              <th>Near misses</th>
              <th>Investigations</th>
              <th>Meetings</th>
              <th>Inspections</th>
              <th>TRIFR</th>
              <th>LTIFR</th>
              <th>Severity rate</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className={hasIncident(r) ? "row-incident" : ""}>
                <td>
                  <strong>{formatMonth(r.period)}</strong>
                </td>
                <td>{r.staff_numbers}</td>
                <td>{r.worked_hours.toLocaleString()}</td>
                <td>{r.fatalities}</td>
                <td>{r.medical_treatment_incidents}</td>
                <td>{r.lost_time_incidents}</td>
                <td>{r.days_away_from_work}</td>
                <td>{r.hse_training_hours}</td>
                <td>{r.first_aid_cases}</td>
                <td>{r.near_misses}</td>
                <td>{r.accident_investigations}</td>
                <td>{r.hse_meetings}</td>
                <td>{r.hse_inspections}</td>
                <td className={r.trifr > 0 ? "calc-alert" : "calc-ok"}>
                  {r.trifr.toFixed(2)}
                </td>
                <td className={r.ltifr > 0 ? "calc-alert" : "calc-ok"}>
                  {r.ltifr.toFixed(2)}
                </td>
                <td className={r.severity_rate > 0 ? "calc-alert" : "calc-ok"}>
                  {r.severity_rate.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="safety-legend">
        <span style={{ color: "#888" }}>
          💡 Rows highlighted in amber indicate months with recorded incidents
        </span>
        <span style={{ color: "#888", marginLeft: "16px" }}>
          MTI = Medical Treatment Incident · LTI = Lost Time Incident · TRIFR /
          LTIFR / Severity rate use multiplier of 1,000,000
        </span>
      </div>

      {/* Add record modal */}
      {showModal && (
        <div className="safety-modal-overlay">
          <div className="safety-modal">
            <h2 className="safety-modal-title">Add monthly safety record</h2>

            {/* Live calculated preview */}
            {form.staff_numbers && (
              <div className="safety-calc-preview">
                <span>
                  Worked hours:{" "}
                  <strong>{liveWorkedHours.toLocaleString()}</strong>
                </span>
                <span>
                  TRIFR:{" "}
                  <strong className={liveTRIFR > 0 ? "calc-alert" : ""}>
                    {liveTRIFR.toFixed(2)}
                  </strong>
                </span>
                <span>
                  LTIFR:{" "}
                  <strong className={liveLTIFR > 0 ? "calc-alert" : ""}>
                    {liveLTIFR.toFixed(2)}
                  </strong>
                </span>
                <span>
                  Severity:{" "}
                  <strong className={liveSeverity > 0 ? "calc-alert" : ""}>
                    {liveSeverity.toFixed(2)}
                  </strong>
                </span>
              </div>
            )}

            <div className="safety-form-grid">
              <div className="safety-form-group">
                <label className="safety-form-label">
                  Month <span className="required">*</span>
                </label>
                <input
                  className="safety-form-input"
                  type="month"
                  name="period"
                  value={form.period ? form.period.substring(0, 7) : ""}
                  onChange={(e) =>
                    setForm({ ...form, period: e.target.value + "-01" })
                  }
                />
                {errors.period && (
                  <div className="safety-field-error">{errors.period}</div>
                )}
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">
                  Staff numbers <span className="required">*</span>
                </label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="staff_numbers"
                  value={form.staff_numbers}
                  onChange={handleFormChange}
                  placeholder="e.g. 569"
                  min="0"
                />
                {errors.staff_numbers && (
                  <div className="safety-field-error">
                    {errors.staff_numbers}
                  </div>
                )}
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">Worked hours</label>
                <div className="safety-form-readonly">
                  {liveWorkedHours
                    ? liveWorkedHours.toLocaleString()
                    : "Auto-calculated from staff numbers"}
                </div>
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">Fatalities</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="fatalities"
                  value={form.fatalities}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">
                  Medical treatment incidents (MTI)
                </label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="medical_treatment_incidents"
                  value={form.medical_treatment_incidents}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">
                  Lost time incidents (LTI)
                </label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="lost_time_incidents"
                  value={form.lost_time_incidents}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">Days away from work</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="days_away_from_work"
                  value={form.days_away_from_work}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
                {errors.days_away_from_work && (
                  <div className="safety-field-error">
                    {errors.days_away_from_work}
                  </div>
                )}
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">HSE training hours</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="hse_training_hours"
                  value={form.hse_training_hours}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">First aid cases</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="first_aid_cases"
                  value={form.first_aid_cases}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">Near misses</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="near_misses"
                  value={form.near_misses}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">
                  Accident investigations
                </label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="accident_investigations"
                  value={form.accident_investigations}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">HSE meetings</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="hse_meetings"
                  value={form.hse_meetings}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">HSE inspections</label>
                <input
                  className="safety-form-input"
                  type="number"
                  name="hse_inspections"
                  value={form.hse_inspections}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">TRIFR</label>
                <div className="safety-form-readonly calc">
                  {liveTRIFR.toFixed(2)} — auto-calculated
                </div>
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">LTIFR</label>
                <div className="safety-form-readonly calc">
                  {liveLTIFR.toFixed(2)} — auto-calculated
                </div>
              </div>

              <div className="safety-form-group">
                <label className="safety-form-label">Severity rate</label>
                <div className="safety-form-readonly calc">
                  {liveSeverity.toFixed(2)} — auto-calculated
                </div>
              </div>
            </div>

            <div className="safety-modal-buttons">
              <button
                className="safety-btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
              <button className="safety-btn-primary" onClick={handleSave}>
                Save record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SafetyPage;
