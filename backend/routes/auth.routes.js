const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({ success: false, error: 'Too many requests, please try again later.' });
  }
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role, location, vehicle, phone } = req.body;
    const normalizedPhone = String(phone || '').trim();

    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });

    if (!normalizedPhone)
      return res.status(400).json({ success: false, error: 'Phone number is required.' });

    if (!/^\+?[0-9\-\s]{8,20}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, error: 'Enter a valid phone number.' });
    }

    const digitCount = normalizedPhone.replace(/\D/g, '').length;
    if (digitCount < 8 || digitCount > 15) {
      return res.status(400).json({ success: false, error: 'Enter a valid phone number.' });
    }

    const allowedRoles = ['farmer', 'transport', 'dealer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }

    const existingUsers = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (existingUsers.length)
      return res.status(400).json({ success: false, error: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const { pool } = require('../config/db');
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role, location, vehicle_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, normalizedPhone, hash, role, location || '', vehicle || '']
    );

    const newUser = await query('SELECT id, name, email, phone, role, location, vehicle_type, created_at FROM users WHERE id = ?', [result.insertId]);
    if (newUser.length) {
      success(res, newUser[0], 201);
    } else {
      success(res, { id: result.insertId, name, email, phone: normalizedPhone, role, location, vehicle, created_at: new Date().toISOString() }, 201);
    }
  } catch (err) {
    console.error(err);
    error(res, 'Registration failed.', 500);
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password required.');

    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!users.length) return error(res, 'Invalid credentials.', 401);

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return error(res, 'Invalid credentials.', 401);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '', role: user.role, location: user.location, vehicle: user.vehicle_type }
    });
  } catch (err) {
    console.error(err);
    error(res, 'Login failed.', 500);
  }
});

module.exports = router;