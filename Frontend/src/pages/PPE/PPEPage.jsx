// ─────────────────────────────────────────────────────────────
// PPEPage.jsx — EHSS PPE Inventory Page
// Full version with:
// - Summary cards
// - Search filter
// - Stock table with status badges
// - Add new item form
// - Record transaction form with live balance
// - Transaction history per item (expandable row)
// - Edit reorder level inline
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import "./PPEPage.css";

const API_URL = `${import.meta.env.VITE_API_URL}/ppe`;

// ── Helpers ───────────────────────────────────────────────────

function getStockStatus(item) {
  if (item.current_stock === 0) return "out";
  if (item.current_stock <= item.reorder_level) return "low";
  return "ok";
}
function getRowClass(s) {
  if (s === "out") return "row-out";
  if (s === "low") return "row-low";
  return "row-normal";
}
function getStatusBadge(s) {
  if (s === "out")
    return { text: "Out of stock", className: "ppe-badge badge-out" };
  if (s === "low")
    return { text: "Low stock", className: "ppe-badge badge-low" };
  return { text: "OK", className: "ppe-badge badge-ok" };
}
function getAvailableStock(item) {
  return item.current_stock - (item.reserved_stock || 0);
}

// Format a date string nicely e.g. 2026-01-15 -> 15 Jan 2026
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────

function PPEPage() {
  console.log("PPEPage loaded");
  const canViewStock = () => true; // replace with real permission check later
  const canApprove = () => true; // replace with: role === "ehss_officer" when login is added

  const [items, setItems] = useState([]);

  // Stores all transactions ever recorded
  // Each transaction links to an item via ppe_item_id
  const [transactions, setTransactions] = useState([]);

  // Which item row is expanded to show transaction history
  // null = none expanded, otherwise stores the item id
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Which modal is open: null | "transaction" | "addItem"
  const [modalType, setModalType] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Transaction form
  const [txForm, setTxForm] = useState({
    ppe_item_id: "",
    transaction_type: "",
    quantity: "",
    date: "",
    notes: "",
  });

  // Add item form
  const [itemForm, setItemForm] = useState({
    item_name: "",
    size_spec: "",
    unit_of_measure: "pcs",
    reorder_level: "",
  });

  // Reorder level inline edit
  // Stores { itemId, value } when editing, null when not
  const [editingReorder, setEditingReorder] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // stores request id being rejected
  const [rejectReason, setRejectReason] = useState("");

  const [errors, setErrors] = useState({});

  const [requests, setRequests] = useState([]);

  const [requestForm, setRequestForm] = useState({
    item_id: "",
    quantity: "",
    worker_name: "",
    department: "",
    requested_by: "Supervisor",
    status: "pending",
  });

  // ── Filtered items for search ─────────────────────────────
  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size_spec.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Summary cards (based on filtered list) ────────────────
  const totalItems = filteredItems.length;
  const lowStockCount = filteredItems.filter(
    (i) => i.current_stock <= i.reorder_level && i.current_stock > 0,
  ).length;
  const outOfStockCount = filteredItems.filter(
    (i) => i.current_stock === 0,
  ).length;

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to fetch PPE items:", err));

    fetch(`${API_URL}/transactions`)
      .then((res) => res.json())
      .then((data) =>
        setTransactions(
          data.map((tx) => ({
            ...tx,
            date: tx.transaction_date?.split("T")[0],
          })),
        ),
      )
      .catch((err) => console.error("Failed to fetch transactions:", err));

    fetch(`${API_URL}/requests`)
      .then((res) => res.json())
      .then((data) =>
        setRequests(
          data.map((r) => ({
            ...r,
            item_id: r.ppe_item_id,
            date: r.requested_at,
          })),
        ),
      )
      .catch((err) => console.error("Failed to fetch PPE requests:", err));
  }, []);

  // ── Success banner ────────────────────────────────────────
  function showBanner(message) {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  }

  // ── Transaction history for a specific item ───────────────
  function getItemTransactions(itemId) {
    return transactions.filter((tx) => tx.ppe_item_id === itemId);
  }

  // Toggle expand/collapse transaction history for a row
  function toggleHistory(itemId) {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  }

  // ── Transaction form ──────────────────────────────────────
  function handleTxChange(e) {
    setTxForm({ ...txForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validateTx() {
    const e = {};
    if (!txForm.ppe_item_id) e.ppe_item_id = "Please select a PPE item.";
    if (!txForm.transaction_type)
      e.transaction_type = "Please select a transaction type.";
    if (
      !txForm.quantity ||
      isNaN(txForm.quantity) ||
      Number(txForm.quantity) <= 0
    )
      e.quantity = "Quantity must be a positive number.";
    if (!txForm.date) e.date = "Please enter a date.";
    if (
      txForm.transaction_type === "issued" &&
      txForm.ppe_item_id &&
      txForm.quantity
    ) {
      const sel = items.find((i) => i.id === Number(txForm.ppe_item_id));
      if (sel && Number(txForm.quantity) > sel.current_stock)
        e.quantity = `Cannot issue more than current stock (${sel.current_stock} ${sel.unit_of_measure}).`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleTxSave() {
    if (!validateTx()) return;
    const id = Number(txForm.ppe_item_id);
    const qty = Number(txForm.quantity);

    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ppe_item_id: id,
          transaction_type: txForm.transaction_type,
          quantity: qty,
          transaction_date: txForm.date,
          notes: txForm.notes,
          recorded_by: "Linda", // will come from logged-in user later
        }),
      });
      const newTx = await res.json();

      // Refresh the item's stock from backend (since stock was updated server-side)
      const itemRes = await fetch(`${API_URL}/${id}`);
      const updatedItem = await itemRes.json();
      setItems(items.map((item) => (item.id === id ? updatedItem : item)));

      // Add to transaction history
      setTransactions([
        ...transactions,
        { ...newTx, date: newTx.transaction_date?.split("T")[0] },
      ]);

      // Auto-expand the history for this item after recording
      setExpandedItemId(id);

      setModalType(null);
      setTxForm({
        ppe_item_id: "",
        transaction_type: "",
        quantity: "",
        date: "",
        notes: "",
      });
      setErrors({});
      showBanner(
        "Transaction recorded. Stock balance updated. History expanded below.",
      );
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  }

  // ── Add new item form ─────────────────────────────────────
  function handleItemChange(e) {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validateItem() {
    const e = {};
    if (!itemForm.item_name.trim()) e.item_name = "Item name is required.";
    if (!itemForm.size_spec.trim())
      e.size_spec = "Size or specification is required.";
    if (!itemForm.unit_of_measure.trim())
      e.unit_of_measure = "Unit of measure is required.";
    const dup = items.find(
      (i) =>
        i.item_name.toLowerCase() === itemForm.item_name.toLowerCase() &&
        i.size_spec.toLowerCase() === itemForm.size_spec.toLowerCase(),
    );
    if (dup) e.size_spec = "This item and size combination already exists.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleItemSave() {
    if (!validateItem()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: itemForm.item_name.trim(),
          size_spec: itemForm.size_spec.trim(),
          unit_of_measure: itemForm.unit_of_measure.trim(),
          reorder_level: itemForm.reorder_level
            ? Number(itemForm.reorder_level)
            : 0,
        }),
      });
      const newItem = await res.json();

      setItems([...items, newItem]);
      setModalType(null);
      setItemForm({
        item_name: "",
        size_spec: "",
        unit_of_measure: "pcs",
        reorder_level: "",
      });
      setErrors({});
      showBanner(
        `"${newItem.item_name} — ${newItem.size_spec}" added. Current stock is 0 — record a received transaction to add stock.`,
      );
    } catch (err) {
      console.error("Failed to add PPE item:", err);
    }
  }

  function handleCloseModal() {
    setModalType(null);
    setTxForm({
      ppe_item_id: "",
      transaction_type: "",
      quantity: "",
      date: "",
      notes: "",
    });
    setItemForm({
      item_name: "",
      size_spec: "",
      unit_of_measure: "pcs",
      reorder_level: "",
    });
    setErrors({});
  }

  function handleRequestChange(e) {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  }

  async function handleRequestSave() {
    if (!requestForm.item_id) {
      showBanner("Please select a PPE item.");
      return;
    }
    if (!requestForm.quantity || Number(requestForm.quantity) <= 0) {
      showBanner("Please enter a valid quantity.");
      return;
    }
    if (!requestForm.worker_name.trim()) {
      showBanner("Please enter the worker name.");
      return;
    }
    if (!requestForm.department.trim()) {
      showBanner("Please enter the department.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ppe_item_id: Number(requestForm.item_id),
          requested_by: 1, // placeholder until login is added
          quantity: Number(requestForm.quantity),
          notes: "",
          worker_name: requestForm.worker_name,
          department: requestForm.department,
        }),
      });
      const newRequest = await res.json();

      setRequests([
        ...requests,
        {
          ...newRequest,
          item_id: newRequest.ppe_item_id,
          date: newRequest.requested_at,
        },
      ]);

      setRequestForm({
        item_id: "",
        quantity: "",
        worker_name: "",
        department: "",
        requested_by: "Supervisor",
        status: "pending",
      });

      setModalType(null);
      showBanner("PPE request created successfully.");
    } catch (err) {
      console.error("Failed to create PPE request:", err);
    }
  }

  async function handleApproveRequest(requestId) {
    try {
      const res = await fetch(`${API_URL}/requests/${requestId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_by: 1 }), // placeholder until login
      });

      if (!res.ok) {
        const errData = await res.json();
        showBanner(errData.error || "Failed to approve request.");
        return;
      }

      const updated = await res.json();

      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: updated.status } : r,
        ),
      );

      // Refresh item to reflect new reserved_stock
      const request = requests.find((r) => r.id === requestId);
      const itemRes = await fetch(`${API_URL}/${request.item_id}`);
      const updatedItem = await itemRes.json();
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );

      showBanner("Request approved and stock reserved.");
    } catch (err) {
      console.error("Failed to approve request:", err);
    }
  }

  function handleRejectRequest(requestId) {
    setRejectReason("");
    setRejectModal(requestId);
  }

  async function confirmReject() {
    if (!rejectReason.trim()) {
      showBanner("Please enter a reason for rejection.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/requests/${rejectModal}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_by: 1, reject_reason: rejectReason }),
      });
      const updated = await res.json();

      const request = requests.find((r) => r.id === rejectModal);

      setRequests(
        requests.map((r) =>
          r.id === rejectModal
            ? { ...r, status: "rejected", reject_reason: rejectReason }
            : r,
        ),
      );

      // Refresh item to reflect released reserved_stock
      const itemRes = await fetch(`${API_URL}/${request.item_id}`);
      const updatedItem = await itemRes.json();
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );

      setRejectModal(null);
      setRejectReason("");
      showBanner("Request rejected.");
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  }

  async function handleFulfillRequest(requestId) {
    try {
      const res = await fetch(`${API_URL}/requests/${requestId}/fulfill`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfilled_by: 1 }), // placeholder until login
      });

      if (!res.ok) {
        const errData = await res.json();
        showBanner(errData.error || "Failed to fulfill request.");
        return;
      }

      const updated = await res.json();
      const request = requests.find((r) => r.id === requestId);

      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "fulfilled",
                fulfilled_date: updated.fulfilled_at,
              }
            : req,
        ),
      );

      // Refresh item to reflect deducted stock
      const itemRes = await fetch(`${API_URL}/${request.item_id}`);
      const updatedItem = await itemRes.json();
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );

      showBanner("Request fulfilled. Stock and reservations updated.");
    } catch (err) {
      console.error("Failed to fulfill request:", err);
    }
  }

  // ── Reorder level inline edit ─────────────────────────────
  async function handleReorderSave(itemId) {
    const newLevel = Number(editingReorder.value);
    if (isNaN(newLevel) || newLevel < 0) {
      alert("Please enter a valid number (0 or above).");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder_level: newLevel }),
      });
      const updated = await res.json();

      setItems(items.map((item) => (item.id === itemId ? updated : item)));
      setEditingReorder(null);
      showBanner("Reorder level updated successfully.");
    } catch (err) {
      console.error("Failed to update reorder level:", err);
    }
  }

  // ── Live new balance for transaction form ─────────────────
  const newBalance = (() => {
    if (
      !txForm.ppe_item_id ||
      txForm.quantity === "" ||
      !txForm.transaction_type
    )
      return null;

    const item = items.find((i) => i.id === Number(txForm.ppe_item_id));
    if (!item) return null;

    const qty = Number(txForm.quantity);

    if (txForm.transaction_type === "stocktake") {
      const variance = qty - item.current_stock;
      return `Variance: ${variance}`;
    }

    const nb =
      txForm.transaction_type === "received"
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

      {/* Header */}
      <div className="ppe-header">
        <h1 className="ppe-title">PPE Inventory</h1>
        <div className="ppe-header-buttons">
          <button
            className="ppe-btn-secondary"
            onClick={() => setModalType("request")}
          >
            + Create PPE Request
          </button>
          <button
            className="ppe-btn-secondary"
            onClick={() => {
              setErrors({});
              setModalType("addItem");
            }}
          >
            + Add new item
          </button>
          <button
            className="ppe-btn-primary"
            onClick={() => {
              setErrors({});
              setModalType("transaction");
            }}
          >
            + Record transaction
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="ppe-search-wrap">
        <input
          className="ppe-search-input"
          type="text"
          placeholder="Search by item name or size..."
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
          <div className={`ppe-card-value ${lowStockCount > 0 ? "amber" : ""}`}>
            {lowStockCount}
          </div>
        </div>
        <div className="ppe-card">
          <div className="ppe-card-label">Out of stock</div>
          <div className={`ppe-card-value ${outOfStockCount > 0 ? "red" : ""}`}>
            {outOfStockCount}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ppe-table-wrap">
        <table className="ppe-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item name</th>
              <th>Size</th>
              <th>Unit</th>
              {canViewStock() && <th>Current stock</th>}
              <th>Reserved</th>
              <th>Reorder level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const status = getStockStatus(item);
              const badge = getStatusBadge(status);
              const history = getItemTransactions(item.id);
              const expanded = expandedItemId === item.id;

              return (
                <>
                  {/* Main item row */}
                  <tr key={item.id} className={getRowClass(status)}>
                    <td>{index + 1}</td>
                    <td>
                      {/* Click item name to expand/collapse history */}
                      <button
                        className="ppe-item-name-btn"
                        onClick={() => toggleHistory(item.id)}
                        title="Click to view transaction history"
                      >
                        <span className="ppe-expand-icon">
                          {expanded ? "▼" : "▶"}
                        </span>
                        {item.item_name}
                      </button>
                    </td>
                    <td>{item.size_spec}</td>
                    <td>{item.unit_of_measure}</td>
                    {canViewStock() && (
                      <>
                        <td>
                          <strong>
                            {item.current_stock - (item.reserved_stock || 0)}
                          </strong>
                        </td>
                        <td>{item.reserved_stock || 0}</td>
                      </>
                    )}
                    <td>
                      {/* Inline reorder level editing */}
                      {editingReorder && editingReorder.itemId === item.id ? (
                        <div className="ppe-reorder-edit">
                          <input
                            className="ppe-reorder-input"
                            type="number"
                            min="0"
                            value={editingReorder.value}
                            onChange={(e) =>
                              setEditingReorder({
                                ...editingReorder,
                                value: e.target.value,
                              })
                            }
                            autoFocus
                          />
                          <button
                            className="ppe-btn-xs primary"
                            onClick={() => handleReorderSave(item.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="ppe-btn-xs"
                            onClick={() => setEditingReorder(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="ppe-reorder-display"
                          title="Click to edit reorder level"
                          onClick={() =>
                            setEditingReorder({
                              itemId: item.id,
                              value: String(item.reorder_level || 0),
                            })
                          }
                        >
                          {item.reorder_level || "—"}
                          <span className="ppe-edit-hint"> ✎</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={badge.className}>{badge.text}</span>
                    </td>
                    <td>
                      <button
                        className="ppe-btn-sm"
                        onClick={() => {
                          setTxForm({
                            ...txForm,
                            ppe_item_id: String(item.id),
                          });
                          setErrors({});
                          setModalType("transaction");
                        }}
                      >
                        {item.current_stock === 0
                          ? "Receive"
                          : "Issue / Receive"}
                      </button>
                    </td>
                  </tr>

                  {/* Transaction history — expands below the item row */}
                  {expanded && (
                    <tr key={`history-${item.id}`} className="ppe-history-row">
                      <td colSpan={canViewStock() ? 8 : 7}>
                        <div className="ppe-history-wrap">
                          <div className="ppe-history-title">
                            📋 Transaction history — {item.item_name} (
                            {item.size_spec})
                          </div>

                          {history.length === 0 ? (
                            <div className="ppe-history-empty">
                              No transactions recorded yet for this item. Use
                              "Record transaction" to add stock movements.
                            </div>
                          ) : (
                            <>
                              <table className="ppe-history-table">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Notes</th>
                                    <th>Recorded by</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {history.map((tx, i) => (
                                    <tr
                                      key={tx.id}
                                      className={
                                        tx.transaction_type === "received"
                                          ? "tx-received"
                                          : tx.transaction_type === "issued"
                                            ? "tx-issued"
                                            : "tx-stocktake"
                                      }
                                    >
                                      <td>{i + 1}</td>
                                      <td>{formatDate(tx.date)}</td>
                                      <td>
                                        <span
                                          className={`tx-badge ${
                                            tx.transaction_type === "received"
                                              ? "tx-badge-in"
                                              : tx.transaction_type === "issued"
                                                ? "tx-badge-out"
                                                : "tx-badge-stocktake"
                                          }`}
                                        >
                                          {tx.transaction_type === "received"
                                            ? "▲ Received"
                                            : tx.transaction_type === "issued"
                                              ? "▼ Issued"
                                              : "📦 Stock Take"}
                                        </span>
                                      </td>
                                      <td>
                                        <strong
                                          className={
                                            tx.transaction_type === "received"
                                              ? "qty-in"
                                              : "qty-out"
                                          }
                                        >
                                          {tx.transaction_type === "received"
                                            ? `+${tx.quantity}`
                                            : `-${tx.quantity}`}
                                        </strong>{" "}
                                        {item.unit_of_measure}
                                      </td>
                                      <td>{tx.notes || "—"}</td>
                                      <td>{tx.recorded_by}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Running balance summary */}
                              <div className="ppe-history-summary">
                                <span>
                                  Total received:{" "}
                                  <strong className="qty-in">
                                    +
                                    {history
                                      .filter(
                                        (t) =>
                                          t.transaction_type === "received",
                                      )
                                      .reduce(
                                        (sum, t) => sum + Number(t.quantity),
                                        0,
                                      )}{" "}
                                    {item.unit_of_measure}
                                  </strong>
                                </span>
                                <span>
                                  Total issued:{" "}
                                  <strong className="qty-out">
                                    -
                                    {history
                                      .filter(
                                        (t) => t.transaction_type === "issued",
                                      )
                                      .reduce(
                                        (sum, t) => sum + Number(t.quantity),
                                        0,
                                      )}{" "}
                                    {item.unit_of_measure}
                                  </strong>
                                </span>
                                <span>
                                  Current balance:{" "}
                                  <strong>
                                    {item.current_stock} {item.unit_of_measure}
                                  </strong>
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="ppe-legend">
        <span>
          <span
            className="ppe-legend-dot"
            style={{ background: "#fdebd0", border: "1px solid #e67e22" }}
          ></span>
          Low stock
        </span>
        <span>
          <span
            className="ppe-legend-dot"
            style={{ background: "#fadbd8", border: "1px solid #c0392b" }}
          ></span>
          Out of stock
        </span>
        <span style={{ color: "#888" }}>
          💡 Click an item name to view its transaction history
        </span>
      </div>

      {/* Requests List */}
      <div className="ppe-table-wrap" style={{ marginTop: "30px" }}>
        <h2 className="ppe-title" style={{ fontSize: "20px" }}>
          PPE Requests
        </h2>

        {requests.length === 0 ? (
          <p>No PPE requests submitted yet.</p>
        ) : (
          <table className="ppe-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Worker</th>
                <th>Department</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => {
                const item = items.find((i) => i.id === request.item_id);

                return (
                  <tr key={request.id}>
                    <td>{formatDate(request.date)}</td>
                    <td>
                      {item
                        ? `${item.item_name} (${item.size_spec})`
                        : "Unknown Item"}
                    </td>
                    <td>{request.quantity}</td>
                    <td>{request.worker_name}</td>
                    <td>{request.department}</td>
                    <td>{request.requested_by}</td>

                    <td>
                      <span
                        className={`ppe-badge ${
                          request.status === "fulfilled"
                            ? "badge-ok"
                            : request.status === "approved"
                              ? "badge-expiring"
                              : request.status === "rejected"
                                ? "badge-out"
                                : "badge-low"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td>
                      {request.status === "pending" && (
                        <>
                          {canApprove() && (
                            <button
                              className="ppe-btn-sm"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </button>
                          )}

                          <button
                            className="ppe-btn-sm"
                            onClick={() => handleRejectRequest(request.id)}
                            style={{ marginLeft: "6px" }}
                          >
                            Reject
                          </button>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "4px",
                            }}
                          >
                            Must be approved before fulfillment
                          </div>
                        </>
                      )}

                      {request.status === "approved" && (
                        <>
                          <button
                            className="ppe-btn-sm"
                            onClick={() => handleFulfillRequest(request.id)}
                          >
                            Fulfill
                          </button>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "4px",
                            }}
                          >
                            Ready to issue stock
                          </div>
                        </>
                      )}

                      {request.status === "fulfilled" && (
                        <span>✓ Completed</span>
                      )}

                      {request.status === "rejected" && (
                        <div>
                          <span style={{ color: "#c0392b" }}>✕ Rejected</span>
                          {request.reject_reason && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                marginTop: "3px",
                              }}
                            >
                              Reason: {request.reject_reason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── TRANSACTION MODAL ── */}
      {modalType === "transaction" && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal">
            <h2 className="ppe-modal-title">Record stock transaction</h2>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                PPE item <span className="required">*</span>
              </label>
              <select
                className="ppe-form-select"
                name="ppe_item_id"
                value={txForm.ppe_item_id}
                onChange={handleTxChange}
              >
                <option value="">Select item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} — {item.size_spec} (stock:{" "}
                    {item.current_stock})
                  </option>
                ))}
              </select>
              {errors.ppe_item_id && (
                <div className="ppe-field-error">{errors.ppe_item_id}</div>
              )}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Transaction type <span className="required">*</span>
              </label>
              <select
                className="ppe-form-select"
                name="transaction_type"
                value={txForm.transaction_type}
                onChange={handleTxChange}
              >
                <option value="">Select type...</option>
                <option value="received">Received — stock coming in</option>
                <option value="issued">
                  Issued — stock going out to staff
                </option>
                <option value="stocktake">
                  Stock Take — physical stock count
                </option>
              </select>
              {errors.transaction_type && (
                <div className="ppe-field-error">{errors.transaction_type}</div>
              )}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                {txForm.transaction_type === "stocktake"
                  ? "Physical Count"
                  : "Quantity"}
                <span className="required">*</span>
              </label>

              <input
                className="ppe-form-input"
                type="number"
                name="quantity"
                value={txForm.quantity}
                onChange={handleTxChange}
                placeholder={
                  txForm.transaction_type === "stocktake"
                    ? "Enter physical count"
                    : "Enter quantity"
                }
                min="0"
              />

              {errors.quantity && (
                <div className="ppe-field-error">{errors.quantity}</div>
              )}
            </div>

            {newBalance !== null && (
              <div className="ppe-form-group">
                <label className="ppe-form-label">
                  New stock balance (auto-calculated)
                </label>
                <div className="ppe-form-readonly">{newBalance}</div>
              </div>
            )}

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Date <span className="required">*</span>
              </label>
              <input
                className="ppe-form-input"
                type="date"
                name="date"
                value={txForm.date}
                onChange={handleTxChange}
              />
              {errors.date && (
                <div className="ppe-field-error">{errors.date}</div>
              )}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Notes (optional)</label>
              <input
                className="ppe-form-input"
                type="text"
                name="notes"
                value={txForm.notes}
                onChange={handleTxChange}
                placeholder="e.g. Issued to Mill 2 staff"
              />
            </div>

            <div className="ppe-modal-buttons">
              <button className="ppe-btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="ppe-btn-primary" onClick={handleTxSave}>
                Save transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD ITEM MODAL ── */}
      {modalType === "addItem" && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal">
            <h2 className="ppe-modal-title">Add new PPE item</h2>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Item name <span className="required">*</span>
              </label>
              <input
                className="ppe-form-input"
                type="text"
                name="item_name"
                value={itemForm.item_name}
                onChange={handleItemChange}
                placeholder="e.g. Safety Masks"
              />
              {errors.item_name && (
                <div className="ppe-field-error">{errors.item_name}</div>
              )}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Size / specification <span className="required">*</span>
              </label>
              <input
                className="ppe-form-input"
                type="text"
                name="size_spec"
                value={itemForm.size_spec}
                onChange={handleItemChange}
                placeholder="e.g. One size, XL, L"
              />
              {errors.size_spec && (
                <div className="ppe-field-error">{errors.size_spec}</div>
              )}
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Unit of measure <span className="required">*</span>
              </label>
              <select
                className="ppe-form-select"
                name="unit_of_measure"
                value={itemForm.unit_of_measure}
                onChange={handleItemChange}
              >
                <option value="pcs">pcs (pieces)</option>
                <option value="pairs">pairs</option>
                <option value="boxes">boxes</option>
                <option value="rolls">rolls</option>
              </select>
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Reorder level (optional)</label>
              <input
                className="ppe-form-input"
                type="number"
                name="reorder_level"
                value={itemForm.reorder_level}
                onChange={handleItemChange}
                placeholder="e.g. 10"
                min="0"
              />
              <div
                style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}
              >
                Alert when stock falls to this number. Leave blank for no alert.
              </div>
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Starting stock</label>
              <div className="ppe-form-readonly">
                0 — use Record transaction to add stock after creating the item.
              </div>
            </div>

            <div className="ppe-modal-buttons">
              <button className="ppe-btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="ppe-btn-primary" onClick={handleItemSave}>
                Add item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PPE REQUEST MODAL── */}
      {modalType === "request" && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal">
            <h2 className="ppe-modal-title">Create PPE Request</h2>

            <div className="ppe-form-group">
              <label className="ppe-form-label">PPE Item</label>
              <select
                className="ppe-form-select"
                name="item_id"
                value={requestForm.item_id}
                onChange={handleRequestChange}
              >
                <option value="">Select item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name} — {item.size_spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Worker Name</label>
              <input
                className="ppe-form-input"
                type="text"
                name="worker_name"
                value={requestForm.worker_name}
                onChange={handleRequestChange}
                placeholder="Enter worker name"
              />
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Department</label>
              <input
                className="ppe-form-input"
                type="text"
                name="department"
                value={requestForm.department}
                onChange={handleRequestChange}
                placeholder="Enter department"
              />
            </div>

            <div className="ppe-form-group">
              <label className="ppe-form-label">Quantity</label>
              <input
                className="ppe-form-input"
                type="number"
                name="quantity"
                value={requestForm.quantity}
                onChange={handleRequestChange}
                placeholder="Enter quantity"
              />
            </div>

            <div className="ppe-modal-buttons">
              <button className="ppe-btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="ppe-btn-primary" onClick={handleRequestSave}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT REQUEST MODAL── */}
      {rejectModal && (
        <div className="ppe-modal-overlay">
          <div className="ppe-modal" style={{ maxWidth: "400px" }}>
            <h2 className="ppe-modal-title" style={{ color: "#c0392b" }}>
              Reject request
            </h2>
            <div className="ppe-form-group">
              <label className="ppe-form-label">
                Reason for rejection <span className="required">*</span>
              </label>
              <input
                className="ppe-form-input"
                type="text"
                placeholder="e.g. Item not available in requested size"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="ppe-modal-buttons">
              <button
                className="ppe-btn-secondary"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="ppe-btn-primary"
                style={{ background: "#c0392b", borderColor: "#c0392b" }}
                onClick={confirmReject}
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PPEPage;
