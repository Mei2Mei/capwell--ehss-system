import { useState } from "react";
import "./ReportsPage.css";

const safetyData = [
  {
    month: "Jan 2026",
    staff: 569,
    hours: 109248,
    mti: 0,
    lti: 0,
    days: 0,
    training: 2,
    inspections: 3,
    trifr: 0,
    ltifr: 0,
    severity: 0,
  },
  {
    month: "Feb 2026",
    staff: 576,
    hours: 110592,
    mti: 1,
    lti: 1,
    days: 14,
    training: 7,
    inspections: 5,
    trifr: 18.08,
    ltifr: 9.04,
    severity: 126.59,
  },
  {
    month: "Mar 2026",
    staff: 586,
    hours: 112512,
    mti: 0,
    lti: 0,
    days: 0,
    training: 64,
    inspections: 7,
    trifr: 0,
    ltifr: 0,
    severity: 0,
  },
  {
    month: "Apr 2026",
    staff: 563,
    hours: 108096,
    mti: 0,
    lti: 0,
    days: 0,
    training: 2,
    inspections: 4,
    trifr: 0,
    ltifr: 0,
    severity: 0,
  },
];

const costsData = [
  {
    item: "Disposal of hazardous waste",
    po: "PO18983",
    date: "12 Jan 2026",
    cost: 125000,
    type: "Statutory requirement",
  },
  {
    item: "Whitewash multi purpose soap",
    po: "PO18984",
    date: "12 Jan 2026",
    cost: 314136,
    type: "Staff welfare",
  },
  {
    item: "Statutory inspections",
    po: "PO18986",
    date: "12 Jan 2026",
    cost: 220000,
    type: "Statutory requirement",
  },
  {
    item: "Statutory inspection — retort",
    po: "PO18985",
    date: "12 Jan 2026",
    cost: 10000,
    type: "Statutory requirement",
  },
  {
    item: "PVC gloves, leather gloves",
    po: "PO19363",
    date: "29 Jan 2026",
    cost: 47500,
    type: "Staff welfare",
  },
  {
    item: "Farmer's hats",
    po: "PO19362",
    date: "29 Jan 2026",
    cost: 45259,
    type: "Staff welfare",
  },
  {
    item: "NEMA renewal — EIA licence",
    po: "PO19364",
    date: "31 Jan 2026",
    cost: 355000,
    type: "Statutory requirement",
  },
];

const complianceAlerts = [
  { name: "NEMA EIA licence", expires: "28 Jun 2026", status: "Expiring soon" },
  {
    name: "Fire safety certificate",
    expires: "01 Apr 2026",
    status: "Expired",
  },
  {
    name: "Lift inspection — Unit 2",
    expires: "15 Jun 2026",
    status: "Expiring soon",
  },
];

const ppeLowStock = [
  { item: "N/Blue Reflectors Overall", size: "XXXL", stock: 3, reorder: 10 },
  { item: "N/Blue Reflectors Overall", size: "L", stock: 8, reorder: 10 },
  { item: "N/Blue Reflectors Overall", size: "M", stock: 0, reorder: 10 },
  { item: "Farmer's Hats", size: "One size", stock: 5, reorder: 20 },
  { item: "Beige Scrub", size: "XL", stock: 0, reorder: 8 },
];

function formatKES(n) {
  return `KES ${Number(n).toLocaleString()}`;
}

function ReportsPage() {
  const [reportType, setReportType] = useState("monthly_summary");
  const [generated, setGenerated] = useState(false);

  const totalCost = costsData.reduce((s, r) => s + r.cost, 0);
  const statutory = costsData
    .filter((r) => r.type === "Statutory requirement")
    .reduce((s, r) => s + r.cost, 0);
  const welfare = costsData
    .filter((r) => r.type === "Staff welfare")
    .reduce((s, r) => s + r.cost, 0);
  const totalIncidents = safetyData.reduce((s, r) => s + r.mti + r.lti, 0);
  const totalTraining = safetyData.reduce((s, r) => s + r.training, 0);

  return (
    <div className="rep-page">
      <div className="rep-header">
        <div>
          <h1 className="rep-title">Reports</h1>
          <p className="rep-subtitle">
            Generate and export EHSS summary reports.
          </p>
        </div>
      </div>

      {/* Report selector */}
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
          </select>
        </div>
        <button className="rep-btn-primary" onClick={() => setGenerated(true)}>
          Generate report
        </button>
      </div>

      {/* Report preview */}
      {generated && (
        <div className="rep-preview">
          {/* ── MONTHLY SUMMARY ── */}
          {reportType === "monthly_summary" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">
                    Monthly EHSS Summary Report
                  </div>
                  <div className="rep-preview-meta">
                    Period: January — April 2026 &nbsp;·&nbsp; Generated:{" "}
                    {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
                <div className="rep-actions">
                  <button
                    className="rep-btn-export"
                    onClick={() => window.print()}
                  >
                    🖨 Print / Save as PDF
                  </button>
                </div>
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
                  <div className="rep-card-label">TRIFR average</div>
                  <div className="rep-card-value amber">4.52</div>
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
                    <th>Hours</th>
                    <th>MTI</th>
                    <th>LTI</th>
                    <th>Days lost</th>
                    <th>Training hrs</th>
                    <th>TRIFR</th>
                    <th>LTIFR</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyData.map((r, i) => (
                    <tr
                      key={i}
                      className={r.mti > 0 || r.lti > 0 ? "row-incident" : ""}
                    >
                      <td>{r.month}</td>
                      <td>{r.staff}</td>
                      <td>{r.hours.toLocaleString()}</td>
                      <td>{r.mti}</td>
                      <td>{r.lti}</td>
                      <td>{r.days}</td>
                      <td>{r.training}</td>
                      <td className={r.trifr > 0 ? "calc-alert" : ""}>
                        {r.trifr.toFixed(2)}
                      </td>
                      <td className={r.ltifr > 0 ? "calc-alert" : ""}>
                        {r.ltifr.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="rep-section-title" style={{ marginTop: "20px" }}>
                Cost summary
              </div>
              <div className="rep-summary-cards">
                <div className="rep-card">
                  <div className="rep-card-label">Total YTD</div>
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
                  <div className="rep-card-value green">KES 0</div>
                </div>
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
                  {complianceAlerts.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.expires}</td>
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
                    <th>Current stock</th>
                    <th>Reorder level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeLowStock.map((p, i) => (
                    <tr key={i}>
                      <td>{p.item}</td>
                      <td>{p.size}</td>
                      <td>{p.stock}</td>
                      <td>{p.reorder}</td>
                      <td>
                        <span
                          className={`rep-badge ${p.stock === 0 ? "badge-expired" : "badge-expiring"}`}
                        >
                          {p.stock === 0 ? "Out of stock" : "Low stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ── COMPLIANCE REPORT ── */}
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
                    <th>Expiry date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceAlerts.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.expires}</td>
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
            </>
          )}

          {/* ── COSTS REPORT ── */}
          {reportType === "costs" && (
            <>
              <div className="rep-preview-header">
                <div>
                  <div className="rep-preview-title">
                    Cost Analysis Report — 2026
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
                    <th>PO number</th>
                    <th>Date</th>
                    <th>Cost (KES)</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {costsData.map((r, i) => (
                    <tr key={i}>
                      <td>{r.item}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "11px" }}>
                        {r.po}
                      </td>
                      <td>{r.date}</td>
                      <td style={{ fontWeight: 600 }}>{formatKES(r.cost)}</td>
                      <td>{r.type}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f0f6fc", fontWeight: 600 }}>
                    <td colSpan="3">Total</td>
                    <td>{formatKES(totalCost)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* ── PPE REPORT ── */}
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
                    <th>Current stock</th>
                    <th>Reorder level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ppeLowStock.map((p, i) => (
                    <tr key={i}>
                      <td>{p.item}</td>
                      <td>{p.size}</td>
                      <td>{p.stock}</td>
                      <td>{p.reorder}</td>
                      <td>
                        <span
                          className={`rep-badge ${p.stock === 0 ? "badge-expired" : "badge-expiring"}`}
                        >
                          {p.stock === 0 ? "Out of stock" : "Low stock"}
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

export default ReportsPage;
