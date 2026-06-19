// SustainabilityPage.jsx
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
import "./SustainabilityPage.css";

const API_URL = "http://localhost:5000/api/sustainability";

// ── Calculations ─────────────────────────────────────────────
function formatMonth(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

const COLORS = ["#1a5276", "#27ae60", "#e67e22", "#c0392b", "#8e44ad"];

const emptyForm = {
  period: "",
  water_consumption_m3: "",
  water_recycled_m3: "",
  electricity_kwh: "",
  solar_kwh: "",
  firewood_tonnes: "",
  diesel_litres: "",
  petrol_litres: "",
  lpg_kg: "",
  paper_waste_kg: "",
  plastic_packaging_kg: "",
  hazardous_waste_kg: "",
  recyclable_plastic_kg: "",
};

export default function SustainabilityPage() {
  const [records, setRecords] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState({
    petrol: 0,
    diesel: 0,
    firewood: 0,
    lpg: 0,
    electricity: 0,
  });
  const [activeTab, setActiveTab] = useState("water");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) =>
        setRecords(
          data.map((r) => ({
            ...r,
            period: r.period?.split("T")[0],
          })),
        ),
      )
      .catch((err) =>
        console.error("Failed to fetch sustainability records:", err),
      );

    fetch(`${API_URL}/factors`)
      .then((res) => res.json())
      .then((data) => {
        const factorsObj = {};
        data.forEach((f) => {
          factorsObj[f.factor_name] = Number(f.value);
        });
        setEmissionFactors(factorsObj);
      })
      .catch((err) => console.error("Failed to fetch emission factors:", err));
  }, []);

  // ── Calculations ─────────────────────────────────────────────
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

  // ── Live calculations ─────────────────────────────────────
  const liveScope1 =
    form.petrol_litres ||
    form.diesel_litres ||
    form.firewood_tonnes ||
    form.lpg_kg
      ? calcScope1({
          petrol_litres: Number(form.petrol_litres) || 0,
          diesel_litres: Number(form.diesel_litres) || 0,
          firewood_tonnes: Number(form.firewood_tonnes) || 0,
          lpg_kg: Number(form.lpg_kg) || 0,
        }).toFixed(3)
      : null;

  const liveScope2 = form.electricity_kwh
    ? calcScope2({ electricity_kwh: Number(form.electricity_kwh) }).toFixed(3)
    : null;

  // ── Summary totals ────────────────────────────────────────
  const totalScope1 = records.reduce((s, r) => s + calcScope1(r), 0).toFixed(2);
  const totalScope2 = records.reduce((s, r) => s + calcScope2(r), 0).toFixed(2);
  const totalWater = records
    .reduce((s, r) => s + Number(r.water_consumption_m3), 0)
    .toFixed(2);
  const totalElec = records
    .reduce((s, r) => s + Number(r.electricity_kwh), 0)
    .toFixed(2);
  // ── Chart data ────────────────────────────────────────────
  const emissionsChartData = records.map((r) => {
    const scope1 = calcScope1(r);
    const scope2 = calcScope2(r);

    return {
      month: formatMonth(r.period),
      Scope1: Number(scope1.toFixed(2)),
      Scope2: Number(scope2.toFixed(2)),
    };
  });

  const wasteChartData = records.map((r) => ({
    month: formatMonth(r.period),
    Paper: r.paper_waste_kg,
    Plastic: r.plastic_packaging_kg,
    Hazardous: r.hazardous_waste_kg,
    Recyclable: r.recyclable_plastic_kg,
  }));

  const waterChartData = records.map((r) => ({
    month: formatMonth(r.period),
    Consumed: r.water_consumption_m3,
    Recycled: r.water_recycled_m3,
  }));

  const scope1PieData = [
    {
      name: "Petrol",
      value: parseFloat(
        records
          .reduce((s, r) => s + r.petrol_litres * emissionFactors.petrol, 0)
          .toFixed(2),
      ),
    },
    {
      name: "Diesel",
      value: parseFloat(
        records
          .reduce((s, r) => s + r.diesel_litres * emissionFactors.diesel, 0)
          .toFixed(2),
      ),
    },
    {
      name: "Firewood",
      value: parseFloat(
        records
          .reduce((s, r) => s + r.firewood_tonnes * emissionFactors.firewood, 0)
          .toFixed(2),
      ),
    },
    {
      name: "LPG",
      value: parseFloat(
        records
          .reduce((s, r) => s + r.lpg_kg * emissionFactors.lpg, 0)
          .toFixed(2),
      ),
    },
  ];

  // ── Handlers ─────────────────────────────────────────────
  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const e = {};
    if (!form.period) e.period = "Please select a month.";
    const dup = records.find((r) => r.period === form.period + "-01");
    if (dup) e.period = "A record for this month already exists.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const payload = {
      period: form.period + "-01",
      water_consumption_m3: Number(form.water_consumption_m3) || 0,
      water_recycled_m3: Number(form.water_recycled_m3) || 0,
      electricity_kwh: Number(form.electricity_kwh) || 0,
      solar_kwh: Number(form.solar_kwh) || 0,
      firewood_tonnes: Number(form.firewood_tonnes) || 0,
      diesel_litres: Number(form.diesel_litres) || 0,
      petrol_litres: Number(form.petrol_litres) || 0,
      lpg_kg: Number(form.lpg_kg) || 0,
      paper_waste_kg: Number(form.paper_waste_kg) || 0,
      plastic_packaging_kg: Number(form.plastic_packaging_kg) || 0,
      hazardous_waste_kg: Number(form.hazardous_waste_kg) || 0,
      recyclable_plastic_kg: Number(form.recyclable_plastic_kg) || 0,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newRecord = await res.json();

      setRecords(
        [
          ...records,
          { ...newRecord, period: newRecord.period?.split("T")[0] },
        ].sort((a, b) => new Date(a.period) - new Date(b.period)),
      );
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save sustainability record:", err);
    }
  }

  const tabs = ["water", "energy", "waste", "emissions"];

  return (
    <div className="sust-page">
      {showSuccess && (
        <div className="sust-banner">
          ✓ Monthly sustainability data saved. Scope 1 and Scope 2 emissions
          calculated automatically.
        </div>
      )}

      {/* Header */}
      <div className="sust-header">
        <div>
          <h1 className="sust-title">Sustainability</h1>
          <p className="sust-subtitle">
            Scope 1 and Scope 2 GHG emissions are calculated automatically from
            entered consumption data.
          </p>
        </div>
        <button
          className="sust-btn-primary"
          onClick={() => {
            setForm(emptyForm);
            setErrors({});
            setShowModal(true);
          }}
        >
          + Enter monthly data
        </button>
      </div>

      {/* Summary cards */}
      <div className="sust-cards">
        <div className="sust-card">
          <div className="sust-card-label">Scope 1 YTD (kgCO₂e)</div>
          <div className="sust-card-value amber">{totalScope1}</div>
        </div>
        <div className="sust-card">
          <div className="sust-card-label">Scope 2 YTD (kgCO₂e)</div>
          <div className="sust-card-value amber">{totalScope2}</div>
        </div>
        <div className="sust-card">
          <div className="sust-card-label">Total water (m³)</div>
          <div className="sust-card-value">{totalWater.toLocaleString()}</div>
        </div>
        <div className="sust-card">
          <div className="sust-card-label">Total electricity (kWh)</div>
          <div className="sust-card-value">{totalElec.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sust-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`sust-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── WATER TAB ── */}
      {activeTab === "water" && (
        <div className="sust-tab-content">
          <div className="sust-two-col">
            <div className="sust-panel">
              <div className="sust-panel-title">
                💧 Monthly water consumption vs recycled (m³)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={waterChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Consumed" fill="#1a5276" />
                  <Bar dataKey="Recycled" fill="#27ae60" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="sust-panel">
              <div className="sust-panel-title">💧 Water data table</div>
              <table className="sust-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Consumed (m³)</th>
                    <th>Recycled (m³)</th>
                    <th>Recycled %</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{formatMonth(r.period)}</td>
                      <td>{r.water_consumption_m3}</td>
                      <td>{r.water_recycled_m3}</td>
                      <td>
                        {(
                          (r.water_recycled_m3 / r.water_consumption_m3) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ENERGY TAB ── */}
      {activeTab === "energy" && (
        <div className="sust-tab-content">
          <div className="sust-panel">
            <div className="sust-panel-title">
              ⚡ Monthly energy consumption
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={records.map((r) => ({
                  month: formatMonth(r.period),
                  Electricity: r.electricity_kwh,
                  Solar: r.solar_kwh,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Electricity"
                  stroke="#1a5276"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Solar"
                  stroke="#27ae60"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="sust-panel" style={{ marginTop: "14px" }}>
            <div className="sust-panel-title">⚡ Energy data table</div>
            <table className="sust-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Electricity (kWh)</th>
                  <th>Solar (kWh)</th>
                  <th>Firewood (t)</th>
                  <th>Diesel (L)</th>
                  <th>Petrol (L)</th>
                  <th>LPG (kg)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{formatMonth(r.period)}</td>
                    <td>{r.electricity_kwh.toLocaleString()}</td>
                    <td>{r.solar_kwh.toLocaleString()}</td>
                    <td>{r.firewood_tonnes}</td>
                    <td>{r.diesel_litres.toLocaleString()}</td>
                    <td>{r.petrol_litres.toLocaleString()}</td>
                    <td>{r.lpg_kg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── WASTE TAB ── */}
      {activeTab === "waste" && (
        <div className="sust-tab-content">
          <div className="sust-two-col">
            <div className="sust-panel">
              <div className="sust-panel-title">
                🗑 Monthly waste by category (kg)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={wasteChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Paper" fill="#1a5276" stackId="a" />
                  <Bar dataKey="Plastic" fill="#e67e22" stackId="a" />
                  <Bar dataKey="Hazardous" fill="#c0392b" stackId="a" />
                  <Bar
                    dataKey="Recyclable"
                    fill="#27ae60"
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="sust-panel">
              <div className="sust-panel-title">🗑 Waste data table</div>
              <table className="sust-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Paper (kg)</th>
                    <th>Plastic (kg)</th>
                    <th>Hazardous (kg)</th>
                    <th>Recyclable (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{formatMonth(r.period)}</td>
                      <td>{r.paper_waste_kg.toLocaleString()}</td>
                      <td>{r.plastic_packaging_kg}</td>
                      <td>{r.hazardous_waste_kg}</td>
                      <td>{r.recyclable_plastic_kg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── EMISSIONS TAB ── */}
      {activeTab === "emissions" && (
        <div className="sust-tab-content">
          <div className="sust-two-col">
            <div className="sust-panel">
              <div className="sust-panel-title">
                🌿 Scope 1 sources breakdown (kgCO₂e)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={scope1PieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {scope1PieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="sust-panel">
              <div className="sust-panel-title">
                🌿 Monthly emissions — Scope 1 vs Scope 2 (kgCO₂e)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={emissionsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Scope1"
                    stroke="#c0392b"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Scope2"
                    stroke="#1a5276"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="sust-panel" style={{ marginTop: "14px" }}>
            <div className="sust-panel-title">🌿 Emissions data table</div>
            <table className="sust-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Petrol (kgCO₂e)</th>
                  <th>Diesel (kgCO₂e)</th>
                  <th>Firewood (kgCO₂e)</th>
                  <th>LPG (kgCO₂e)</th>
                  <th>Scope 1 total</th>
                  <th>Scope 2 (elec)</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const petrol = (
                    r.petrol_litres * emissionFactors.petrol
                  ).toFixed(3);
                  const diesel = (
                    r.diesel_litres * emissionFactors.diesel
                  ).toFixed(3);
                  const firewood = (
                    r.firewood_tonnes * emissionFactors.firewood
                  ).toFixed(3);
                  const lpg = (r.lpg_kg * emissionFactors.lpg).toFixed(3);
                  const scope1 = calcScope1(r);
                  const scope2 = calcScope2(r);
                  return (
                    <tr key={r.id}>
                      <td>{formatMonth(r.period)}</td>
                      <td>{petrol}</td>
                      <td>{diesel}</td>
                      <td>{firewood}</td>
                      <td>{lpg}</td>
                      <td>
                        <strong>{scope1.toFixed(3)}</strong>
                      </td>

                      <td>{scope2.toFixed(3)}</td>

                      <td>
                        <strong>{(scope1 + scope2).toFixed(3)}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="sust-modal-overlay">
          <div className="sust-modal">
            <h2 className="sust-modal-title">
              Enter monthly sustainability data
            </h2>

            {/* Live emission preview */}
            {(liveScope1 || liveScope2) && (
              <div className="sust-calc-preview">
                {liveScope1 && (
                  <span>
                    Scope 1 (calculated): <strong>{liveScope1} kgCO₂e</strong>
                  </span>
                )}
                {liveScope2 && (
                  <span>
                    Scope 2 (calculated): <strong>{liveScope2} kgCO₂e</strong>
                  </span>
                )}
              </div>
            )}

            <div className="sust-form-grid">
              <div className="sust-form-group full">
                <label className="sust-form-label">
                  Month <span className="required">*</span>
                </label>
                <input
                  className="sust-form-input"
                  type="month"
                  name="period"
                  value={form.period}
                  onChange={handleFormChange}
                />
                {errors.period && (
                  <div className="sust-field-error">{errors.period}</div>
                )}
              </div>

              <div className="sust-form-group">
                <label className="sust-form-label">Water consumed (m³)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="water_consumption_m3"
                  value={form.water_consumption_m3}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Water recycled (m³)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="water_recycled_m3"
                  value={form.water_recycled_m3}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Electricity (kWh)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="electricity_kwh"
                  value={form.electricity_kwh}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Solar (kWh)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="solar_kwh"
                  value={form.solar_kwh}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Firewood (tonnes)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="firewood_tonnes"
                  value={form.firewood_tonnes}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Diesel (litres)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="diesel_litres"
                  value={form.diesel_litres}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Petrol (litres)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="petrol_litres"
                  value={form.petrol_litres}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">LPG (kg)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="lpg_kg"
                  value={form.lpg_kg}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Paper waste (kg)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="paper_waste_kg"
                  value={form.paper_waste_kg}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">
                  Plastic packaging (kg)
                </label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="plastic_packaging_kg"
                  value={form.plastic_packaging_kg}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">Hazardous waste (kg)</label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="hazardous_waste_kg"
                  value={form.hazardious_waste_kg}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="sust-form-group">
                <label className="sust-form-label">
                  Recyclable plastic (kg)
                </label>
                <input
                  className="sust-form-input"
                  type="number"
                  name="recyclable_plastic_kg"
                  value={form.recyclable_plastic_kg}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="sust-form-group full">
                <label className="sust-form-label">
                  Scope 1 emissions (auto-calculated)
                </label>
                <div className="sust-form-readonly">
                  {liveScope1
                    ? `${liveScope1} kgCO₂e`
                    : "Enter fuel values above to calculate"}
                </div>
              </div>
              <div className="sust-form-group full">
                <label className="sust-form-label">
                  Scope 2 emissions (auto-calculated)
                </label>
                <div className="sust-form-readonly">
                  {liveScope2
                    ? `${liveScope2} kgCO₂e`
                    : "Enter electricity value above to calculate"}
                </div>
              </div>
            </div>

            <div className="sust-modal-buttons">
              <button
                className="sust-btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
              <button className="sust-btn-primary" onClick={handleSave}>
                Save data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
