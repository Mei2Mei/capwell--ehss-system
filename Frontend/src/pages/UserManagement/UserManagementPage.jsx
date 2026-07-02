import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./UserManagementPage.css";

const ROLES = [
  "it_admin",
  "ehss_officer",
  "qa",
  "storekeeper",
  "supervisor",
  "production_manager",
];

const ROLE_LABELS = {
  it_admin: "IT Admin",
  ehss_officer: "EHSS Officer",
  qa: "QA",
  storekeeper: "PPE Storekeeper",
  supervisor: "Supervisor",
  production_manager: "Production Manager",
};

const DEPARTMENTS = [
  "HR",
  "Finance",
  "Operations",
  "Safety",
  "Maintenance",
  "IT",
  "Production",
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "ehss_officer",
  department: "",
  is_active: true,
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };
  const openEdit = (u) => {
    setEditing(u.id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      department: u.department || "",
      is_active: u.is_active,
    });
    setError("");
    setModal(true);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      if (editing) {
        await api.put(`/users/${editing}`, {
          role: form.role,
          department: form.department,
          is_active: form.is_active,
        });
      } else {
        if (!form.name || !form.email || !form.password)
          return setError("Name, email and password are required.");
        await api.post("/users", form);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Error saving user.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u.id}`, {
        role: u.role,
        department: u.department,
        is_active: !u.is_active,
      });
      load();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const totalActive = users.filter((u) => u.is_active).length;
  const totalInactive = users.filter((u) => !u.is_active).length;
  const totalAdmins = users.filter((u) => u.role === "it_admin").length;

  return (
    <div className="um-page">
      <div className="um-header">
        <div>
          <h1 className="um-title">User Management</h1>
          <p className="um-subtitle">
            Manage system users and role assignments
          </p>
        </div>
        <button className="um-btn-primary" onClick={openAdd}>
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-label">Total Users</div>
          <div className="um-stat-value blue">{users.length}</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-label">Active</div>
          <div className="um-stat-value green">{totalActive}</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-label">Inactive</div>
          <div className="um-stat-value amber">{totalInactive}</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-label">Admins</div>
          <div className="um-stat-value blue">{totalAdmins}</div>
        </div>
      </div>

      {/* Table */}
      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              {["Name", "Email", "Role", "Department", "Status", "Actions"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="um-empty">No users found.</div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="um-role-badge">
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td>{u.department || "—"}</td>
                  <td>
                    <span
                      className={`um-badge clickable ${u.is_active ? "active" : "inactive"}`}
                      onClick={() => toggleActive(u)}
                      title="Click to toggle"
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="um-btn-sm um-edit-btn"
                      onClick={() => openEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="um-btn-sm um-delete-btn"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="um-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="um-modal">
            <h2 className="um-modal-title">
              {editing ? "Edit User" : "Add New User"}
            </h2>

            {!editing && (
              <>
                <div className="um-form-group">
                  <label className="um-form-label">Full Name *</label>
                  <input
                    className="um-form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Jane Mwangi"
                  />
                </div>
                <div className="um-form-group">
                  <label className="um-form-label">Email *</label>
                  <input
                    className="um-form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="jane@capwell.com"
                  />
                </div>
                <div className="um-form-group">
                  <label className="um-form-label">Password *</label>
                  <input
                    className="um-form-input"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Temporary password"
                  />
                </div>
              </>
            )}

            <div className="um-form-group">
              <label className="um-form-label">Role</label>
              <select
                className="um-form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] || r}
                  </option>
                ))}
              </select>
            </div>

            <div className="um-form-group">
              <label className="um-form-label">Department</label>
              <select
                className="um-form-input"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              >
                <option value="">— Select department —</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            {editing && (
              <label className="um-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                User is active
              </label>
            )}

            {error && <div className="um-error">{error}</div>}

            <div className="um-modal-buttons">
              <button
                className="um-btn-secondary"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="um-btn-primary" onClick={handleSubmit}>
                Save User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
