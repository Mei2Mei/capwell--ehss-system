// ─────────────────────────────────────────────
// ActionTrackerPage.jsx — Action Tracker Management
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./ActionTrackerPage.css";
import { useAuth } from "../../context/AuthContext";
import apiFetch from "../../utils/api";

const API_URL = `/actionTracker`;
const COLORS = ["#2ecc71", "#f39c12", "#e74c3c"];

const DEPARTMENTS = [
  "HR",
  "Finance",
  "Operations",
  "Safety",
  "Maintenance",
  "IT",
  "Production",
];
const PRIORITIES = ["Low", "Medium", "High"];
const PROGRESS_OPTIONS = [0, 25, 50, 75, 100];
const parseDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.slice(0, 10);
};

export default function ActionTracker() {
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

  const emptyForm = {
    concern: "",
    action: "",
    responsible: "",
    dateRaised: "",
    targetDate: "",
    progress: 0,
    status: "Pending",
    department: "",
    priority: "Medium",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [editBuffer, setEditBuffer] = useState(null);

  useEffect(() => {
    apiFetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item) => ({
          id: item.id,
          concern: item.concern,
          action: item.action,
          responsible: item.responsible,
          dateRaised: parseDate(item.date_raised),
          targetDate: parseDate(item.target_date),
          progress: item.progress,
          status: item.status,
          raisedBy: item.raised_by,
          department: item.department || "",
          priority: item.priority || "Medium",
        }));
        setActions(mapped);
      })
      .catch((err) => console.error("Failed to fetch actions:", err));
  }, []);

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

  const total = visibleActions.length;
  const completed = visibleActions.filter(
    (a) => a.status === "Completed",
  ).length;
  const inProgress = visibleActions.filter(
    (a) => a.status === "In Progress",
  ).length;
  const pending = visibleActions.filter((a) => a.status === "Pending").length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const statusPieData = [
    { name: "Completed", value: completed },
    { name: "In Progress", value: inProgress },
    { name: "Not Started", value: pending },
  ];

  const getStatusFromProgress = (progress) => {
    if (progress >= 76) return "Completed";
    if (progress >= 25) return "In Progress";
    return "Pending";
  };

  const priorityColor = { High: "#e74c3c", Medium: "#f39c12", Low: "#27ae60" };

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
          department: formData.department || null,
          priority: formData.priority || "Medium",
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
          dateRaised: parseDate(newItem.date_raised),
          targetDate: parseDate(newItem.target_date),
          progress: newItem.progress,
          status: newItem.status,
          raisedBy: newItem.raised_by ?? user?.id,
          department: newItem.department || "",
          priority: newItem.priority || "Medium",
        },
      ]);
      setFormData(emptyForm);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add action:", err);
    }
  };

  const openEdit = (item) => {
    setEditBuffer({
      ...item,
      department: item.department || "",
      priority: item.priority || "Medium",
      responsible: item.responsible || "",
      action: item.action || "",
      dateRaised: item.dateRaised || "",
      targetDate: item.targetDate || "",
    });
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
          department: editBuffer.department || null,
          priority: editBuffer.priority || "Medium",
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
                dateRaised: parseDate(updated.date_raised),
                targetDate: parseDate(updated.target_date),
                progress: updated.progress,
                status: updated.status,
                raisedBy: updated.raised_by ?? a.raisedBy ?? user?.id,
                department: updated.department || "",
                priority: updated.priority || "Medium",
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
      setShowDeleteModal(false);
      setDeleteReason("");
      setDeleteError("");
    } catch (err) {
      console.error("Failed to delete action:", err);
    }
  };

  return (
    <div className="ehss-page">
      {/* HEADER */}
      <div className="ehss-header">
        <div>
          <h1 className="ehss-title">Action Tracker</h1>
          <p className="ehss-subtitle">
            Track and manage EHSS corrective actions
          </p>
        </div>
        <button
          className="ehss-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Action
        </button>
      </div>

      {/* STATS */}
      <div className="ehss-cards">
        <div className="ehss-card">
          <div className="ehss-card-label">Total Actions</div>
          <div className="ehss-card-value">{total}</div>
        </div>
        <div className="ehss-card">
          <div className="ehss-card-label">Completed</div>
          <div className="ehss-card-value green">{completed}</div>
        </div>
        <div className="ehss-card">
          <div className="ehss-card-label">In Progress</div>
          <div className="ehss-card-value amber">{inProgress}</div>
        </div>
        <div className="ehss-card">
          <div className="ehss-card-label">Pending</div>
          <div className="ehss-card-value red">{pending}</div>
        </div>
        <div className="ehss-card">
          <div className="ehss-card-label">Completion Rate</div>
          <div className="ehss-card-value">{completionRate}%</div>
        </div>
      </div>

      {/* CHARTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="ehss-card">
          <div className="ehss-card-label" style={{ marginBottom: 8 }}>
            Status Breakdown
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {statusPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ehss-card">
          <div className="ehss-card-label" style={{ marginBottom: 8 }}>
            Actions by Priority
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={PRIORITIES.map((p) => ({
                name: p,
                count: visibleActions.filter((a) => a.priority === p).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a5276" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          className="ehss-form-input"
          placeholder="Search concern or action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        {["All", "Pending", "In Progress", "Completed"].map((f) => (
          <button
            key={f}
            className={filter === f ? "ehss-btn-primary" : "ehss-btn-secondary"}
            onClick={() => setFilter(f)}
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="ehss-table-wrapper">
        <table className="ehss-table">
          <thead>
            <tr>
              <th>Concern</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Action</th>
              <th>Responsible</th>
              <th>Date Raised</th>
              <th>Target Date</th>
              <th>Progress</th>
              <th>Status</th>
              {isFullAccess && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredActions.length === 0 ? (
              <tr>
                <td
                  colSpan={isFullAccess ? 10 : 9}
                  style={{ textAlign: "center", padding: 32, color: "#aaa" }}
                >
                  No actions found.
                </td>
              </tr>
            ) : (
              filteredActions.map((item) => (
                <tr key={item.id}>
                  <td>{item.concern}</td>
                  <td>{item.department || "—"}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: priorityColor[item.priority] || "#333",
                        fontSize: 12,
                      }}
                    >
                      {item.priority || "—"}
                    </span>
                  </td>
                  <td>{item.action}</td>
                  <td>{item.responsible || "—"}</td>
                  <td>{item.dateRaised || "—"}</td>
                  <td>{item.targetDate || "—"}</td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          background: "#e0e0e0",
                          borderRadius: 4,
                          height: 8,
                        }}
                      >
                        <div
                          style={{
                            width: `${item.progress}%`,
                            background:
                              item.progress === 100
                                ? "#27ae60"
                                : item.progress >= 50
                                  ? "#f39c12"
                                  : "#e74c3c",
                            borderRadius: 4,
                            height: 8,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11 }}>{item.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`ehss-badge ${item.status?.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  {isFullAccess && (
                    <td>
                      <button
                        className="ehss-btn-sm ehss-edit-btn"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="ehss-btn-sm ehss-delete-btn"
                        onClick={() => handleDeleteOpen(item)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="ehss-modal-overlay">
          <div className="ehss-modal">
            <h2 className="ehss-modal-title">Add Action Item</h2>
            <div className="ehss-form-grid">
              <div className="ehss-form-group full">
                <label className="ehss-form-label">Concern *</label>
                <input
                  className="ehss-form-input"
                  value={formData.concern}
                  onChange={(e) =>
                    setFormData({ ...formData, concern: e.target.value })
                  }
                />
              </div>
              <div className="ehss-form-group">
                <label className="ehss-form-label">Department</label>
                <select
                  className="ehss-form-input"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  <option value="">— Select —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ehss-form-group">
                <label className="ehss-form-label">Priority</label>
                <select
                  className="ehss-form-input"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
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
              <div className="ehss-form-group">
                <label className="ehss-form-label">Department</label>
                <select
                  className="ehss-form-input"
                  value={editBuffer.department}
                  onChange={(e) =>
                    setEditBuffer({ ...editBuffer, department: e.target.value })
                  }
                >
                  <option value="">— Select —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ehss-form-group">
                <label className="ehss-form-label">Priority</label>
                <select
                  className="ehss-form-input"
                  value={editBuffer.priority}
                  onChange={(e) =>
                    setEditBuffer({ ...editBuffer, priority: e.target.value })
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="ehss-form-group">
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
                        setEditBuffer({ ...editBuffer, action: e.target.value })
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
