// ─────────────────────────────────────────────────────────────
// PPEPage.jsx
// The PPE Inventory page for the EHSS Digital Management System.
//
// What this page does:
// 1. Shows three summary cards (total items, low stock, out of stock)
// 2. Shows a table of all PPE items with stock status badges
// 3. Highlights low stock rows in amber and out-of-stock rows in red
// 4. Has a button to record a stock transaction (received or issued)
// 5. Has a button to add a brand new PPE item to the system
// 6. After saving, the stock balance updates automatically
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { ppeItems as initialItems } from "../../data/ppeData";
import "./PPEPage.css";

// ── Helper functions ──────────────────────────────────────────

function getStockStatus(item) {
  if (item.current_stock === 0) return "out";
  if (item.current_stock <= item.reorder_level) return "low";
  return "ok";
}

function getRowClass(status) {
  if (status === "out") return "row-out";
  if (status === "low") return "row-low";
  return "row-normal";
}

function getStatusBadge(status) {
  if (status === "out") return { text: "Out of stock", className: "ppe-badge badge-out" };
  if (status === "low") return { text: "Low stock",    className: "ppe-badge badge-low" };
  return                       { text: "OK",           className: "ppe-badge badge-ok"  };
}

// ── Main component ────────────────────────────────────────────

function PPEPage() {

  const [items, setItems] = useState(initialItems);

  // Controls which modal is open
  // null = none, "transaction" = record stock, "addItem" = add new item
  const [modalType, setModalType] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Transaction form state
  const [txForm, setTxForm] = useState({
    ppe_item_id: "",
    transaction_type: "",
    quantity: "",
    date: "",
    notes: "",
  });

  // Add new item form state
  const [itemForm, setItemForm] = useState({
    item_name: "",
    size_spec: "",
    unit_of_measure: "pcs",
    reorder_level: "",
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // ── Summary calculations ──────────────────────────────────
 const filteredItems = items.filter(item =>
  item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.size_spec.toLowerCase().includes(searchTerm.toLowerCase())
);
const totalItems      = filteredItems.length;
const lowStockCount   = filteredItems.filter(i => i.current_stock <= i.reorder_level && i.current_stock > 0).length;
const outOfStockCount = filteredItems.filter(i => i.current_stock === 0).length;

  // ── Success banner helper ─────────────────────────────────
  function showBanner(message) {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  // ── Transaction form handlers ─────────────────────────────

  function handleTxChange(e) {
    setTxForm({ ...txForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validateTx() {
    const e = {};
    if (!txForm.ppe_item_id)      e.ppe_item_id = "Please select a PPE item.";
    if (!txForm.transaction_type) e.transaction_type = "Please select a transaction type.";
    if (!txForm.quantity || isNaN(txForm.quantity) || Number(txForm.quantity) <= 0)
      e.quantity = "Quantity must be a positive number.";
    if (!txForm.date) e.date = "Please enter a date.";

    if (txForm.transaction_type === "issued" && txForm.ppe_item_id && txForm.quantity) {
      const selected = items.find(i => i.id === Number(txForm.ppe_item_id));
      if (selected && Number(txForm.quantity) > selected.current_stock)
        e.quantity = `Cannot issue more than current stock (${selected.current_stock} ${selected.unit_of_measure}).`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleTxSave() {
    if (!validateTx()) return;
    const id  = Number(txForm.ppe_item_id);
    const qty = Number(txForm.quantity);
    setItems(items.map(item => {
      if (item.id === id) {
        const newStock = txForm.transaction_type === "received"
          ? item.current_stock + qty
          : item.current_stock - qty;
        return { ...item, current_stock: newStock };
      }
      return item;
    }));
    setModalType(null);
    setTxForm({ ppe_item_id: "", transaction_type: "", quantity: "", date: "", notes: "" });
    setErrors({});
    showBanner("Stock transaction recorded successfully. Balance has been updated.");
  }

  // ── Add new item form handlers ────────────────────────────

  function handleItemChange(e) {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validateItem() {
    const e = {};
    if (!itemForm.item_name.trim())  e.item_name = "Item name is required.";
    if (!itemForm.size_spec.trim())  e.size_spec = "Size or specification is required.";
    if (!itemForm.unit_of_measure.trim()) e.unit_of_measure = "Unit of measure is required.";

    // Check for duplicate — same item name AND same size already exists
    const duplicate = items.find(
      i => i.item_name.toLowerCase() === itemForm.item_name.toLowerCase() &&
           i.size_spec.toLowerCase()  === itemForm.size_spec.toLowerCase()
    );
    if (duplicate) e.size_spec = "This item and size combination already exists.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleItemSave() {
    if (!validateItem()) return;

    // Create a new item object
    // id is generated from the highest existing id + 1
    const newItem = {
      id: Math.max(...items.map(i => i.id)) + 1,
      item_name: itemForm.item_name.trim(),
      size_spec: itemForm.size_spec.trim(),
      unit_of_measure: itemForm.unit_of_measure.trim(),
      reorder_level: itemForm.reorder_level ? Number(itemForm.reorder_level) : 0,
      current_stock: 0, // new items always start with zero stock
    };

    setItems([...items, newItem]);
    setModalType(null);
    setItemForm({ item_name: "", size_spec: "", unit_of_measure: "pcs", reorder_level: "" });
    setErrors({});
    showBanner(`New PPE item "${newItem.item_name} — ${newItem.size_spec}" added successfully. Current stock is 0 — record a received transaction to add stock.`);
  }

  function handleCloseModal() {
    setModalType(null);
    setTxForm({ ppe_item_id: "", transaction_type: "", quantity: "", date: "", notes: "" });
    setItemForm({ item_name: "", size_spec: "", unit_of_measure: "pcs", reorder_level: "" });
    setErrors({});
  }

  // ── Calculate new balance for transaction form ────────────
  const newBalance = (() => {
    if (!txForm.ppe_item_id || !txForm.quantity || !txForm.transaction_type) return null;
    const item = items.find(i => i.id === Number(txForm.ppe_item_id));
    if (!item) return null;
    const qty = Number(txForm.quantity);
    const nb = txForm.transaction_type === "received"
      ? item.current_stock + qty
      : item.current_stock - qty;
    return `${nb} ${item.unit_of_measure}`;
  })();

  // ── JSX ───────────────────────────────────────────────────
  return (
    <div className="ppe-page">

      {/* Success banner */}
      {showSuccess && (
        <div className="ppe-success-banner">✓ {successMessage}</div>
      )}

      {/* Page header */}
      <div className="ppe-header">
        <h1 className="ppe-title">PPE Inventory</h1>
        <div className="ppe-header-buttons">
          <button className="ppe-btn-secondary" onClick={() => { setErrors({}); setModalType("addItem"); }}>
            + Add new item
          </button>
          <button className="ppe-btn-primary" onClick={() => { setErrors({}); setModalType("transaction"); }}>
            + Record transaction
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="ppe-search-wrap">
        <input
          type="text"
          placeholder="Search by item name or size..."
          className="ppe-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Summary cards */}
      <div className="ppe-cards">
        <div className="ppe-card">
          <div className="ppe-card-label">Total items tracked</div>
          <div className="ppe-card-value">{totalItems}</div>
        </div>
        <div className="ppe-card">
          <div className="ppe-card-label">Items at / below reorder level</div>
          <div className={`ppe-card-value ${lowStockCount > 0 ? "amber" : ""}`}>{lowStockCount}</div>
        </div>
        <div className="ppe-card">
          <div className="ppe-card-label">Out of stock</div>
          <div className={`ppe-card-value ${outOfStockCount > 0 ? "red" : ""}`}>{outOfStockCount}</div>
        </div>
      </div>

      {/* PPE table */}
      <div className="ppe-table-wrap">
        <table className="ppe-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item name</th>
              <th>Size / spec</th>
              <th>Unit</th>
              <th>Current stock</th>
              <th>Reorder level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const status = getStockStatus(item);
              const badge  = getStatusBadge(status);
              return (
                <tr key={item.id} className={getRowClass(status)}>
                  <td>{index + 1}</td>
                  <td>{item.item_name}</td>
                  <td>{item.size_spec}</td>
                  <td>{item.unit_of_measure}</td>
                  <td><strong>{item.current_stock}</strong></td>
                  <td>{item.reorder_level || "—"}</td>
                  <td><span className={badge.className}>{badge.text}</span></td>
                  <td>
                    <button
                      className="ppe-btn-sm"
                      onClick={() => {
                        setTxForm({ ...txForm, ppe_item_id: String(item.id) });
                        setErrors({});
                        setModalType("transaction");
                      }}
                    >
                      {item.current_stock === 0 ? "Receive" : "Issue / Receive"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="ppe-legend">
        <span>
          <span className="ppe-legend-dot" style={{ background: "#fef9f0", border: "1px solid #e8c97a" }}></span>
          Low stock (at or below reorder level)
        </span>
        <span>
          <span className="ppe-legend-dot" style={{ background: "#fdf3f3", border: "1px solid #e8a0a0" }}></span>
          Out of stock
        </span>
      </div>

      {/* ── TRANSACTION MODAL ── */}
      {modalType === "transaction" && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal">
            <h2 className="ppe-modal-title">Record stock transaction</h2>

            <div className="ppe-form-group">
              <label className="ppe-form-label">PPE item <span className="required">*</span></label>
              <select className="ppe-form-select" name="ppe_item_id" value={txForm.ppe_item_id} onChange={handleTxChange}>
                <option value="">Select item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} — {item.size_spec} (stock: {item.current_stock})
                  </option>
                ))}
              </select>
              {errors.ppe_item_id && <div className="ppe-field-error">{errors.ppe_item_id}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Transaction type <span className="required">*</span></label>
              <select className="ppe-form-select" name="transaction_type" value={txForm.transaction_type} onChange={handleTxChange}>
                <option value="">Select type...</option>
                <option value="received">Received — stock coming in</option>
                <option value="issued">Issued — stock going out to staff</option>
              </select>
              {errors.transaction_type && <div className="ppe-field-error">{errors.transaction_type}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Quantity <span className="required">*</span></label>
              <input className="ppe-form-input" type="number" name="quantity" value={txForm.quantity} onChange={handleTxChange} placeholder="Enter quantity" min="1" />
              {errors.quantity && <div className="ppe-field-error">{errors.quantity}</div>}
            </div>

            {newBalance !== null && (
              <div className="ppe-form-group">
                <label className="ppe-form-label">New stock balance (auto-calculated)</label>
                <div className="ppe-form-readonly">{newBalance}</div>
              </div>
            )}

            <div className="ppe-form-group">
              <label className="ppe-form-label">Date <span className="required">*</span></label>
              <input className="ppe-form-input" type="date" name="date" value={txForm.date} onChange={handleTxChange} />
              {errors.date && <div className="ppe-field-error">{errors.date}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Notes (optional)</label>
              <input className="ppe-form-input" type="text" name="notes" value={txForm.notes} onChange={handleTxChange} placeholder="e.g. Issued to Mill 2 staff" />
            </div>

            <div className="ppe-modal-buttons">
              <button className="ppe-btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="ppe-btn-primary" onClick={handleTxSave}>Save transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW ITEM MODAL ── */}
      {modalType === "addItem" && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal">
            <h2 className="ppe-modal-title">Add new PPE item</h2>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Item name <span className="required">*</span></label>
              <input
                className="ppe-form-input"
                type="text"
                name="item_name"
                value={itemForm.item_name}
                onChange={handleItemChange}
                placeholder="e.g. N/Blue Reflectors Overall"
              />
              {errors.item_name && <div className="ppe-field-error">{errors.item_name}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Size / specification <span className="required">*</span></label>
              <input
                className="ppe-form-input"
                type="text"
                name="size_spec"
                value={itemForm.size_spec}
                onChange={handleItemChange}
                placeholder="e.g. XL, L, M, One size"
              />
              {errors.size_spec && <div className="ppe-field-error">{errors.size_spec}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Unit of measure <span className="required">*</span></label>
              <select className="ppe-form-select" name="unit_of_measure" value={itemForm.unit_of_measure} onChange={handleItemChange}>
                <option value="pcs">pcs (pieces)</option>
                <option value="pairs">pairs</option>
                <option value="boxes">boxes</option>
                <option value="rolls">rolls</option>
              </select>
              {errors.unit_of_measure && <div className="ppe-field-error">{errors.unit_of_measure}</div>}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Reorder level (optional)</label>
              <input
                className="ppe-form-input"
                type="number"
                name="reorder_level"
                value={itemForm.reorder_level}
                onChange={handleItemChange}
                placeholder="e.g. 10 — alert when stock falls to this number"
                min="0"
              />
              <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                Leave blank if you do not want a low stock alert for this item.
              </div>
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Starting stock</label>
              <div className="ppe-form-readonly">
                0 — new items always start at zero. Use "Record transaction" to add stock.
              </div>
            </div>

            <div className="ppe-modal-buttons">
              <button className="ppe-btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button className="ppe-btn-primary" onClick={handleItemSave}>Add item</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PPEPage;
