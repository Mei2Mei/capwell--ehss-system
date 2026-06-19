const pool = require('../config/db');

const getAllSafetyRecords = async () => {
  const result = await pool.query('SELECT * FROM safety_records WHERE is_deleted = FALSE ORDER BY period');
  return result.rows;
};

const getSafetyRecordById = async (id) => {
  const result = await pool.query('SELECT * FROM safety_records WHERE id = $1', [id]);
  return result.rows[0];
};

const createSafetyRecord = async (data) => {
  const { period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections } = data;
  const result = await pool.query(
    `INSERT INTO safety_records (period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections]
  );
  return result.rows[0];
};

const updateSafetyRecord = async (id, data) => {
  const { period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections } = data;
  const result = await pool.query(
    `UPDATE safety_records SET period=$1, staff_numbers=$2, worked_hours=$3, fatalities=$4, medical_treatment_incidents=$5, lost_time_incidents=$6, days_away_from_work=$7, hse_training_hours=$8, first_aid_cases=$9, near_misses=$10, accident_investigations=$11, hse_meetings=$12, hse_inspections=$13, updated_at=NOW()
     WHERE id=$14 RETURNING *`,
    [period, staff_numbers, worked_hours, fatalities, medical_treatment_incidents, lost_time_incidents, days_away_from_work, hse_training_hours, first_aid_cases, near_misses, accident_investigations, hse_meetings, hse_inspections, id]
  );
  return result.rows[0];
};

const deleteSafetyRecord = async (id, reason) => {
  const result = await pool.query(
    `UPDATE safety_records SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};

module.exports = { getAllSafetyRecords, getSafetyRecordById, createSafetyRecord, updateSafetyRecord, deleteSafetyRecord };