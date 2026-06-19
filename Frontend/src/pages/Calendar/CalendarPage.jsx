// ─────────────────────────────────────────────────────────────
// CalendarPage.jsx — EHSS Calendar Module
// - Status tabs and filters
// - Overdue detection
// - Add and edit activities
// - Inline status update
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import "./CalendarPage.css";

const API_URL = "http://localhost:5000/api/calendar";

// ── Helpers ───────────────────────────────────────────────────
function formatMonth(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function isOverdue(activity) {
  if (activity.status !== "scheduled") return false;
  const today = new Date();
  const scheduled = new Date(activity.scheduled_month);
  return scheduled < new Date(today.getFullYear(), today.getMonth(), 1);
}

function friendlyCategory(cat) {
  switch (cat) {
    case "statutory_requirement":
      return "Statutory";
    case "industry_best_practice":
      return "Best practice";
    case "behaviour_based_safety":
      return "Behaviour Based Safety";
    default:
      return cat;
  }
}

function getCategoryClass(cat) {
  switch (cat) {
    case "statutory_requirement":
      return "badge-statutory";
    case "industry_best_practice":
      return "badge-practice";
    case "behaviour_based_safety":
      return "badge-bbs";
    default:
      return "badge-other";
  }
}

function getStatusClass(status, overdue) {
  if (overdue) return "badge-overdue";
  if (status === "completed") return "badge-completed";
  if (status === "not_conducted") return "badge-notconducted";
  if (status === "rescheduled") return "badge-rescheduled";
  return "badge-scheduled";
}

function getStatusText(status, overdue) {
  if (overdue) return "Overdue";
  switch (status) {
    case "completed":
      return "Completed";
    case "not_conducted":
      return "Not conducted";
    case "rescheduled":
      return "Rescheduled";
    default:
      return "Scheduled";
  }
}

const emptyForm = {
  activity_name: "",
  category: "",
  target_audience: "",
  internal_external: "internal",
  scheduled_month: "",
  status: "scheduled",
  notes: "",
};

function CalendarPage() {
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) =>
        setActivities(
          data.map((a) => ({
            ...a,
            scheduled_month: a.scheduled_month?.split("T")[0],
          })),
        ),
      )
      .catch((err) =>
        console.error("Failed to fetch calendar activities:", err),
      );
  }, []);

  // ── Counts for tabs ───────────────────────────────────────
  const counts = {
    all: activities.length,
    scheduled: activities.filter(
      (a) => a.status === "scheduled" && !isOverdue(a),
    ).length,
    overdue: activities.filter((a) => isOverdue(a)).length,
    completed: activities.filter((a) => a.status === "completed").length,
    not_conducted: activities.filter((a) => a.status === "not_conducted")
      .length,
    rescheduled: activities.filter((a) => a.status === "rescheduled").length,
  };

  // ── Filtered list ─────────────────────────────────────────
  const filtered = activities
    .filter((a) => {
      if (activeTab === "overdue") return isOverdue(a);
      if (activeTab === "scheduled")
        return a.status === "scheduled" && !isOverdue(a);
      if (activeTab === "all") return true;
      return a.status === activeTab;
    })
    .filter((a) => catFilter === "all" || a.category === catFilter)
    .filter(
      (a) =>
        a.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.target_audience.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
    if (!form.activity_name.trim())
      e.activity_name = "Activity name is required.";
    if (!form.category) e.category = "Please select a category.";
    if (!form.target_audience.trim())
      e.target_audience = "Target audience is required.";
    if (!form.scheduled_month) e.scheduled_month = "Please select a month.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalType("form");
  }

  function openEdit(activity) {
    setForm({
      activity_name: activity.activity_name,
      category: activity.category,
      target_audience: activity.target_audience,
      internal_external: activity.internal_external,
      scheduled_month: activity.scheduled_month,
      status: activity.status,
      notes: activity.notes,
    });
    setErrors({});
    setEditingId(activity.id);
    setModalType("form");
  }

  function handleDeleteOpen(activity) {
    setDeleteReason("");
    setDeleteModal(activity);
  }

  async function handleDeleteConfirm() {
    if (!deleteReason.trim()) {
      setErrors({ deleteReason: "Deletion reason is required." });
      return;
    }

    try {
      await fetch(`${API_URL}/${deleteModal.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });

      setActivities(activities.filter((a) => a.id !== deleteModal.id));

      setDeleteModal(null);
      setDeleteReason("");
      setErrors({});
      showBanner("Activity deleted successfully.");
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  }

  async function handleSave() {
    if (!validate()) return;

    const payload = {
      activity_name: form.activity_name,
      category: form.category,
      target_audience: form.target_audience,
      internal_external: form.internal_external,
      scheduled_month:
        form.scheduled_month.length === 7
          ? form.scheduled_month + "-01"
          : form.scheduled_month,
      status: form.status,
      notes: form.notes,
    };

    try {
      if (modalType === "form" && editingId === null) {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const newActivity = await res.json();

        setActivities([
          ...activities,
          {
            ...newActivity,
            scheduled_month: newActivity.scheduled_month?.split("T")[0],
          },
        ]);
        showBanner("Activity added successfully.");
      } else {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();

        setActivities(
          activities.map((a) =>
            a.id === editingId
              ? {
                  ...updated,
                  scheduled_month: updated.scheduled_month?.split("T")[0],
                }
              : a,
          ),
        );
        showBanner("Activity updated successfully.");
      }

      setModalType(null);
      setEditingId(null);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      console.error("Failed to save activity:", err);
    }
  }

  // Inline status change directly in the table
  function handleInlineStatus(id, newStatus) {
    setActivities(
      activities.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
    showBanner("Status updated.");
  }

  return (
    <div className="cal-page">
      {showSuccess && (
        <div className="cal-success-banner">✓ {successMessage}</div>
      )}

      {/* Header */}
      <div className="cal-header">
        <div>
          <h1 className="cal-title">EHSS Training Calendar 2026</h1>
          <p className="cal-subtitle">
            Activities past their scheduled month with status "Scheduled" are
            automatically flagged as overdue.
          </p>
        </div>
        <button className="cal-btn-primary" onClick={openAdd}>
          + Add activity
        </button>
      </div>

      {/* Summary cards */}
      <div className="cal-cards">
        <div className="cal-card">
          <div className="cal-card-label">Total</div>
          <div className="cal-card-value">{counts.all}</div>
        </div>
        <div className="cal-card card-completed">
          <div className="cal-card-label">Completed</div>
          <div className="cal-card-value green">{counts.completed}</div>
        </div>
        <div className="cal-card card-overdue">
          <div className="cal-card-label">Overdue</div>
          <div className="cal-card-value red">{counts.overdue}</div>
        </div>
        <div className="cal-card">
          <div className="cal-card-label">Scheduled</div>
          <div className="cal-card-value">{counts.scheduled}</div>
        </div>
        <div className="cal-card">
          <div className="cal-card-label">Not conducted</div>
          <div className="cal-card-value amber">{counts.not_conducted}</div>
        </div>
      </div>

      {/* Filter row */}
      <div className="cal-filter-row">
        <div className="cal-tabs">
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "scheduled", label: `Scheduled (${counts.scheduled})` },
            { key: "overdue", label: `Overdue (${counts.overdue})` },
            { key: "completed", label: `Completed (${counts.completed})` },
            {
              key: "not_conducted",
              label: `Not conducted (${counts.not_conducted})`,
            },
            {
              key: "rescheduled",
              label: `Rescheduled (${counts.rescheduled})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`cal-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="cal-filter-right">
          <select
            className="cal-select"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            <option value="statutory_requirement">Statutory</option>
            <option value="industry_best_practice">Best practice</option>
            <option value="behaviour_based_safety">Best Based Safety</option>
          </select>
          <input
            className="cal-search"
            type="text"
            placeholder="Search activity or audience..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="cal-table-wrap">
        <table className="cal-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Activity</th>
              <th>Category</th>
              <th>Target audience</th>
              <th>Type</th>
              <th>Month</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#888",
                    fontStyle: "italic",
                  }}
                >
                  No activities match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((a, i) => {
                const overdue = isOverdue(a);
                return (
                  <tr
                    key={a.id}
                    className={
                      overdue
                        ? "row-overdue"
                        : a.status === "completed"
                          ? "row-completed"
                          : ""
                    }
                  >
                    <td>{i + 1}</td>
                    <td className="cal-activity-name">{a.activity_name}</td>
                    <td>
                      <span
                        className={`cal-badge ${getCategoryClass(a.category)}`}
                      >
                        {friendlyCategory(a.category)}
                      </span>
                    </td>
                    <td>{a.target_audience}</td>
                    <td>
                      {a.internal_external === "internal"
                        ? "Internal"
                        : "External"}
                    </td>
                    <td>{formatMonth(a.scheduled_month)}</td>
                    <td>
                      <span
                        className={`cal-badge ${getStatusClass(a.status, overdue)}`}
                      >
                        {getStatusText(a.status, overdue)}
                      </span>
                    </td>
                    <td className="cal-notes">{a.notes || "—"}</td>
                    <td>
                      {/* Inline status dropdown */}
                      <select
                        className="cal-inline-select"
                        value={a.status}
                        onChange={(e) =>
                          handleInlineStatus(a.id, e.target.value)
                        }
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="not_conducted">Not conducted</option>
                      </select>{" "}
                      <button
                        className="cal-btn-sm cal-edit-btn"
                        onClick={() => openEdit(a)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="cal-btn-sm cal-delete-btn"
                        onClick={() => handleDeleteOpen(a)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalType === "form" && (
        <div className="cal-modal-overlay">
          <div className="cal-modal">
            <h2 className="cal-modal-title">
              {editingId ? "✎ Edit activity" : "Add activity"}
            </h2>

            <div className="cal-form-grid">
              <div className="cal-form-group full">
                <label className="cal-form-label">
                  Activity name <span className="required">*</span>
                </label>
                <input
                  className="cal-form-input"
                  type="text"
                  name="activity_name"
                  value={form.activity_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Fire drill"
                />
                {errors.activity_name && (
                  <div className="cal-field-error">{errors.activity_name}</div>
                )}
              </div>

              <div className="cal-form-group">
                <label className="cal-form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  className="cal-form-select"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  <option value="">Select category...</option>
                  <option value="statutory_requirement">
                    Statutory requirement
                  </option>
                  <option value="industry_best_practice">
                    Industry best practice
                  </option>
                  <option value="behaviour_based_safety">
                    Behaviour based safety
                  </option>
                </select>
                {errors.category && (
                  <div className="cal-field-error">{errors.category}</div>
                )}
              </div>

              <div className="cal-form-group">
                <label className="cal-form-label">
                  Target audience <span className="required">*</span>
                </label>
                <input
                  className="cal-form-input"
                  type="text"
                  name="target_audience"
                  value={form.target_audience}
                  onChange={handleFormChange}
                  placeholder="e.g. All staff"
                />
                {errors.target_audience && (
                  <div className="cal-field-error">
                    {errors.target_audience}
                  </div>
                )}
              </div>

              <div className="cal-form-group">
                <label className="cal-form-label">Internal / External</label>
                <select
                  className="cal-form-select"
                  name="internal_external"
                  value={form.internal_external}
                  onChange={handleFormChange}
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div className="cal-form-group">
                <label className="cal-form-label">
                  Scheduled month <span className="required">*</span>
                </label>
                <input
                  className="cal-form-input"
                  type="month"
                  name="scheduled_month"
                  value={
                    form.scheduled_month
                      ? form.scheduled_month.substring(0, 7)
                      : ""
                  }
                  onChange={(e) =>
                    setForm({ ...form, scheduled_month: e.target.value })
                  }
                />
                {errors.scheduled_month && (
                  <div className="cal-field-error">
                    {errors.scheduled_month}
                  </div>
                )}
              </div>

              <div className="cal-form-group">
                <label className="cal-form-label">Status</label>
                <select
                  className="cal-form-select"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="not_conducted">Not conducted</option>
                </select>
              </div>

              <div className="cal-form-group full">
                <label className="cal-form-label">Notes (optional)</label>
                <input
                  className="cal-form-input"
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="cal-modal-buttons">
              <button
                className="cal-btn-secondary"
                onClick={() => {
                  setModalType(null);
                  setErrors({});
                }}
              >
                Cancel
              </button>
              <button className="cal-btn-primary" onClick={handleSave}>
                {editingId ? "Save changes" : "Add activity"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*DELETE CONFIRMATION MODAL*/}
      {deleteModal && (
        <div className="cal-modal-overlay">
          <div className="cal-modal">
            <h2 className="cal-modal-title">Delete Activity</h2>
            <p>
              Are you sure you want to delete "{deleteModal.activity_name}"?
            </p>
            <div className="cal-form-group full">
              <label className="cal-form-label">
                Reason for deletion<span className="required">*</span>
              </label>
              <input
                className="cal-form-input"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason..."
              />
              {errors.deleteReason && (
                <div className="cal-field-error">{errors.deleteReason}</div>
              )}
            </div>
            <div className="cal-modal-buttons">
              <button
                className="cal-btn-secondary"
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className="cal-btn-primary"
                style={{ background: "#c0392b" }}
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
