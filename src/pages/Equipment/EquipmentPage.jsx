// ─────────────────────────────────────────────
// EquipmentPage.jsx — Lifting Equipment Management
// ─────────────────────────────────────────────

import { useState } from "react";
import { equipmentData as initialData } from "../../data/EquipmentData";
import "./EquipmentPage.css";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState(initialData);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

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
  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.status.toLowerCase().includes(search.toLowerCase()),
  );

  // ─────────────────────────────
  // ADD EQUIPMENT
  // ─────────────────────────────
  const handleAdd = (e) => {
    e.preventDefault();

    const newItem = {
      id: equipment.length + 1,
      ...form,
    };

    setEquipment([newItem, ...equipment]);

    setShowModal(false);
  };

  return (
    <div className="equipment-container">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Lifting Equipment</h2>

        <button onClick={() => setShowModal(true)} className="add-btn">
          + Add Equipment
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="card-row">
        <div className="card blue">
          <h4>Total Equipment</h4>
          <p>{equipment.length}</p>
        </div>

        <div className="card green">
          <h4>Available</h4>
          <p>{equipment.filter((e) => e.status === "Available").length}</p>
        </div>

        <div className="card orange">
          <h4>In Maintenance</h4>
          <p>{equipment.filter((e) => e.status === "Maintenance").length}</p>
        </div>
      </div>

      {/* SEARCH */}
      <input
        className="search-box"
        placeholder="Search equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <table className="equipment-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Last Inspection</th>
            <th>Next Inspection</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((e) => (
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="equipment-modal-overlay">
          <div className="equipment-modal">
            <h2 className="equipment-modal-title">Add Equipment</h2>

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
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button className="equipment-btn-primary" onClick={handleAdd}>
                Save Equipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
