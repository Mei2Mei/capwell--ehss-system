const pool = require('../config/db');

const getAllComplianceItems = async () => {
  const result = await pool.query('SELECT * FROM compliance_items WHERE is_deleted = FALSE ORDER BY id');
  return result.rows;
};

const getComplianceItemById = async (id) => {
  const result = await pool.query('SELECT * FROM compliance_items WHERE id = $1', [id]);
  return result.rows[0];
};

const createComplianceItem = async (data) => {
  const { requirement, expert_organisation, reference_number, requirement_reference, date_of_issuance, validity_period, date_of_expiry, remarks } = data;
  const result = await pool.query(
    `INSERT INTO compliance_items (requirement, expert_organisation, reference_number, requirement_reference, date_of_issuance, validity_period, date_of_expiry, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
  requirement,
  expert_organisation || null,
  reference_number || null,
  requirement_reference || null,
  date_of_issuance || null,
  validity_period || null,
  date_of_expiry || null,
  remarks || null,
]
  );
  return result.rows[0];
};

const updateComplianceItem = async (id, data) => {
  const { requirement, expert_organisation, reference_number, requirement_reference, date_of_issuance, validity_period, date_of_expiry, remarks } = data;
  const result = await pool.query(
    `UPDATE compliance_items SET requirement=$1, expert_organisation=$2, reference_number=$3, requirement_reference=$4, date_of_issuance=$5, validity_period=$6, date_of_expiry=$7, remarks=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [
  requirement,
  expert_organisation || null,
  reference_number || null,
  requirement_reference || null,
  date_of_issuance || null,
  validity_period || null,
  date_of_expiry || null,
  remarks || null,
  id,
  ]
  );
  return result.rows[0];
};

const deleteComplianceItem = async (id, reason) => {
  const result = await pool.query(
    `UPDATE compliance_items SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};

module.exports = { getAllComplianceItems, getComplianceItemById, createComplianceItem, updateComplianceItem, deleteComplianceItem};