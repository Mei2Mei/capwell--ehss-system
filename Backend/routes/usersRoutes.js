const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Role name → ID map
const ROLE_MAP = {
  ehss_officer: 1,
  storekeeper: 2,
  supervisor: 3,
  production_manager: 4,
  qa: 5,
  it_admin: 6,
};

// GET all users
router.get('/', requireAuth, requireRole('it_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name AS name, u.email, r.role_name AS role, u.is_active, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post('/', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password and role are required.' });
  }
  const roleId = ROLE_MAP[role];
  if (!roleId) return res.status(400).json({ error: `Invalid role: ${role}` });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, full_name AS name, email, is_active, created_at`,
      [name, email, hashed, roleId]
    );
    res.status(201).json({ ...result.rows[0], role });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put('/:id', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { id } = req.params;
  const { role, is_active } = req.body;
  const roleId = ROLE_MAP[role];
  if (!roleId) return res.status(400).json({ error: `Invalid role: ${role}` });

  try {
    const result = await pool.query(
      `UPDATE users SET role_id=$1, is_active=$2
       WHERE id=$3
       RETURNING id, full_name AS name, email, is_active`,
      [roleId, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ ...result.rows[0], role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;