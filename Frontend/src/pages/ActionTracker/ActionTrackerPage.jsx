// ─────────────────────────────────────────────
// ActionTrackerPage.jsx — Action Tracker Management
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./ActionTrackerPage.css";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";

const API_URL = `/actionTracker`;

const COLORS = ["#2ecc71", "#f39c12", "#e74c3c"];

export default function ActionTracker() {
  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
  const [actions, setActions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const { user } = useAuth();
  const role = user?.role_name;
  const isFullAccess = ["ehss_officer", "it_admin"].includes(role);

  useEffect(() => {
    apiFetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item) => ({
          id: item.id,
          concern: item.concern,
          action: item.action,
          responsible: item.responsible,
          dateRaised: item.date_raised?.split("T")[0],
          targetDate: item.target_date?.split("T")[0],
          progress: item.progress,
          status: item.status,
          raisedBy: item.raised_by,
        }));
        setActions(mapped);
      })
      .catch((err) => console.error("Failed to fetch actions:", err));
  }, []);

  const emptyForm = {
    concern: "",
    action: "",
    responsible: "",
    dateRaised: "",
    targetDate: "",
    progress: 0,
    status: "Pending",
  };

  const [formData, setFormData] = useState(emptyForm);
  const PROGRESS_OPTIONS = [0, 25, 50, 75, 100];

  // edit buffer (IMPORTANT FIX)
  const [editBuffer, setEditBuffer] = useState(null);

  // ─────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────
  const visibleActions = isFullAccess
    ? actions
    : actions.filter((a) => a.raisedBy === user?.id);

  const filteredActions = visibleActions.filter((item) => {
    const matchesSearch =
      item.concern.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" ? true : item.status === filter;
    return matchesSearch && matchesFilter;
  });

  // ─────────────────────────────
  // STATS
  // ─────────────────────────────
  const total = visibleActions.length;
  const completed = visibleActions.filter(
    (a) => a.status === "Completed",
  ).length;
  const inProgress = visibleActions.filter(
    (a) => a.status === "In Progress",
  ).length;
  const pending = visibleActions.filter((a) => a.status === "Pending").length;

  const stats = {
    total,
    completed,
    inProgress,
    pending,
  };

  const completionRate =
    stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const statusPieData = [
    { name: "Completed", value: stats.completed },
    { name: "In Progress", value: stats.inProgress },
    { name: "Not Started", value: stats.pending },
  ];

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  const getStatusFromProgress = (progress) => {
    if (progress >= 76) return "Completed";
    if (progress >= 25) return "In Progress";
    return "Pending";
  };

  // ─────────────────────────────
  // HANDLERS
  // ─────────────────────────────
  const handleAdd = async () => {
    try {
      const res = await apiFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concern: formData.concern,
          action: formData.action || "Pending review",
          responsible: formData.responsible || null,
          date_raised: formData.dateRaised || null,
          target_date: formData.targetDate || null,
          progress: formData.progress,
          status: getStatusFromProgress(formData.progress),
          raised_by: user?.id,
        }),
      });
      const newItem = await res.json();

      setActions([
        ...actions,
        {
          id: newItem.id,
          concern: newItem.concern,
          action: newItem.action,
          responsible: newItem.responsible,
          dateRaised: newItem.date_raised?.split("T")[0],
          targetDate: newItem.target_date?.split("T")[0],
          progress: newItem.progress,
          status: newItem.status,
          raisedBy: newItem.raised_by ?? user?.id,
        },
      ]);
      setFormData(emptyForm);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add action:", err);
    }
  };

  const openEdit = (item) => {
    setEditBuffer({ ...item });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const updatedStatus = getStatusFromProgress(editBuffer.progress);

      const res = await apiFetch(`${API_URL}/${editBuffer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concern: editBuffer.concern,
          action: editBuffer.action,
          responsible: editBuffer.responsible,
          date_raised: editBuffer.dateRaised,
          target_date: editBuffer.targetDate,
          progress: editBuffer.progress,
          status: updatedStatus,
        }),
      });
      const updated = await res.json();

      setActions(
        actions.map((a) =>
          a.id === updated.id
            ? {
                id: updated.id,
                concern: updated.concern,
                action: updated.action,
                responsible: updated.responsible,
                dateRaised: updated.date_raised?.split("T")[0],
                targetDate: updated.target_date?.split("T")[0],
                progress: updated.progress,
                status: updated.status,
                raisedBy: updated.raised_by ?? a.raisedBy ?? user?.id,
              }
            : a,
        ),
      );

      setEditBuffer(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update action:", err);
    }
  };

  const handleDeleteOpen = (item) => {
    setSelectedAction(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReason.trim()) {
      setDeleteError("Deletion reason is required.");
      return;
    }

    try {
      await apiFetch(`${API_URL}/${selectedAction.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });

      setActions(actions.filter((a) => a.id !== selectedAction.id));

      setDeleteError("");
      setSelectedAction(null);
      setDeleteReason("");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete action:", err);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="ehss-container">
      {/* HEADER */}
      <div className="ehss-header">
        <div>
          <h1 className="ehss-title">Action Tracker</h1>

          <p className="ehss-subtitle">
            Monitor safety concerns, corrective actions, and progress
          </p>
        </div>
        <button
          className="ehss-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Action
        </button>
      </div>

      {/* SUMMARY CARDS*/}
      <div className="ehss-cards">
        <div className="ehss-card ehss-card-primary">
          <div className="ehss-card-label">TOTAL</div>
          <h3>{stats.total}</h3>
        </div>

        <div className="ehss-card ehss-card-success">
          <div className="ehss-card-label">COMPLETED</div>
          <h3>{stats.completed}</h3>
        </div>

        <div className="ehss-card ehss-card-info">
          <div className="ehss-card-label">IN PROGRESS</div>
          <h3>{stats.inProgress}</h3>
        </div>

        <div className="ehss-card ehss-card-warning">
          <div className="ehss-card-label">PENDING</div>
          <h3>{stats.pending}</h3>
        </div>

        <div className="ehss-card ehss-card-completionrate">
          <div className="ehss-card-label">COMPLETION RATE</div>
          <h3>{completionRate}%</h3>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="ehss-controls">
        <input
          className="ehss-input ehss-search"
          type="text"
          placeholder="Search concerns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="ehss-input ehss-search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="ehss-table-wrapper">
        <table className="ehss-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Concern</th>
              <th>Action</th>
              <th>Responsible</th>
              <th>Date Raised</th>
              <th>Target Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Days elapsed</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredActions.map((item) => (
              <tr
                key={item.id}
                className={
                  item.status === "Pending"
                    ? "row-pending"
                    : item.status === "In Progress"
                      ? "row-progress"
                      : ""
                }
              >
                <td>{item.id}</td>
                <td>{item.concern}</td>
                <td>{item.action}</td>
                <td>{item.responsible}</td>
                <td>{item.dateRaised}</td>
                <td>{item.targetDate}</td>
                <td>
                  <div className="progress-wrapper">
                    <div
                      className={`progress-fill ${
                        item.progress <= 25
                          ? "progress-low"
                          : item.progress <= 75
                            ? "progress-medium"
                            : "progress-high"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <span className="progress-text">{item.progress}%</span>
                </td>
                <td>
                  <span
                    className={`ehss-badge ${item.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.dateRaised
                    ? Math.floor(
                        (new Date() - new Date(item.dateRaised)) /
                          (1000 * 60 * 60 * 24),
                      )
                    : "—"}
                </td>
                <td>
                  {isFullAccess ? (
                    <>
                      <button
                        className="ehss-btn-sm ehss-edit-btn"
                        onClick={() => openEdit(item)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="ehss-btn-sm ehss-delete-btn"
                        onClick={() => handleDeleteOpen(item)}
                      >
                        🗑 Delete
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#888", fontSize: "11px" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STATUS PIE CHART */}
      {isFullAccess && (
        <div className="ehss-panel" style={{ marginTop: "14px" }}>
          <div className="ehss-panel-title">📊 Action Status Breakdown</div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="ehss-modal-overlay">
          <div className="ehss-modal">
            <h2 className="ehss-modal-title">Add Action</h2>

            <div className="ehss-form-grid">
              <div className="ehss-form-group full">
                <label className="ehss-form-label">Concern</label>
                <input
                  className="ehss-form-input"
                  value={formData.concern}
                  onChange={(e) =>
                    setFormData({ ...formData, concern: e.target.value })
                  }
                />
              </div>

              <div className="ehss-form-group">
                <label className="ehss-form-label">Date Raised</label>
                <input
                  className="ehss-form-input"
                  type="date"
                  value={formData.dateRaised}
                  onChange={(e) =>
                    setFormData({ ...formData, dateRaised: e.target.value })
                  }
                />
              </div>

              {isFullAccess && (
                <>
                  <div className="ehss-form-group full">
                    <label className="ehss-form-label">Action</label>
                    <input
                      className="ehss-form-input"
                      value={formData.action}
                      onChange={(e) =>
                        setFormData({ ...formData, action: e.target.value })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">Responsible</label>
                    <input
                      className="ehss-form-input"
                      value={formData.responsible}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsible: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">Target Date</label>
                    <input
                      className="ehss-form-input"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) =>
                        setFormData({ ...formData, targetDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">
                      Progress: {formData.progress}%
                    </label>
                    <select
                      className="ehss-form-input"
                      value={formData.progress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          progress: Number(e.target.value),
                        })
                      }
                    >
                      {PROGRESS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="ehss-modal-buttons">
              <button
                className="ehss-btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button className="ehss-btn-primary" onClick={handleAdd}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editBuffer && (
        <div className="ehss-modal-overlay">
          <div className="ehss-modal">
            <h2 className="ehss-modal-title">Edit Action</h2>

            <div className="ehss-form-grid">
              <div className="ehss-form-group full">
                <label className="ehss-form-label">Concern</label>
                <input
                  className="ehss-form-input"
                  value={editBuffer.concern}
                  onChange={(e) =>
                    setEditBuffer({ ...editBuffer, concern: e.target.value })
                  }
                />
              </div>
              <div className="ehss-form-group full">
                <label className="ehss-form-label">Date Raised</label>
                <input
                  className="ehss-form-input"
                  type="date"
                  value={editBuffer.dateRaised}
                  onChange={(e) =>
                    setEditBuffer({ ...editBuffer, dateRaised: e.target.value })
                  }
                />
              </div>
              {isFullAccess && (
                <>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">Responsible</label>
                    <input
                      className="ehss-form-input"
                      value={editBuffer.responsible}
                      onChange={(e) =>
                        setEditBuffer({
                          ...editBuffer,
                          responsible: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">Action</label>
                    <input
                      className="ehss-form-input"
                      value={editBuffer.action}
                      onChange={(e) =>
                        setEditBuffer({
                          ...editBuffer,
                          action: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">Target Date</label>
                    <input
                      className="ehss-form-input"
                      type="date"
                      value={editBuffer.targetDate}
                      onChange={(e) =>
                        setEditBuffer({
                          ...editBuffer,
                          targetDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="ehss-form-group">
                    <label className="ehss-form-label">
                      Progress: {editBuffer.progress}%
                    </label>
                    <select
                      className="ehss-form-input"
                      value={editBuffer.progress}
                      onChange={(e) =>
                        setEditBuffer({
                          ...editBuffer,
                          progress: Number(e.target.value),
                        })
                      }
                    >
                      {PROGRESS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="ehss-modal-buttons">
              <button
                className="ehss-btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button className="ehss-btn-primary" onClick={handleEditSave}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedAction && (
        <div className="ehss-modal-overlay">
          <div className="ehss-modal">
            <h2 className="ehss-modal-title">Delete Action</h2>

            <p>You must provide a reason before deleting this action.</p>

            <input
              className="ehss-form-input"
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(e.target.value);
                setDeleteError("");
              }}
              placeholder="Reason for deletion..."
            />

            {deleteError && (
              <div className="comp-field-error">{deleteError}</div>
            )}

            <div className="ehss-modal-buttons">
              <button
                className="ehss-btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason("");
                  setDeleteError("");
                }}
              >
                Cancel
              </button>

              <button className="ehss-btn-danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
