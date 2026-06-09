// ─────────────────────────────────────────────
// EquipmentPage.jsx — Lifting Equipment Management
// ─────────────────────────────────────────────

import { useState } from "react";
import { equipmentData as initialData } from "../../data/EquipmentData";
import "./EquipmentPage.css";

// HELPERS//
function getInspectionStatus(nextInspection) {
  if (!nextInspection) return { text: "Not recorded", cls: "status-grey" };
  const today = new Date();
  const due = new Date(nextInspection);
  const daysLeft = Math.floor((due - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { text: "Overdue", cls: "status-red" };
  if (daysLeft <= 60) return { text: "Due soon", cls: "status-amber" };
  return { text: "Certified", cls: "status-green" };
}

const getEquipmentStatus = (item) => {
  if (!item.nextInspection) return "pending";

  const today = new Date();
  const due = new Date(item.nextInspection);
  const daysLeft = Math.floor((due - today) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 60) return "due";
  return "certified";
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState(initialData);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    capacity: "",
    status: "Available",
    lastInspection: "",
    nextInspection: "",
  });

  // ─────────────────────────────
  // FILTER
  // ─────────────────────────────
  const filtered = equipment
    .filter((e) => {
      const status = getEquipmentStatus(e);

      if (activeTab === "all") return true;
      return status === activeTab;
    })
    .filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.status.toLowerCase().includes(search.toLowerCase()),
    );

  // ─────────────────────────────
  // ADD EQUIPMENT
  // ─────────────────────────────
  const handleAdd = () => {
    if (!form.name.trim() || !form.category.trim() || !form.capacity.trim()) {
      alert("Please fill in Equipment Name, Category, and Capacity.");
      return;
    }

    if (editingId) {
      setEquipment(
        equipment.map((item) =>
          item.id === editingId ? { ...item, ...form } : item,
        ),
      );

      setEditingId(null);
      setShowModal(false);
      return;
    }

    const newItem = {
      id: equipment.length + 1,
      ...form,
    };

    setEquipment([newItem, ...equipment]);

    setForm({
      name: "",
      category: "",
      capacity: "",
      status: "Available",
      lastInspection: "",
      nextInspection: "",
    });

    setShowModal(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      category: item.category,
      capacity: item.capacity,
      status: item.status,
      lastInspection: item.lastInspection,
      nextInspection: item.nextInspection,
    });

    setShowModal(true);
  };

  const handleDeleteOpen = (item) => {
    setDeleteReason("");
    setDeleteModal(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteReason.trim()) {
      alert("Please enter a reason for deletion.");
      return;
    }

    setEquipment(equipment.filter((item) => item.id !== deleteModal.id));

    setDeleteModal(null);
    setDeleteReason("");
  };

  return (
    <div className="equipment-container">
      {/* HEADER */}
      <div className="equipment-header">
        <div>
          <h1 className="equipment-title">Lifting Equipment</h1>
          <p className="equipment-subtitle">
            Manage lifting equipment inspections and certification status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="equipment-btn-primary"
            onClick={() => {
              setEditingId(null);
              setForm({
                name: "",
                category: "",
                capacity: "",
                status: "Available",
                lastInspection: "",
                nextInspection: "",
              });
              setShowModal(true);
            }}
          >
            + Add Equipment
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="equipment-cards">
        <div className="equipment-card">
          <div className="equipment-card-label">Total Equipment</div>
          <div className="equipment-card-value">{equipment.length}</div>
        </div>

        <div className="equipment-card equipment-card-green">
          <div className="equipment-card-label">Certified</div>
          <div className="equipment-card-value">
            {
              equipment.filter((e) => getEquipmentStatus(e) === "certified")
                .length
            }
          </div>
        </div>

        <div className="equipment-card equipment-card-yellow">
          <div className="equipment-card-label">Due Soon</div>
          <div className="equipment-card-value">
            {equipment.filter((e) => getEquipmentStatus(e) === "due").length}
          </div>
        </div>

        <div className="equipment-card equipment-card-red">
          <div className="equipment-card-label">Overdue</div>
          <div className="equipment-card-value">
            {
              equipment.filter((e) => getEquipmentStatus(e) === "overdue")
                .length
            }
          </div>
        </div>
      </div>

      {/* SEARCH */}
      {/* FILTER ROW (ONLY ONE) */}
      <div className="equipment-filter-row">
        {/* LEFT: FILTER TABS */}
        <div className="equipment-tabs">
          {[
            { key: "all", label: "ALL" },
            { key: "certified", label: "CERTIFIED" },
            { key: "due", label: "DUE SOON" },
            { key: "overdue", label: "OVERDUE" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`equipment-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RIGHT: SEARCH */}
        <div className="equipment-right-controls">
          <input
            className="equipment-box"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="equipment-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Category</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Last Inspection</th>
            <th>Next Inspection</th>
            <th>Inspection status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((e) => {
            const inspection = getInspectionStatus(e.nextInspection);

            return (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.category}</td>
                <td>{e.capacity}</td>
                <td>
                  <span className={`status ${e.status.toLowerCase()}`}>
                    {e.status}
                  </span>
                </td>
                <td>{e.lastInspection}</td>
                <td>{e.nextInspection}</td>
                <td>
                  <span className={`status ${inspection.cls}`}>
                    {inspection.text}
                  </span>
                </td>
                <td>
                  <button
                    className="equipment-btn-sm equipment-edit-btn"
                    onClick={() => handleEdit(e)}
                  >
                    ✎ Edit
                  </button>

                  <button
                    className="equipment-btn-sm equipment-delete-btn"
                    onClick={() => handleDeleteOpen(e)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="equipment-modal-overlay">
          <div className="equipment-modal">
            <h2 className="equipment-modal-title">
              {editingId ? "Edit Equipment" : "Add Equipment"}
            </h2>

            <div className="equipment-form-grid">
              {/* NAME */}
              <div className="equipment-form-group full">
                <label className="equipment-form-label">
                  Equipment Name <span className="required">*</span>
                </label>
                <input
                  className="equipment-form-input"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* CATEGORY */}
              <div className="equipment-form-group">
                <label className="equipment-form-label">
                  Category <span className="required">*</span>
                </label>
                <input
                  className="equipment-form-input"
                  name="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              {/* CAPACITY */}
              <div className="equipment-form-group">
                <label className="equipment-form-label">
                  Capacity <span className="required">*</span>
                </label>
                <input
                  className="equipment-form-input"
                  name="capacity"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                />
              </div>

              {/* STATUS */}
              <div className="equipment-form-group">
                <label className="equipment-form-label">Status</label>
                <select
                  className="equipment-form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Available</option>
                  <option>In Use</option>
                  <option>Maintenance</option>
                </select>
              </div>

              {/* LAST INSPECTION */}
              <div className="equipment-form-group">
                <label className="equipment-form-label">Last Inspection</label>
                <input
                  type="date"
                  className="equipment-form-input"
                  value={form.lastInspection}
                  onChange={(e) =>
                    setForm({ ...form, lastInspection: e.target.value })
                  }
                />
              </div>

              {/* NEXT INSPECTION */}
              <div className="equipment-form-group">
                <label className="equipment-form-label">Next Inspection</label>
                <input
                  type="date"
                  className="equipment-form-input"
                  value={form.nextInspection}
                  onChange={(e) =>
                    setForm({ ...form, nextInspection: e.target.value })
                  }
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="equipment-modal-buttons">
              <button
                className="equipment-btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>

              <button className="equipment-btn-primary" onClick={handleAdd}>
                {editingId ? "Save Changes" : "Save Equipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="equipment-modal-overlay">
          <div className="equipment-modal" style={{ maxWidth: "450px" }}>
            <h2 className="equipment-modal-title" style={{ color: "#c0392b" }}>
              Delete Equipment
            </h2>

            <p
              style={{
                fontSize: "13px",
                color: "#444",
                marginBottom: "15px",
              }}
            >
              You are about to delete:
              <strong> {deleteModal.name}</strong>
            </p>

            <div className="equipment-form-group">
              <label className="equipment-form-label">
                Reason for deletion <span className="required">*</span>
              </label>

              <input
                className="equipment-form-input"
                type="text"
                placeholder="e.g. Equipment retired, duplicate entry, sold..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <div className="equipment-modal-buttons">
              <button
                className="equipment-btn-secondary"
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteReason("");
                }}
              >
                Cancel
              </button>

              <button
                className="equipment-btn-primary"
                style={{
                  background: "#c0392b",
                }}
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
