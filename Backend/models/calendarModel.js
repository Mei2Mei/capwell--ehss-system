const pool = require('../config/db');

const getAllCalendarActivities = async () => {
  const result = await pool.query('SELECT * FROM calendar_activities WHERE is_deleted = FALSE ORDER BY scheduled_month');
  return result.rows;
};

const getCalendarActivityById = async (id) => {
  const result = await pool.query('SELECT * FROM calendar_activities WHERE id = $1', [id]);
  return result.rows[0];
};

const createCalendarActivity = async (data) => {
  const { activity_name, category, target_audience, internal_external, scheduled_month, status, notes } = data;
  const result = await pool.query(
    `INSERT INTO calendar_activities (activity_name, category, target_audience, internal_external, scheduled_month, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [activity_name, category, target_audience, internal_external, scheduled_month, status, notes]
  );
  return result.rows[0];
};

const updateCalendarActivity = async (id, data) => {
  const { activity_name, category, target_audience, internal_external, scheduled_month, status, notes } = data;
  const result = await pool.query(
    `UPDATE calendar_activities SET activity_name=$1, category=$2, target_audience=$3, internal_external=$4, scheduled_month=$5, status=$6, notes=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [activity_name, category, target_audience, internal_external, scheduled_month, status, notes, id]
  );
  return result.rows[0];
};

const deleteCalendarActivity = async (id, reason) => {
  const result = await pool.query(
    `UPDATE calendar_activities SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};
module.exports = { getAllCalendarActivities, getCalendarActivityById, createCalendarActivity, updateCalendarActivity, deleteCalendarActivity };