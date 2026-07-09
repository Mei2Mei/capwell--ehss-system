const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const ROLE_MAP = {
  ehss_officer: 1, storekeeper: 2, supervisor: 3,
  production_manager: 4, qa: 5, it_admin: 6,
};

// GET all users
router.get('/', requireAuth, requireRole('it_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name AS name, u.email, r.role_name AS role, u.is_active, u.created_at, u.department
       FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { 
  console.error('GET USERS ERROR:', err.message);
  res.status(500).json({ error: err.message }); 
}
});

// POST create user
router.post('/', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role || !department)
    return res.status(400).json({ error: 'Name, email, password, role and department are required.' });
  const roleId = ROLE_MAP[role];
  if (!roleId) return res.status(400).json({ error: `Invalid role: ${role}` });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, is_active, department)
 VALUES ($1, $2, $3, $4, true, $5) RETURNING id, full_name AS name, email, is_active, department`,
[name, email, hashed, roleId, department || null]
    );
    res.status(201).json({ ...result.rows[0], role });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT self change-password — MUST be before /:id to avoid conflict
router.put('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Both fields are required.' });
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update user role/status
router.put('/:id', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { id } = req.params;
  const { role, is_active, department } = req.body;
  const roleId = ROLE_MAP[role];
  if (!roleId) return res.status(400).json({ error: `Invalid role: ${role}` });
  try {
    const result = await pool.query(
      `UPDATE users SET role_id=$1, is_active=$2, department=$3 WHERE id=$4
       RETURNING id, full_name AS name, email, is_active, department`,
      [roleId, is_active, department || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ ...result.rows[0], role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT admin reset password for any user
router.put('/:id/reset-password', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'New password is required.' });
  try {
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, req.params.id]);
    res.json({ message: 'Password reset successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE user
router.delete('/:id', requireAuth, requireRole('it_admin'), async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id)
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;