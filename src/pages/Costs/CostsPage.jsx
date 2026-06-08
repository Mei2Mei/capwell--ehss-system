// ─────────────────────────────────────────────────────────────
// CostsPage.jsx — Departmental Costs Module
// - Summary cards
// - Year and cost type filters
// - Searchable sortable table
// - Add new cost record form
// - PO number uniqueness validation
// - Year on year comparison
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { costRecords as initialRecords } from "../../data/costsData";
import "./CostsPage.css";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatKES(amount) {
  return `KES ${Number(amount).toLocaleString()}`;
}

function friendlyCostType(type) {
  switch (type) {
    case "statutory_requirement":
      return "Statutory requirement";
    case "staff_welfare":
      return "Staff welfare";
    case "ppe_provision":
      return "PPE provision";
    case "waste_management":
      return "Waste management";
    case "training":
      return "Training";
    case "improvement_initiative":
      return "Improvement initiative";
    default:
      return type;
  }
}

function getCostTypeBadgeClass(type) {
  switch (type) {
    case "statutory_requirement":
      return "badge-statutory";
    case "staff_welfare":
      return "badge-welfare";
    case "improvement_initiative":
      return "badge-improvement";
    default:
      return "badge-other";
  }
}

const emptyForm = {
  item_description: "",
  date: "",
  po_number: "",
  cost_excl_vat: "",
  cost_type: "",
  refundable: "non_refundable",
  budget_status: "in_budget",
};

function CostsPage() {
  const [records, setRecords] = useState(initialRecords);
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Filtered records ──────────────────────────────────────
  const filtered = records
    .filter((r) => yearFilter === "all" || r.year === Number(yearFilter))
    .filter((r) => typeFilter === "all" || r.cost_type === typeFilter)
    .filter((r) => budgetFilter === "all" || r.budget_status === budgetFilter)
    .filter(
      (r) =>
        r.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.po_number.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // ── Summary calculations ──────────────────────────────────
  const totalYTD = filtered.reduce((sum, r) => sum + r.cost_excl_vat, 0);
  const statutoryTotal = filtered
    .filter((r) => r.cost_type === "statutory_requirement")
    .reduce((sum, r) => sum + r.cost_excl_vat, 0);
  const welfareTotal = filtered
    .filter((r) => r.cost_type === "staff_welfare")
    .reduce((sum, r) => sum + r.cost_excl_vat, 0);
  const outsideBudget = filtered
    .filter((r) => r.budget_status === "outside_budget")
    .reduce((sum, r) => sum + r.cost_excl_vat, 0);

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
    if (!form.item_description.trim())
      e.item_description = "Item description is required.";
    if (!form.date) e.date = "Date is required.";
    if (!form.po_number.trim()) e.po_number = "PO number is required.";
    if (!form.cost_excl_vat || Number(form.cost_excl_vat) <= 0)
      e.cost_excl_vat = "Cost must be a positive number.";
    if (!form.cost_type) e.cost_type = "Please select a cost type.";
    // PO number uniqueness check
    const dup = records.find(
      (r) => r.po_number.toLowerCase() === form.po_number.toLowerCase(),
    );
    if (dup)
      e.po_number = "This PO number already exists. PO numbers must be unique.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const newRecord = {
      id: Date.now(),
      year: new Date(form.date).getFullYear(),
      item_description: form.item_description.trim(),
      date: form.date,
      po_number: form.po_number.trim().toUpperCase(),
      cost_excl_vat: Number(form.cost_excl_vat),
      cost_type: form.cost_type,
      refundable: form.refundable,
      budget_status: form.budget_status,
    };
    setRecords(
      [...records, newRecord].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      ),
    );
    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
    showBanner(
      `Cost record "${newRecord.item_description}" added. PO: ${newRecord.po_number}`,
    );
  }

  return (
    <div className="costs-page">
      {showSuccess && (
        <div className="costs-success-banner">✓ {successMessage}</div>
      )}

      {/* Header */}
      <div className="costs-header">
        <div>
          <h1 className="costs-title">Departmental costs</h1>
          <p className="costs-subtitle">
            All amounts in Kenya Shillings, excluding VAT.
          </p>
        </div>
        <button
          className="costs-btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setErrors({});
            setShowModal(true);
          }}
        >
          + Add cost record
        </button>
      </div>

      {/* Summary cards */}
      <div className="costs-cards">
        <div className="costs-card">
          <div className="costs-card-label">Total spend (filtered)</div>
          <div className="costs-card-value">{formatKES(totalYTD)}</div>
        </div>
        <div className="costs-card">
          <div className="costs-card-label">Statutory requirements</div>
          <div className="costs-card-value">{formatKES(statutoryTotal)}</div>
        </div>
        <div className="costs-card">
          <div className="costs-card-label">Staff welfare</div>
          <div className="costs-card-value">{formatKES(welfareTotal)}</div>
        </div>
        <div className={`costs-card ${outsideBudget > 0 ? "card-warn" : ""}`}>
          <div className="costs-card-label">Outside budget</div>
          <div
            className={`costs-card-value ${outsideBudget > 0 ? "red" : "green"}`}
          >
            {formatKES(outsideBudget)}
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="costs-filter-row">
        <select
          className="costs-select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="all">All years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
        <select
          className="costs-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All cost types</option>
          <option value="statutory_requirement">Statutory requirement</option>
          <option value="staff_welfare">Staff welfare</option>
          <option value="ppe_provision">PPE provision</option>
          <option value="waste_management">Waste management</option>
          <option value="training">Training</option>
          <option value="improvement_initiative">Improvement initiative</option>
        </select>
        <select
          className="costs-select"
          value={budgetFilter}
          onChange={(e) => setBudgetFilter(e.target.value)}
        >
          <option value="all">All budget status</option>
          <option value="in_budget">In budget</option>
          <option value="outside_budget">Outside budget</option>
        </select>
        <input
          className="costs-search"
          type="text"
          placeholder="Search by item or PO number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="costs-table-wrap">
        <table className="costs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Item description</th>
              <th>PO number</th>
              <th>Cost (KES excl. VAT)</th>
              <th>Cost type</th>
              <th>Refundable</th>
              <th>Budget status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#888",
                    fontStyle: "italic",
                  }}
                >
                  No records match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={
                    r.budget_status === "outside_budget"
                      ? "row-outside-budget"
                      : i % 2 === 0
                        ? "row-even"
                        : ""
                  }
                >
                  <td>{i + 1}</td>
                  <td>{formatDate(r.date)}</td>
                  <td className="costs-item-desc">{r.item_description}</td>
                  <td className="costs-po">{r.po_number}</td>
                  <td className="costs-amount">{formatKES(r.cost_excl_vat)}</td>
                  <td>
                    <span
                      className={`costs-badge ${getCostTypeBadgeClass(r.cost_type)}`}
                    >
                      {friendlyCostType(r.cost_type)}
                    </span>
                  </td>
                  <td>
                    {r.refundable === "refundable"
                      ? "Refundable"
                      : "Non-refundable"}
                  </td>
                  <td>
                    <span
                      className={`costs-badge ${r.budget_status === "in_budget" ? "badge-inbudget" : "badge-outbudget"}`}
                    >
                      {r.budget_status === "in_budget"
                        ? "In budget"
                        : "Outside budget"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      <div className="costs-total-row">
        <span>Showing {filtered.length} records</span>
        <span>
          Total: <strong>{formatKES(totalYTD)}</strong>
        </span>
      </div>

      {/* Add record modal */}
      {showModal && (
        <div className="costs-modal-overlay">
          <div className="costs-modal">
            <h2 className="costs-modal-title">Add cost record</h2>

            <div className="costs-form-grid">
              <div className="costs-form-group full">
                <label className="costs-form-label">
                  Item description <span className="required">*</span>
                </label>
                <input
                  className="costs-form-input"
                  type="text"
                  name="item_description"
                  value={form.item_description}
                  onChange={handleFormChange}
                  placeholder="e.g. Disposal of hazardous waste"
                />
                {errors.item_description && (
                  <div className="costs-field-error">
                    {errors.item_description}
                  </div>
                )}
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">
                  Date <span className="required">*</span>
                </label>
                <input
                  className="costs-form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                />
                {errors.date && (
                  <div className="costs-field-error">{errors.date}</div>
                )}
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">
                  PO number <span className="required">*</span>
                </label>
                <input
                  className="costs-form-input"
                  type="text"
                  name="po_number"
                  value={form.po_number}
                  onChange={handleFormChange}
                  placeholder="e.g. PO19364"
                />
                {errors.po_number && (
                  <div className="costs-field-error">{errors.po_number}</div>
                )}
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">
                  Cost excl. VAT (KES) <span className="required">*</span>
                </label>
                <input
                  className="costs-form-input"
                  type="number"
                  name="cost_excl_vat"
                  value={form.cost_excl_vat}
                  onChange={handleFormChange}
                  placeholder="e.g. 125000"
                  min="0"
                />
                {errors.cost_excl_vat && (
                  <div className="costs-field-error">
                    {errors.cost_excl_vat}
                  </div>
                )}
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">
                  Cost type <span className="required">*</span>
                </label>
                <select
                  className="costs-form-select"
                  name="cost_type"
                  value={form.cost_type}
                  onChange={handleFormChange}
                >
                  <option value="">Select type...</option>
                  <option value="statutory_requirement">
                    Statutory requirement
                  </option>
                  <option value="staff_welfare">Staff welfare</option>
                  <option value="ppe_provision">PPE provision</option>
                  <option value="waste_management">Waste management</option>
                  <option value="training">Training</option>
                  <option value="improvement_initiative">
                    Improvement initiative
                  </option>
                </select>
                {errors.cost_type && (
                  <div className="costs-field-error">{errors.cost_type}</div>
                )}
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">Refundable</label>
                <select
                  className="costs-form-select"
                  name="refundable"
                  value={form.refundable}
                  onChange={handleFormChange}
                >
                  <option value="non_refundable">Non-refundable</option>
                  <option value="refundable">Refundable</option>
                </select>
              </div>

              <div className="costs-form-group">
                <label className="costs-form-label">Budget status</label>
                <select
                  className="costs-form-select"
                  name="budget_status"
                  value={form.budget_status}
                  onChange={handleFormChange}
                >
                  <option value="in_budget">In budget</option>
                  <option value="outside_budget">Outside budget</option>
                </select>
              </div>
            </div>

            <div className="costs-modal-buttons">
              <button
                className="costs-btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
              <button className="costs-btn-primary" onClick={handleSave}>
                Save record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostsPage;
