const pool = require('../config/db');

const getPPEItemById = async (id) => {
  const result = await pool.query('SELECT * FROM ppe_items WHERE id = $1', [id]);
  return result.rows[0];
};

const createPPERequest = async (ppe_item_id, requested_by, quantity, notes, worker_name, department) => {
  const result = await pool.query(
    `INSERT INTO ppe_requests (ppe_item_id, requested_by, quantity, notes, worker_name, department, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
    [ppe_item_id, requested_by, quantity, notes, worker_name, department]
  );
  return result.rows[0];
};

const approveRequest = async (requestId, approvedBy) => {
  const request = await pool.query('SELECT * FROM ppe_requests WHERE id = $1', [requestId]);
  if (!request.rows[0]) throw new Error('Request not found');
  if (request.rows[0].status !== 'pending') throw new Error('Only pending requests can be approved');

  const { ppe_item_id, quantity } = request.rows[0];

  const itemResult = await pool.query('SELECT * FROM ppe_items WHERE id = $1', [ppe_item_id]);
  const item = itemResult.rows[0];
  const available = item.current_stock - (item.reserved_stock || 0);

  if (quantity > available) {
    throw new Error(`Not enough available stock. Available: ${available}`);
  }

  await pool.query(
    'UPDATE ppe_items SET reserved_stock = reserved_stock + $1 WHERE id = $2',
    [quantity, ppe_item_id]
  );

  const result = await pool.query(
    `UPDATE ppe_requests SET status = 'approved', approved_by = $1, approved_at = NOW()
     WHERE id = $2 RETURNING *`,
    [approvedBy, requestId]
  );
  return result.rows[0];
};

const rejectRequest = async (requestId, approvedBy, reject_reason) => {
  const request = await pool.query('SELECT * FROM ppe_requests WHERE id = $1', [requestId]);
  if (!request.rows[0]) throw new Error('Request not found');

  const { ppe_item_id, quantity, status } = request.rows[0];

  // If it was approved (stock was reserved), release the reservation
  if (status === 'approved') {
    await pool.query(
      'UPDATE ppe_items SET reserved_stock = GREATEST(reserved_stock - $1, 0) WHERE id = $2',
      [quantity, ppe_item_id]
    );
  }

  const result = await pool.query(
    `UPDATE ppe_requests SET status = 'rejected', approved_by = $1, approved_at = NOW(), reject_reason = $2
     WHERE id = $3 RETURNING *`,
    [approvedBy, reject_reason, requestId]
  );
  return result.rows[0];
};

const fulfillRequest = async (requestId, fulfilledBy) => {
  const request = await pool.query('SELECT * FROM ppe_requests WHERE id = $1', [requestId]);
  if (!request.rows[0]) throw new Error('Request not found');
  if (request.rows[0].status !== 'approved') throw new Error('Request must be approved first');

  const { ppe_item_id, quantity } = request.rows[0];

  // Deduct from stock and clear reservation
  await pool.query(
    'UPDATE ppe_items SET current_stock = current_stock - $1, reserved_stock = reserved_stock - $1 WHERE id = $2',
    [quantity, ppe_item_id]
  );

  const result = await pool.query(
    `UPDATE ppe_requests SET status = 'fulfilled', fulfilled_by = $1, fulfilled_at = NOW()
     WHERE id = $2 RETURNING *`,
    [fulfilledBy, requestId]
  );
  return result.rows[0];
};

const getAllRequests = async () => {
  const result = await pool.query('SELECT * FROM ppe_requests ORDER BY requested_at DESC');
  return result.rows;
};

// PPE Items - full CRUD
const createPPEItem = async (data) => {
  const { item_name, size_spec, unit_of_measure, reorder_level } = data;
  const result = await pool.query(
    `INSERT INTO ppe_items (item_name, size_spec, unit_of_measure, reorder_level, current_stock, reserved_stock)
     VALUES ($1,$2,$3,$4,0,0) RETURNING *`,
    [item_name, size_spec, unit_of_measure, reorder_level || 0]
  );
  return result.rows[0];
};

const updatePPEItem = async (id, data) => {
  const { reorder_level } = data;
  const result = await pool.query(
    `UPDATE ppe_items SET reorder_level=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [reorder_level, id]
  );
  return result.rows[0];
};

const softDeletePPEItem = async (id, reason) => {
  const result = await pool.query(
    `UPDATE ppe_items SET is_deleted=TRUE, deleted_reason=$1, deleted_at=NOW() WHERE id=$2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};

// Override getAllPPEItems to exclude soft-deleted
const getAllPPEItems = async () => {
  const result = await pool.query('SELECT * FROM ppe_items WHERE is_deleted = FALSE ORDER BY id');
  return result.rows;
};

// Transactions
const createTransaction = async (data) => {
  const { ppe_item_id, transaction_type, quantity, transaction_date, notes, recorded_by } = data;

  // Update stock based on transaction type
  let stockUpdateQuery;
  if (transaction_type === 'received') {
    stockUpdateQuery = 'UPDATE ppe_items SET current_stock = current_stock + $1 WHERE id = $2';
  } else if (transaction_type === 'issued') {
    stockUpdateQuery = 'UPDATE ppe_items SET current_stock = current_stock - $1 WHERE id = $2';
  } else if (transaction_type === 'stocktake') {
    stockUpdateQuery = 'UPDATE ppe_items SET current_stock = $1 WHERE id = $2';
  }
  await pool.query(stockUpdateQuery, [quantity, ppe_item_id]);

  const result = await pool.query(
    `INSERT INTO ppe_transactions (ppe_item_id, transaction_type, quantity, transaction_date, notes, recorded_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [ppe_item_id, transaction_type, quantity, transaction_date, notes, recorded_by]
  );
  return result.rows[0];
};

const getTransactionsByItem = async (ppe_item_id) => {
  const result = await pool.query(
    'SELECT * FROM ppe_transactions WHERE ppe_item_id = $1 ORDER BY transaction_date DESC',
    [ppe_item_id]
  );
  return result.rows;
};

const getAllTransactions = async () => {
  const result = await pool.query('SELECT * FROM ppe_transactions ORDER BY transaction_date DESC');
  return result.rows;
};

module.exports = {
  getAllPPEItems, getPPEItemById,
  createPPERequest, approveRequest, rejectRequest, fulfillRequest, getAllRequests,
  createPPEItem, updatePPEItem, softDeletePPEItem,
  createTransaction, getTransactionsByItem, getAllTransactions
};