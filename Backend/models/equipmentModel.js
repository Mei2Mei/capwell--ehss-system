const pool = require('../config/db');

const getAllEquipment = async () => {
  const result = await pool.query('SELECT * FROM equipment WHERE is_deleted = FALSE ORDER BY id');
  return result.rows;
};

const getEquipmentById = async (id) => {
  const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
  return result.rows[0];
};

const createEquipment = async (data) => {
  const { name, description, capacity, status, location, last_inspection, next_inspection } = data;
  const result = await pool.query(
    `INSERT INTO equipment (name, description, capacity, status, location, last_inspection, next_inspection)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name, description, capacity, status, location, last_inspection, next_inspection]
  );
  return result.rows[0];
};

const updateEquipment = async (id, data) => {
  const { name, description, capacity, status, location, last_inspection, next_inspection } = data;
  const result = await pool.query(
    `UPDATE equipment SET name=$1, description=$2, capacity=$3, status=$4, location=$5, last_inspection=$6, next_inspection=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [name, description, capacity, status, location, last_inspection, next_inspection, id]
  );
  return result.rows[0];
};

const deleteEquipment = async (id, reason) => {
  const result = await pool.query(
    `UPDATE equipment SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};

module.exports = { getAllEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment };