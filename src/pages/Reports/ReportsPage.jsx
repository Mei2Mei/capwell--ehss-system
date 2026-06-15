import { useState } from "react";
import { safetyRecords } from "../../data/safetyData";
import { costRecords } from "../../data/costsData";
import { complianceItems } from "../../data/ComplianceData";
import { ppeItems } from "../../data/PPEData";
import {
  sustainabilityRecords,
  emissionFactors,
} from "../../data/sustainabilityData";
import "./ReportsPage.css";
import {
  BarChart,
  Bar,
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
import { actiontrackerData } from "../../data/ActionTrackerData";

function formatKES(n) {
  return `KES ${Number(n).toLocaleString()}`;
}
function formatMonth(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

const PIE_COLORS = ["#2ecc71", "#f39c12", "#e74c3c"];
const COST_PIE_COLORS = [
  "#1a5276",
  "#27ae60",
  "#e67e22",
  "#8e44ad",
  "#c0392b",
  "#16a085",
];

function calcScope1(r) {
  return (
    r.petrol_litres * emissionFactors.petrol +
    r.diesel_litres * emissionFactors.diesel +
    r.firewood_tonnes * emissionFactors.firewood +
    r.lpg_kg * emissionFactors.lpg
  );
}
function calcScope2(r) {
  return r.electricity_kwh * emissionFactors.electricity;
}

function getCompStatus(item) {
  if (!item.reference_number || !item.date_of_expiry) return "Pending";
  const days = Math.floor(
    (new Date(item.date_of_expiry) - new Date()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "Expired";
  if (days <= 60) return "Expiring soon";
  return "Valid";
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly_summary");
  const [generated, setGenerated] = useState(false);
  const [selectedPPE, setSelectedPPE] = useState(ppeItems[0]?.id || "");

  const totalCost = costRecords.reduce((s, r) => s + r.cost_excl_vat, 0);
  const statutory = costRecords
    .filter((r) => r.cost_type === "statutory_requirement")
    .reduce((s, r) => s + r.cost_excl_vat, 0);
  const welfare = costRecords
    .filter((r) => r.cost_type === "staff_welfare")
    .reduce((s, r) => s + r.cost_excl_vat, 0);
  const outsideBudget = costRecords
    .filter((r) => r.budget_status === "outside_budget")
    .reduce((s, r) => s + r.cost_excl_vat, 0);
  const costByMonth = [
    {
      month: "Jan",
      statutory: 710000,
      staff_welfare: 359395,
      ppe: 0,
      improvement: 0,
    },
    { month: "Feb", statutory: 0, staff_welfare: 0, ppe: 0, improvement: 0 },
    { month: "Mar", statutory: 0, staff_welfare: 0, ppe: 0, improvement: 0 },
    { month: "Apr", statutory: 0, staff_welfare: 0, ppe: 0, improvement: 0 },
  ];
  const COST_COLORS = {
    statutory: "#1a5276",
    staff_welfare: "#27ae60",
    ppe: "#e67e22",
    improvement: "#8e44ad",
  };
  const totalIncidents = safetyRecords.reduce(
    (s, r) => s + r.medical_treatment_incidents + r.lost_time_incidents,
    0,
  );
  const totalTraining = safetyRecords.reduce(
    (s, r) => s + r.hse_training_hours,
    0,
  );
  const complianceWithStatus = complianceItems.map((c) => ({
    ...c,
    status: getCompStatus(c),
  }));
  const expired = complianceWithStatus.filter((c) => c.status === "Expired");
  const expiring = complianceWithStatus.filter(
    (c) => c.status === "Expiring soon",
  );
  const lowStock = ppeItems.filter((p) => p.current_stock <= p.reorder_level);

  // PPE fast-moving chart data — for now uses transaction-less sample;
  // shows current stock per month placeholder until real transaction history connects
  const selectedItem = ppeItems.find((p) => p.id === Number(selectedPPE));
  const ppeMonthlyData = ["Jan", "Feb", "Mar", "Apr"].map((m, i) => ({
    month: m,
    stock: selectedItem
      ? Math.max(selectedItem.current_stock + (3 - i) * 5, 0)
      : 0,
    restocked: i === 1 ? 20 : 0,
  }));

  return (
    <div className="rep-page">
      <div className="rep-header">
        <div>
          <h1 className="rep-title">Reports</h1>
          <p className="rep-subtitle">
            Reports pull live data directly from each module.
          </p>
        </div>
      </div>

      <div className="rep-selector-wrap">
        <div className="rep-form-group">
          <label className="rep-form-label">Report type</label>
          <select
            className="rep-select"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setGenerated(false);
            }}
          >
            <option value="monthly_summary">Monthly EHSS Summary Report</option>
            <option value="compliance">Compliance Status Report</option>
            <option value="costs">Cost Analysis Report</option>
            <option value="ppe">PPE Stock Report</option>
            <option value="ppe_trend">PPE Fast-Moving Items</option>
            <option value="sustainability">Sustainability Report</option>
            <option value="action_tracker">Action Tracker Report</option>
          </select>
        </div>
        {reportType === "ppe_trend" && (
          <div className="rep-form-group">
            <label className="rep-form-label">Select item</label>
            <select
              className="rep-select"
              value={selectedPPE}
              onChange={(e) => setSelectedPPE(e.target.value)}
            >
              {ppeItems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.item_name} — {p.size_spec}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="rep-btn-primary" onClick={() => setGenerated(true)}>
          Generate report
        </button>
      </div>

      {generated && (
        <div className="rep-preview">
          {reportType === "monthly_summary" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">
                    Monthly EHSS Summary Report
                  </div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>

              <div className="rep-section-title">Safety performance</div>
              <div className="rep-summary-cards">
                <div className="rep-card">
                  <div className="rep-card-label">Total incidents</div>
                  <div className="rep-card-value red">{totalIncidents}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Training hours</div>
                  <div className="rep-card-value">{totalTraining}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Records logged</div>
                  <div className="rep-card-value">{safetyRecords.length}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Fatalities</div>
                  <div className="rep-card-value green">0</div>
                </div>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Staff</th>
                    <th>MTI</th>
                    <th>LTI</th>
                    <th>TRIFR</th>
                    <th>LTIFR</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyRecords.map((r, i) => {
                    const wh = r.worked_hours;
                    const trifr = wh
                      ? ((r.medical_treatment_incidents +
                          r.lost_time_incidents +
                          r.fatalities) *
                          1000000) /
                        wh
                      : 0;
                    const ltifr = wh
                      ? (r.lost_time_incidents * 1000000) / wh
                      : 0;
                    return (
                      <tr
                        key={i}
                        className={
                          r.medical_treatment_incidents > 0 ||
                          r.lost_time_incidents > 0
                            ? "row-incident"
                            : ""
                        }
                      >
                        <td>{formatMonth(r.period)}</td>
                        <td>{r.staff_numbers}</td>
                        <td>{r.medical_treatment_incidents}</td>
                        <td>{r.lost_time_incidents}</td>
                        <td className={trifr > 0 ? "calc-alert" : ""}>
                          {trifr.toFixed(2)}
                        </td>
                        <td className={ltifr > 0 ? "calc-alert" : ""}>
                          {ltifr.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ height: 220, marginTop: "10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={safetyRecords.map((r) => {
                      const wh = r.worked_hours;
                      return {
                        month: formatMonth(r.period),
                        TRIFR: wh
                          ? +(
                              ((r.medical_treatment_incidents +
                                r.lost_time_incidents +
                                r.fatalities) *
                                1000000) /
                              wh
                            ).toFixed(2)
                          : 0,
                        LTIFR: wh
                          ? +((r.lost_time_incidents * 1000000) / wh).toFixed(2)
                          : 0,
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="TRIFR" fill="#c0392b" />
                    <Bar dataKey="LTIFR" fill="#1a5276" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rep-section-title" style={{ marginTop: "20px" }}>
                Cost summary
              </div>
              <div className="rep-summary-cards">
                <div className="rep-card">
                  <div className="rep-card-label">Total</div>
                  <div className="rep-card-value">{formatKES(totalCost)}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Statutory</div>
                  <div className="rep-card-value">{formatKES(statutory)}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Staff welfare</div>
                  <div className="rep-card-value">{formatKES(welfare)}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Outside budget</div>
                  <div
                    className={`rep-card-value ${outsideBudget > 0 ? "red" : "green"}`}
                  >
                    {formatKES(outsideBudget)}
                  </div>
                </div>
              </div>

              <div style={{ height: 220, marginBottom: "14px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        costRecords.reduce((acc, r) => {
                          acc[r.cost_type] =
                            (acc[r.cost_type] || 0) + r.cost_excl_vat;
                          return acc;
                        }, {}),
                      ).map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) =>
                        `${name}: ${formatKES(value)}`
                      }
                    >
                      {COST_PIE_COLORS.map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatKES(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rep-section-title" style={{ marginTop: "20px" }}>
                Compliance alerts
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...expired, ...expiring].map((c, i) => (
                    <tr key={i}>
                      <td>{c.requirement}</td>
                      <td>{c.date_of_expiry || "—"}</td>
                      <td>
                        <span
                          className={`rep-badge ${c.status === "Expired" ? "badge-expired" : "badge-expiring"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="rep-section-title" style={{ marginTop: "20px" }}>
                PPE stock alerts
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Stock</th>
                    <th>Reorder</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p, i) => (
                    <tr key={i}>
                      <td>{p.item_name}</td>
                      <td>{p.size_spec}</td>
                      <td>{p.current_stock}</td>
                      <td>{p.reorder_level}</td>
                      <td>
                        <span
                          className={`rep-badge ${p.current_stock === 0 ? "badge-expired" : "badge-expiring"}`}
                        >
                          {p.current_stock === 0 ? "Out of stock" : "Low stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {reportType === "compliance" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">
                    Compliance Status Report
                  </div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Organisation</th>
                    <th>Reference</th>
                    <th>Expiry</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceWithStatus.map((c, i) => (
                    <tr key={i}>
                      <td>{c.requirement}</td>
                      <td>{c.expert_organisation}</td>
                      <td>{c.reference_number || "—"}</td>
                      <td>{c.date_of_expiry || "—"}</td>
                      <td>
                        <span
                          className={`rep-badge ${c.status === "Expired" ? "badge-expired" : c.status === "Expiring soon" ? "badge-expiring" : c.status === "Valid" ? "badge-valid" : "badge-pending"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {reportType === "costs" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">Cost Analysis Report</div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <div
                className="rep-summary-cards"
                style={{ marginBottom: "16px" }}
              >
                <div className="rep-card">
                  <div className="rep-card-label">Total</div>
                  <div className="rep-card-value">{formatKES(totalCost)}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Statutory</div>
                  <div className="rep-card-value">{formatKES(statutory)}</div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Welfare</div>
                  <div className="rep-card-value">{formatKES(welfare)}</div>
                </div>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>PO</th>
                    <th>Date</th>
                    <th>Cost</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {costRecords.map((r, i) => (
                    <tr key={i}>
                      <td>{r.item_description}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "11px" }}>
                        {r.po_number}
                      </td>
                      <td>{r.date}</td>
                      <td style={{ fontWeight: 600 }}>
                        {formatKES(r.cost_excl_vat)}
                      </td>
                      <td>{r.cost_type}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f0f6fc", fontWeight: 600 }}>
                    <td colSpan="3">Total</td>
                    <td>{formatKES(totalCost)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              {/* Cost per month bar chart */}
              <div className="dash-panel" style={{ marginBottom: "16px" }}>
                <div className="dash-panel-title">
                  📊 Cost per month by type (KES)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={costByMonth}
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* X-axis = MONTHS */}
                    <XAxis dataKey="month" />

                    {/* Y-axis = AMOUNT */}
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />

                    <Tooltip
                      formatter={(v) => `KES ${Number(v).toLocaleString()}`}
                    />
                    <Legend />

                    <Bar
                      dataKey="statutory"
                      name="Statutory"
                      stackId="a"
                      fill={COST_COLORS.statutory}
                    />
                    <Bar
                      dataKey="staff_welfare"
                      name="Staff welfare"
                      stackId="a"
                      fill={COST_COLORS.staff_welfare}
                    />
                    <Bar
                      dataKey="ppe"
                      name="PPE provision"
                      stackId="a"
                      fill={COST_COLORS.ppe}
                    />
                    <Bar
                      dataKey="improvement"
                      name="Improvement"
                      stackId="a"
                      fill={COST_COLORS.improvement}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {reportType === "ppe" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">PPE Stock Report</div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Stock</th>
                    <th>Reorder</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeItems.map((p, i) => (
                    <tr key={i}>
                      <td>{p.item_name}</td>
                      <td>{p.size_spec}</td>
                      <td>{p.current_stock}</td>
                      <td>{p.reorder_level}</td>
                      <td>
                        <span
                          className={`rep-badge ${p.current_stock === 0 ? "badge-expired" : p.current_stock <= p.reorder_level ? "badge-expiring" : "badge-valid"}`}
                        >
                          {p.current_stock === 0
                            ? "Out of stock"
                            : p.current_stock <= p.reorder_level
                              ? "Low stock"
                              : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {reportType === "ppe_trend" && selectedItem && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">
                    PPE Fast-Moving Items — {selectedItem.item_name} (
                    {selectedItem.size_spec})
                  </div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Stock level</th>
                    <th>Restocked</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeMonthlyData.map((d, i) => (
                    <tr
                      key={i}
                      className={d.restocked > 0 ? "row-incident" : ""}
                    >
                      <td>{d.month}</td>
                      <td>{d.stock}</td>
                      <td>
                        {d.restocked > 0 ? `+${d.restocked} received` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ height: 220, marginTop: "10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ppeMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" name="Stock level" fill="#1a5276" />
                    <Bar dataKey="restocked" name="Restocked" fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>
                Note: Monthly trend connects to full transaction history once
                the PPE module's transaction log is shared system-wide.
              </p>
            </>
          )}

          {reportType === "sustainability" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">Sustainability Report</div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Water (m³)</th>
                    <th>Electricity (kWh)</th>
                    <th>Scope 1</th>
                    <th>Scope 2</th>
                    <th>Total emissions</th>
                  </tr>
                </thead>
                <tbody>
                  {sustainabilityRecords.map((r, i) => {
                    const s1 = calcScope1(r),
                      s2 = calcScope2(r);
                    return (
                      <tr key={i}>
                        <td>{formatMonth(r.period)}</td>
                        <td>{r.water_consumption_m3}</td>
                        <td>{r.electricity_kwh.toLocaleString()}</td>
                        <td>{s1.toFixed(2)}</td>
                        <td>{s2.toFixed(2)}</td>
                        <td>
                          <strong>{(s1 + s2).toFixed(2)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ height: 220, marginTop: "10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sustainabilityRecords.map((r) => ({
                      month: formatMonth(r.period),
                      Scope1: +calcScope1(r).toFixed(2),
                      Scope2: +calcScope2(r).toFixed(2),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Scope1" fill="#c0392b" />
                    <Bar dataKey="Scope2" fill="#1a5276" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {reportType === "action_tracker" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">Action Tracker Report</div>
                  <div className="rep-preview-meta">
                    Generated: {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  className="rep-btn-export"
                  onClick={() => window.print()}
                >
                  🖨 Print / Save as PDF
                </button>
              </div>
              <div className="rep-summary-cards">
                <div className="rep-card">
                  <div className="rep-card-label">Total</div>
                  <div className="rep-card-value">
                    {actiontrackerData.length}
                  </div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Completed</div>
                  <div className="rep-card-value green">
                    {
                      actiontrackerData.filter((a) => a.status === "Completed")
                        .length
                    }
                  </div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">In Progress</div>
                  <div className="rep-card-value amber">
                    {
                      actiontrackerData.filter(
                        (a) => a.status === "In Progress",
                      ).length
                    }
                  </div>
                </div>
                <div className="rep-card">
                  <div className="rep-card-label">Pending</div>
                  <div className="rep-card-value red">
                    {
                      actiontrackerData.filter((a) => a.status === "Pending")
                        .length
                    }
                  </div>
                </div>
              </div>
              <div style={{ height: 220, marginBottom: "14px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Completed",
                          value: actiontrackerData.filter(
                            (a) => a.status === "Completed",
                          ).length,
                        },
                        {
                          name: "In Progress",
                          value: actiontrackerData.filter(
                            (a) => a.status === "In Progress",
                          ).length,
                        },
                        {
                          name: "Pending",
                          value: actiontrackerData.filter(
                            (a) => a.status === "Pending",
                          ).length,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {PIE_COLORS.map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Concern</th>
                    <th>Action</th>
                    <th>Responsible</th>
                    <th>Target Date</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actiontrackerData.map((a, i) => (
                    <tr key={i}>
                      <td>{a.concern}</td>
                      <td>{a.action}</td>
                      <td>{a.responsible}</td>
                      <td>{a.targetDate}</td>
                      <td>{a.progress}%</td>
                      <td>
                        <span
                          className={`rep-badge ${a.status === "Completed" ? "badge-valid" : a.status === "In Progress" ? "badge-expiring" : "badge-expired"}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
