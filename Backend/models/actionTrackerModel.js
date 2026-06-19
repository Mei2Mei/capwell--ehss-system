const pool = require('../config/db');

const getAllActions = async () => {
  const result = await pool.query('SELECT * FROM action_tracker WHERE is_deleted = FALSE ORDER BY id');
  return result.rows;
};

const getActionById = async (id) => {
  const result = await pool.query('SELECT * FROM action_tracker WHERE id = $1', [id]);
  return result.rows[0];
};

const createAction = async (data) => {
  const { concern, action, responsible, date_raised, target_date, progress, status } = data;
  const result = await pool.query(
    `INSERT INTO action_tracker (concern, action, responsible, date_raised, target_date, progress, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [concern, action, responsible, date_raised, target_date, progress, status]
  );
  return result.rows[0];
};

const updateAction = async (id, data) => {
  const { concern, action, responsible, date_raised, target_date, progress, status } = data;
  const result = await pool.query(
    `UPDATE action_tracker SET concern=$1, action=$2, responsible=$3, date_raised=$4, target_date=$5, progress=$6, status=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [concern, action, responsible, date_raised, target_date, progress, status, id]
  );
  return result.rows[0];
};

const deleteAction = async (id, reason) => {
  const result = await pool.query(
    `UPDATE action_tracker SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};;

module.exports = { getAllActions, getActionById, createAction, updateAction, deleteAction };