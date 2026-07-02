const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Public read — open action items (no JWT)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, description, assigned_to, due_date, status, priority, department
       FROM action_tracker
       WHERE status != 'Closed'
       ORDER BY due_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public submit — external parties can raise an action item
router.post('/submit', async (req, res) => {
  const { description, department, reporter_name, reporter_email } = req.body;
  if (!description) return res.status(400).json({ error: 'Description required' });
  try {
    const result = await pool.query(
      `INSERT INTO action_tracker (description, department, status, priority, reporter_name, reporter_email)
       VALUES ($1, $2, 'Open', 'Medium', $3, $4)
       RETURNING id, description, status`,
      [description, department, reporter_name, reporter_email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;