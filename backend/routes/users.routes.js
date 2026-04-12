const express = require('express');
const { query } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');

const router = express.Router();

router.get('/', auth(['admin']), async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, phone, role, location, vehicle_type, created_at FROM users ORDER BY created_at DESC');
    success(res, users);
  } catch (err) {
    error(res, 'Failed to fetch users.', 500);
  }
});

router.get('/me', auth(), async (req, res) => {
  try {
    const [user] = await query('SELECT id, name, email, phone, role, location, vehicle_type, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return error(res, 'User not found.', 404);
    success(res, user);
  } catch (err) {
    error(res, 'Failed to fetch profile.', 500);
  }
});

module.exports = router;