const pool = require('../config/db');

async function logAudit({ userId, userName, action, tableName, recordId, oldValue, newValue, ip }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, table_name, record_id, old_value, new_value, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, userName, action, tableName, recordId,
       oldValue ? JSON.stringify(oldValue) : null,
       newValue ? JSON.stringify(newValue) : null,
       ip || null]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = logAudit;