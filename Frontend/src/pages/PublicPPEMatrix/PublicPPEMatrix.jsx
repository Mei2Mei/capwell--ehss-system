import { useEffect, useState } from "react";
import axios from "axios";
import "./PublicPPEMatrix.css";
import capwellLogo from "../../assets/capwell-logo.png";

const BASE = import.meta.env.VITE_API_URL;

export default function PublicPPEMatrix() {
  const [matrix, setMatrix] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [ppeItems, setPpeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE}/public/ppe-matrix`)
      .then((r) => {
        setMatrix(r.data.matrix);
        setDepartments(r.data.departments);
        setPpeItems(r.data.ppeItems);
      })
      .catch(() => setError("Failed to load PPE matrix."))
      .finally(() => setLoading(false));
  }, []);

  const getCellValue = (dept, item) => {
    const cell = matrix.find(
      (c) => c.department === dept && c.ppe_item === item,
    );
    return cell?.requirement || "none";
  };

  return (
    <div className="ppm-page">
      {/* Header */}
      <div className="ppm-topbar">
        <div className="ppm-logo-area">
          <img src={capwellLogo} alt="Capwell" className="pap-logo-img" />
          <div>
            <div className="ppm-logo-title">Capwell Industries</div>
            <div className="ppm-logo-sub">EHSS Management System</div>
          </div>
        </div>
        <div className="ppm-portal-label">PPE Matrix — Public View</div>
      </div>

      <div className="ppm-content">
        <div className="ppm-card">
          <h2 className="ppm-card-title">🦺 PPE Requirements Matrix</h2>
          <p className="ppm-card-sub">
            This matrix shows the PPE requirements for each department. ✓
            Mandatory items must be worn at all times. R Recommended items are
            advised based on task.
          </p>

          {/* Legend */}
          <div className="ppm-legend">
            <span className="ppm-badge badge-mandatory">✓ Mandatory</span>
            <span className="ppm-badge badge-recommended">R Recommended</span>
            <span className="ppm-badge badge-none">— Not Required</span>
          </div>

          {loading ? (
            <div className="ppm-empty">Loading matrix...</div>
          ) : error ? (
            <div className="ppm-error">{error}</div>
          ) : departments.length === 0 || ppeItems.length === 0 ? (
            <div className="ppm-empty">No PPE matrix data available.</div>
          ) : (
            <div className="ppm-table-wrap">
              <table className="ppm-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    {ppeItems.map((item) => (
                      <th key={item}>{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept}>
                      <td>
                        <strong>{dept}</strong>
                      </td>
                      {ppeItems.map((item) => {
                        const value = getCellValue(dept, item);
                        return (
                          <td key={item} className="ppm-cell">
                            <span className={`ppm-badge badge-${value}`}>
                              {value === "mandatory"
                                ? "✓"
                                : value === "recommended"
                                  ? "R"
                                  : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="ppm-footer">
        © {new Date().getFullYear()} Capwell Industries · EHSS Management System
      </div>
    </div>
  );
}
