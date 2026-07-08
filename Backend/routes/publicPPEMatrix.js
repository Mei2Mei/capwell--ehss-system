const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [matrixResult, deptsResult, itemsResult] = await Promise.all([
      pool.query('SELECT * FROM ppe_matrix'),
      pool.query('SELECT DISTINCT department FROM ppe_matrix ORDER BY department'),
      pool.query('SELECT DISTINCT ppe_item FROM ppe_matrix ORDER BY ppe_item'),
    ]);

    res.json({
      matrix: matrixResult.rows,
      departments: deptsResult.rows.map(r => r.department),
      ppeItems: itemsResult.rows.map(r => r.ppe_item),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;