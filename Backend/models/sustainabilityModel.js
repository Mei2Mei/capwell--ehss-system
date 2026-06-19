const pool = require('../config/db');

const getAllSustainabilityRecords = async () => {
  const result = await pool.query('SELECT * FROM sustainability_records WHERE is_deleted = FALSE ORDER BY period');
  return result.rows;
};

const getSustainabilityRecordById = async (id) => {
  const result = await pool.query('SELECT * FROM sustainability_records WHERE id = $1', [id]);
  return result.rows[0];
};

const getEmissionFactors = async () => {
  const result = await pool.query('SELECT * FROM emission_factors');
  return result.rows;
};

const createSustainabilityRecord = async (data) => {
  const { period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg } = data;
  const result = await pool.query(
    `INSERT INTO sustainability_records (period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg]
  );
  return result.rows[0];
};

const updateSustainabilityRecord = async (id, data) => {
  const { period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg } = data;
  const result = await pool.query(
    `UPDATE sustainability_records SET period=$1, water_consumption_m3=$2, water_recycled_m3=$3, electricity_kwh=$4, solar_kwh=$5, firewood_tonnes=$6, diesel_litres=$7, petrol_litres=$8, lpg_kg=$9, paper_waste_kg=$10, plastic_packaging_kg=$11, hazardous_waste_kg=$12, recyclable_plastic_kg=$13, updated_at=NOW()
     WHERE id=$14 RETURNING *`,
    [period, water_consumption_m3, water_recycled_m3, electricity_kwh, solar_kwh, firewood_tonnes, diesel_litres, petrol_litres, lpg_kg, paper_waste_kg, plastic_packaging_kg, hazardous_waste_kg, recyclable_plastic_kg, id]
  );
  return result.rows[0];
};

const deleteSustainabilityRecord = async (id, reason) => {
  const result = await pool.query(
    `UPDATE sustainability_records SET is_deleted = TRUE, deleted_reason = $1, deleted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reason, id]
  );
  return result.rows[0];
};

module.exports = { getAllSustainabilityRecords, getSustainabilityRecordById, getEmissionFactors, createSustainabilityRecord, updateSustainabilityRecord, deleteSustainabilityRecord };