const express = require("express");
const router = express.Router();

const { getUsers } = require("../controllers/usersController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get(
  "/",
  requireAuth,
  requireRole("it_admin"),
  getUsers
);

module.exports = router;