const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { table_name, action, from, to, limit = 100 } = req.query;
  let query = `SELECT * FROM audit_logs WHERE 1=1`;
  const params = [];
  let i = 1;
  if (table_name) { query += ` AND table_name=$${i++}`; params.push(table_name); }
  if (action)     { query += ` AND action=$${i++}`; params.push(action); }
  if (from)       { query += ` AND created_at >= $${i++}`; params.push(from); }
  if (to)         { query += ` AND created_at <= $${i++}`; params.push(to); }
  query += ` ORDER BY created_at DESC LIMIT $${i}`;
  params.push(parseInt(limit));
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;