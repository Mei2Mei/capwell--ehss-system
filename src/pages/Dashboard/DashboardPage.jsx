// ─────────────────────────────────────────────────────────────
// DashboardPage.jsx
// The home dashboard — first thing every user sees after login.
// Shows a real-time overview of the most critical EHSS data.
//
// Per Phase 2 FR-03 it shows:
// 1. KPI summary cards — costs, compliance, safety, PPE
// 2. Safety trend chart — monthly TRIFR/LTIFR
// 3. PPE alerts — items at or below reorder level
// 4. Upcoming calendar activities
// 5. Compliance expiry alerts
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ppeItems } from "../../data/ppeData";
import "./DashboardPage.css";

// ── Sample data ───────────────────────────────────────────────
// This will come from the backend API once connected.
// For now it mirrors the real Excel data from Phase 1 analysis.

const safetyData = [
  { month: "Jan", trifr: 0.0, ltifr: 0.0 },
  { month: "Feb", trifr: 18.1, ltifr: 9.0 },
  { month: "Mar", trifr: 0.0, ltifr: 0.0 },
  { month: "Apr", trifr: 0.0, ltifr: 0.0 },
];

const complianceAlerts = [
  { name: "NEMA EIA licence", expires: "28 Jun 2026", daysLeft: 24 },
  { name: "Fire safety certificate", expires: "01 Apr 2026", daysLeft: -64 },
  { name: "Lift inspection — Unit 2", expires: "15 Jun 2026", daysLeft: 11 },
];

const calendarActivities = [
  { name: "OSH Committee meeting", month: "Jun 2026", category: "Statutory" },
  {
    name: "Forklift safety training",
    month: "Jun 2026",
    category: "Best practice",
  },
  {
    name: "Chemical handling refresher",
    month: "Jul 2026",
    category: "Statutory",
  },
  { name: "Fire drill", month: "Jul 2026", category: "Statutory" },
  { name: "First aid refresher", month: "Aug 2026", category: "Best practice" },
];

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

// ── Helper ────────────────────────────────────────────────────
function getComplianceBadge(daysLeft) {
  if (daysLeft < 0) return { text: "Expired", cls: "comp-badge expired" };
  if (daysLeft <= 30)
    return { text: `${daysLeft}d left`, cls: "comp-badge expiring" };
  return { text: "Valid", cls: "comp-badge valid" };
}

// ── Simple bar chart drawn with CSS ──────────────────────────
// No chart library needed — just divs with calculated heights.
function SafetyBarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.trifr, d.ltifr)), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={i} className="chart-group">
            <div className="chart-bar-pair">
              <div
                className="chart-bar trifr"
                style={{ height: `${(d.trifr / maxVal) * 100}%` }}
                title={`TRIFR: ${d.trifr}`}
              />
              <div
                className="chart-bar ltifr"
                style={{ height: `${(d.ltifr / maxVal) * 100}%` }}
                title={`LTIFR: ${d.ltifr}`}
              />
            </div>
            <div className="chart-label">{d.month}</div>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span>
          <span className="legend-dot trifr-dot"></span>TRIFR
        </span>
        <span>
          <span className="legend-dot ltifr-dot"></span>LTIFR
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function DashboardPage() {
  const [alertTab, setAlertTab] = useState("compliance");

  // PPE calculations — from real ppeData
  const lowStockItems = ppeItems.filter(
    (i) => i.current_stock <= i.reorder_level && i.current_stock > 0,
  );
  const outOfStockItems = ppeItems.filter((i) => i.current_stock === 0);
  const ppeLowCount = lowStockItems.length + outOfStockItems.length;

  // Safety calculations
  const totalIncidents = safetyData.reduce(
    (sum, m) => sum + (m.trifr > 0 ? 1 : 0),
    0,
  );

  // Compliance calculations
  const expiringCount = complianceAlerts.filter(
    (c) => c.daysLeft >= 0 && c.daysLeft <= 30,
  ).length;
  const expiredCount = complianceAlerts.filter((c) => c.daysLeft < 0).length;

  return (
    <div className="dash-page">
      {/* ── Page header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">EHSS overview — updated in real time</p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: "#EBF5FB" }}>
            🧾
          </div>
          <div className="dash-card-body">
            <div className="dash-card-label">Total YTD cost</div>
            <div className="dash-card-value">KES 1.15M</div>
            <div className="dash-card-sub">All in budget · 2026</div>
          </div>
        </div>

        <div
          className={`dash-card ${expiredCount > 0 ? "card-danger" : expiringCount > 0 ? "card-warn" : ""}`}
        >
          <div className="dash-card-icon" style={{ background: "#FCEBEB" }}>
            ✅
          </div>
          <div className="dash-card-body">
            <div className="dash-card-label">Compliance alerts</div>
            <div
              className={`dash-card-value ${expiredCount > 0 ? "red" : "amber"}`}
            >
              {expiredCount > 0 ? expiredCount : expiringCount}
            </div>
            <div className="dash-card-sub">
              {expiredCount > 0
                ? `${expiredCount} expired`
                : `${expiringCount} expiring within 30 days`}
            </div>
          </div>
        </div>

        <div className={`dash-card ${totalIncidents > 0 ? "card-warn" : ""}`}>
          <div className="dash-card-icon" style={{ background: "#FAEEDA" }}>
            🛡️
          </div>
          <div className="dash-card-body">
            <div className="dash-card-label">Safety incidents YTD</div>
            <div
              className={`dash-card-value ${totalIncidents > 0 ? "amber" : "green"}`}
            >
              {totalIncidents}
            </div>
            <div className="dash-card-sub">Months with recorded incidents</div>
          </div>
        </div>

        <div className={`dash-card ${ppeLowCount > 0 ? "card-warn" : ""}`}>
          <div className="dash-card-icon" style={{ background: "#EAF3DE" }}>
            🦺
          </div>
          <div className="dash-card-body">
            <div className="dash-card-label">PPE needing attention</div>
            <div
              className={`dash-card-value ${ppeLowCount > 0 ? "amber" : "green"}`}
            >
              {ppeLowCount}
            </div>
            <div className="dash-card-sub">
              {outOfStockItems.length} out of stock · {lowStockItems.length} low
              stock
            </div>
          </div>
        </div>
      </div>

      {/* ── Two column section ── */}
      <div className="dash-two-col">
        {/* Safety chart */}
        <div className="dash-panel">
          <div className="dash-panel-title">📈 Monthly safety rates — 2026</div>
          <SafetyBarChart data={safetyData} />
          <div className="dash-panel-note">
            February spike — 1 MTI and 1 LTI recorded. All other months clear.
          </div>
        </div>

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

              <Tooltip formatter={(v) => `KES ${Number(v).toLocaleString()}`} />
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

        {/* Combined alerts panel with tabs */}
        <div className="dash-panel">
          <div className="dash-tabs">
            <button
              className={`dash-tab ${alertTab === "compliance" ? "active" : ""}`}
              onClick={() => setAlertTab("compliance")}
            >
              ⚠️ Compliance
            </button>
            <button
              className={`dash-tab ${alertTab === "ppe" ? "active" : ""}`}
              onClick={() => setAlertTab("ppe")}
            >
              🦺 PPE
            </button>
            <button
              className={`dash-tab ${alertTab === "calendar" ? "active" : ""}`}
              onClick={() => setAlertTab("calendar")}
            >
              📅 Upcoming
            </button>
          </div>

          {alertTab === "compliance" && (
            <div className="dash-alert-list">
              {complianceAlerts.map((item, i) => {
                const badge = getComplianceBadge(item.daysLeft);
                return (
                  <div
                    key={i}
                    className={`dash-alert-item ${item.daysLeft < 0 ? "alert-expired" : "alert-expiring"}`}
                  >
                    <div className="dash-alert-name">{item.name}</div>
                    <div className="dash-alert-meta">
                      <span>Expires {item.expires}</span>
                      <span className={badge.cls}>{badge.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {alertTab === "ppe" &&
            (ppeLowCount === 0 ? (
              <div className="dash-empty">
                ✓ All PPE items are well stocked.
              </div>
            ) : (
              <div className="dash-alert-list">
                {outOfStockItems.map((item) => (
                  <div key={item.id} className="dash-alert-item alert-expired">
                    <div className="dash-alert-name">
                      {item.item_name} — {item.size_spec}
                    </div>
                    <div className="dash-alert-meta">
                      <span>
                        Stock: {item.current_stock} {item.unit_of_measure}
                      </span>
                      <span className="comp-badge expired">Out of stock</span>
                    </div>
                  </div>
                ))}
                {lowStockItems.map((item) => (
                  <div key={item.id} className="dash-alert-item alert-expiring">
                    <div className="dash-alert-name">
                      {item.item_name} — {item.size_spec}
                    </div>
                    <div className="dash-alert-meta">
                      <span>
                        Stock: {item.current_stock} · Reorder at:{" "}
                        {item.reorder_level}
                      </span>
                      <span className="comp-badge expiring">Low stock</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {alertTab === "calendar" && (
            <div className="dash-calendar-list">
              {calendarActivities.map((act, i) => (
                <div key={i} className="dash-cal-item">
                  <div className="dash-cal-dot"></div>
                  <div className="dash-cal-body">
                    <div className="dash-cal-name">{act.name}</div>
                    <div className="dash-cal-meta">
                      {act.month} · {act.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
