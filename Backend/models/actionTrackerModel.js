const pool = require('../config/db');

const getAllActions = async () => {
  const result = await pool.query(
    `SELECT *, 
      TO_CHAR(date_raised, 'YYYY-MM-DD') as date_raised,
      TO_CHAR(target_date, 'YYYY-MM-DD') as target_date
     FROM action_tracker WHERE is_deleted = FALSE ORDER BY id`
  );
  return result.rows;
};

const getActionById = async (id) => {
  const result = await pool.query('SELECT * FROM action_tracker WHERE id = $1', [id]);
  return result.rows[0];
};

const createAction = async (data) => {
  const { concern, action, responsible, date_raised, target_date, progress, status, raised_by, department, priority } = data;
  const result = await pool.query(
    `INSERT INTO action_tracker (concern, action, responsible, date_raised, target_date, progress, status, raised_by, department, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)  RETURNING *, TO_CHAR(date_raised, 'YYYY-MM-DD') as date_raised, TO_CHAR(target_date, 'YYYY-MM-DD') as target_date`,
    [concern, action, responsible, date_raised, target_date, progress, status, raised_by, department || null, priority || 'Medium']
  );
  return result.rows[0];
};

const updateAction = async (id, data) => {
  const { concern, action, responsible, date_raised, target_date, progress, status, department, priority } = data;
  const result = await pool.query(
    `UPDATE action_tracker 
     SET concern=$1, action=$2, responsible=$3, date_raised=$4, target_date=$5, 
         progress=$6, status=$7, department=$8, priority=$9, updated_at=NOW()
     WHERE id=$10  RETURNING *, TO_CHAR(date_raised, 'YYYY-MM-DD') as date_raised, TO_CHAR(target_date, 'YYYY-MM-DD') as target_date`,
    [concern, action, responsible, date_raised, target_date, progress, status, department || null, priority || 'Medium', id]
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
};

module.exports = { getAllActions, getActionById, createAction, updateAction, deleteAction };