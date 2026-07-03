const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { sendPublicActionAlert } = require("../utils/emailService");

// Public read — open action items (no JWT)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
  `SELECT id, concern AS description, responsible AS assigned_to,
  target_date AS due_date, status, date_raised, department, priority
FROM action_tracker
WHERE (is_deleted = false OR is_deleted IS NULL)
AND status NOT IN ('Completed', 'Closed')
ORDER BY date_raised DESC NULLS LAST`
);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public submit — external parties raise an action item
router.post("/submit", async (req, res) => {
  const { description, department, reporter_name, reporter_email } = req.body;
  if (!description)
    return res.status(400).json({ error: "Description is required." });

  try {
    const result = await pool.query(
  `INSERT INTO action_tracker (concern, action, status, date_raised, progress, department, priority, reporter_name, reporter_email)
   VALUES ($1, 'Pending Review', 'Pending', CURRENT_DATE, 0, $2, 'Medium', $3, $4)
   RETURNING id, concern, status`,
  [description, department, reporter_name, reporter_email]
);

    // Send email to Linda — don't block the response if it fails
    sendPublicActionAlert({
      description,
      department,
      reporter_name,
      reporter_email,
    }).catch((err) => console.error("Email notification failed:", err.message));

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
