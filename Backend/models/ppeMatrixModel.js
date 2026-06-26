const pool = require('../config/db');

const getMatrix = async () => {
  const result = await pool.query('SELECT * FROM ppe_matrix ORDER BY department, ppe_item');
  return result.rows;
};

const getDepartments = async () => {
  const result = await pool.query('SELECT DISTINCT department FROM ppe_matrix ORDER BY department');
  return result.rows.map(r => r.department);
};

const getPPEItems = async () => {
  const result = await pool.query('SELECT DISTINCT ppe_item FROM ppe_matrix ORDER BY ppe_item');
  return result.rows.map(r => r.ppe_item);
};

const upsertCell = async (department, ppe_item, requirement) => {
  const result = await pool.query(
    `INSERT INTO ppe_matrix (department, ppe_item, requirement)
     VALUES ($1, $2, $3)
     ON CONFLICT (department, ppe_item)
     DO UPDATE SET requirement = $3, updated_at = NOW()
     RETURNING *`,
    [department, ppe_item, requirement]
  );
  return result.rows[0];
};

const addDepartment = async (department) => {
  // Get all existing PPE items and create 'none' entries for new department
  const items = await getPPEItems();
  for (const item of items) {
    await pool.query(
      `INSERT INTO ppe_matrix (department, ppe_item, requirement)
       VALUES ($1, $2, 'none')
       ON CONFLICT DO NOTHING`,
      [department, item]
    );
  }
  return department;
};

const addPPEItem = async (ppe_item) => {
  // Get all existing departments and create 'none' entries for new item
  const departments = await getDepartments();
  for (const dept of departments) {
    await pool.query(
      `INSERT INTO ppe_matrix (department, ppe_item, requirement)
       VALUES ($1, $2, 'none')
       ON CONFLICT DO NOTHING`,
      [dept, ppe_item]
    );
  }
  return ppe_item;
};

const deleteDepartment = async (department) => {
  await pool.query('DELETE FROM ppe_matrix WHERE department = $1', [department]);
};

const deletePPEItem = async (ppe_item) => {
  await pool.query('DELETE FROM ppe_matrix WHERE ppe_item = $1', [ppe_item]);
};

module.exports = { getMatrix, getDepartments, getPPEItems, upsertCell, addDepartment, addPPEItem, deleteDepartment, deletePPEItem };