const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ehss_secret_key';
const JWT_EXPIRES = '8h'; // token expires after 9 hours (one work day)

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id, role_name: user.role_name, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken, JWT_SECRET };