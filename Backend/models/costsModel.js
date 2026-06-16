const pool = require('../config/db');

const getAllCostRecords = async () => {
  const result = await pool.query('SELECT * FROM cost_records ORDER BY date');
  return result.rows;
};

const getCostRecordById = async (id) => {
  const result = await pool.query('SELECT * FROM cost_records WHERE id = $1', [id]);
  return result.rows[0];
};

const createCostRecord = async (data) => {
  const { year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status } = data;
  const result = await pool.query(
    `INSERT INTO cost_records (year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status]
  );
  return result.rows[0];
};

const updateCostRecord = async (id, data) => {
  const { year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status } = data;
  const result = await pool.query(
    `UPDATE cost_records SET year=$1, item_description=$2, date=$3, po_number=$4, cost_excl_vat=$5, cost_type=$6, refundable=$7, budget_status=$8
     WHERE id=$9 RETURNING *`,
    [year, item_description, date, po_number, cost_excl_vat, cost_type, refundable, budget_status, id]
  );
  return result.rows[0];
};

const deleteCostRecord = async (id) => {
  await pool.query('DELETE FROM cost_records WHERE id=$1', [id]);
};

module.exports = { getAllCostRecords, getCostRecordById, createCostRecord, updateCostRecord, deleteCostRecord };