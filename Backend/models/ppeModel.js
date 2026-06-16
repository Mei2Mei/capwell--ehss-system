const pool = require('../config/db');

const getAllPPEItems = async () => {
  const result = await pool.query('SELECT * FROM ppe_items ORDER BY id');
  return result.rows;
};

const getPPEItemById = async (id) => {
  const result = await pool.query('SELECT * FROM ppe_items WHERE id = $1', [id]);
  return result.rows[0];
};

const createPPERequest = async (ppe_item_id, requested_by, quantity, notes) => {
  const result = await pool.query(
    `INSERT INTO ppe_requests (ppe_item_id, requested_by, quantity, notes, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [ppe_item_id, requested_by, quantity, notes]
  );
  return result.rows[0];
};

const approveRequest = async (requestId, approvedBy) => {
  const request = await pool.query('SELECT * FROM ppe_requests WHERE id = $1', [requestId]);
  if (!request.rows[0]) throw new Error('Request not found');

  const { ppe_item_id, quantity } = request.rows[0];

  // Reserve stock
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

const rejectRequest = async (requestId, approvedBy) => {
  const result = await pool.query(
    `UPDATE ppe_requests SET status = 'rejected', approved_by = $1, approved_at = NOW()
     WHERE id = $2 RETURNING *`,
    [approvedBy, requestId]
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

module.exports = {
  getAllPPEItems, getPPEItemById,
  createPPERequest, approveRequest, rejectRequest, fulfillRequest, getAllRequests
};