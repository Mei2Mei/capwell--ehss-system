// ─────────────────────────────────────────────
// ActionTrackerPage.jsx — Action Tracker Management
// ─────────────────────────────────────────────

import { useMemo, useState } from "react";
import { actiontrackerData as initialActions } from "../../data/ActionTrackerData";
import "./ActionTrackerPage.css";

export default function ActionTracker() {
  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
  const [actions, setActions] = useState(initialActions);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");

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

  // edit buffer (IMPORTANT FIX)
  const [editBuffer, setEditBuffer] = useState(null);

  // ─────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────
  const filteredActions = useMemo(() => {
    return actions.filter((item) => {
      const matchesSearch =
        item.concern.toLowerCase().includes(search.toLowerCase()) ||
        item.action.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" ? true : item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [actions, search, filter]);

  // ─────────────────────────────
  // STATS
  // ─────────────────────────────
  const stats = useMemo(() => {
    const total = actions.length;
    const completed = actions.filter((a) => a.status === "Completed").length;
    const inProgress = actions.filter((a) => a.status === "In Progress").length;
    const pending = actions.filter((a) => a.status === "Pending").length;

    return { total, completed, inProgress, pending };
  }, [actions]);

  const completionRate =
    stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  const getStatusFromProgress = (progress) => {
    if (progress >= 75) return "Completed";
    if (progress >= 25) return "In Progress";
    return "Pending";
  };

  // ─────────────────────────────
  // HANDLERS
  // ─────────────────────────────
  const handleAdd = () => {
    const newItem = {
      id: Date.now(),
      ...formData,
      status: getStatusFromProgress(formData.progress),
    };

    setActions([...actions, newItem]);
    setFormData(emptyForm);
    setShowAddModal(false);
  };

  const openEdit = (item) => {
    setEditBuffer({ ...item });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    setActions(
      actions.map((a) =>
        a.id === editBuffer.id
          ? {
              ...editBuffer,
              status: getStatusFromProgress(editBuffer.progress),
            }
          : a,
      ),
    );

    setEditBuffer(null);
    setShowEditModal(false);
  };

  const handleDeleteOpen = (item) => {
    setSelectedAction(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteReason.trim()) {
      setDeleteError("Deletion reason is required.");
      return;
    }

    setActions(actions.filter((a) => a.id !== selectedAction.id));

    setDeleteError("");
    setSelectedAction(null);
    setDeleteReason("");
    setShowDeleteModal(false);
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
      <div className="ehss-summary-grid">
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredActions.map((item) => (
              <tr key={item.id}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="ehss-modal-overlay">
          <div className="ehss-modal">
            <h2 className="ehss-modal-title">Add Action</h2>

            <div className="ehss-form-grid">
              <div className="ehss-form-group">
                <label className="ehss-form-label">Concern</label>

                <input
                  className="ehss-form-input"
                  value={formData.concern}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      concern: e.target.value,
                    })
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
              <div className="ehss-form-group">
                <label className="ehss-form-label">Concern</label>

                <input
                  className="ehss-form-input"
                  value={editBuffer.concern}
                  onChange={(e) =>
                    setEditBuffer({
                      ...editBuffer,
                      concern: e.target.value,
                    })
                  }
                />
              </div>

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
