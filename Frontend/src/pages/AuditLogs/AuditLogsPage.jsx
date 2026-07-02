import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./AuditLogsPage.css";

const TABLES = [
  "",
  "users",
  "ppe_inventory",
  "action_tracker",
  "equipment",
  "compliance_matrix",
  "safety_metrics",
  "sustainability",
  "departmental_costs",
  "ehss_calendar",
];
const ACTIONS = ["", "CREATE", "UPDATE", "DELETE"];

const TABLE_LABELS = {
  users: "Users",
  ppe_inventory: "PPE Inventory",
  action_tracker: "Action Tracker",
  equipment: "Equipment",
  compliance_matrix: "Compliance",
  safety_metrics: "Safety Metrics",
  sustainability: "Sustainability",
  departmental_costs: "Costs",
  ehss_calendar: "Calendar",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    table_name: "",
    action: "",
    from: "",
    to: "",
  });

  const load = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    try {
      const res = await api.get(`/audit-logs?${params}`);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="al-page">
      <div className="al-header">
        <h1 className="al-title">Audit Logs</h1>
        <p className="al-subtitle">
          System activity trail — all create, update, and delete actions
        </p>
      </div>

      <div className="al-filters">
        <div className="al-filter-group">
          <label className="al-filter-label">Table</label>
          <select
            className="al-filter-input"
            value={filters.table_name}
            onChange={(e) =>
              setFilters({ ...filters, table_name: e.target.value })
            }
          >
            {TABLES.map((t) => (
              <option key={t} value={t}>
                {t ? TABLE_LABELS[t] || t : "All tables"}
              </option>
            ))}
          </select>
        </div>
        <div className="al-filter-group">
          <label className="al-filter-label">Action</label>
          <select
            className="al-filter-input"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a || "All actions"}
              </option>
            ))}
          </select>
        </div>
        <div className="al-filter-group">
          <label className="al-filter-label">From</label>
          <input
            type="date"
            className="al-filter-input"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="al-filter-group">
          <label className="al-filter-label">To</label>
          <input
            type="date"
            className="al-filter-input"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <button className="al-btn-primary" onClick={load}>
          Apply
        </button>
      </div>

      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              {[
                "Timestamp",
                "User",
                "Action",
                "Module",
                "Record ID",
                "Details",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="al-empty">
                    No logs found for the selected filters.
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td>
                    <strong>{l.user_name || "—"}</strong>
                  </td>
                  <td>
                    <span className={`al-badge ${l.action}`}>{l.action}</span>
                  </td>
                  <td>
                    <span className="al-table-name">
                      {TABLE_LABELS[l.table_name] || l.table_name}
                    </span>
                  </td>
                  <td>{l.record_id || "—"}</td>
                  <td>
                    <div
                      className="al-details"
                      title={l.new_value ? JSON.stringify(l.new_value) : ""}
                    >
                      {l.new_value
                        ? JSON.stringify(l.new_value).slice(0, 80)
                        : "—"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
