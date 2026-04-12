const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { normalizeImageList } = require('../utils/inventory');

const router = express.Router();

function isMissingColumnError(err) {
  return err && err.code === 'ER_BAD_FIELD_ERROR';
}

function normalizeCategory(category) {
  const value = String(category || '').trim().toLowerCase();
  if (value === 'fruit' || value === 'fruits') return 'Fruit';
  if (value.includes('vegetable') || value === 'legume') return 'Vegetable';
  return 'Other';
}

router.get('/', auth(), async (req, res) => {
  try {
    let rows;
    try {
      if (req.user.role === 'farmer') {
        rows = await query(
          `SELECT p.*, GREATEST(p.quantity - COALESCE(p.sold_quantity, 0), 0) AS available_quantity,
                  u.location AS farmer_location, u.phone AS farmer_phone
           FROM produce p
           LEFT JOIN users u ON p.farmer_id = u.id
           WHERE p.farmer_id = ?
           ORDER BY p.listed_at DESC`,
          [req.user.id]
        );
      } else if (req.user.role === 'dealer') {
        rows = await query(
          `SELECT p.*, GREATEST(p.quantity - COALESCE(p.sold_quantity, 0), 0) AS available_quantity,
                  u.location AS farmer_location, u.phone AS farmer_phone
           FROM produce p
           LEFT JOIN users u ON p.farmer_id = u.id
           WHERE p.status <> 'Sold' AND GREATEST(p.quantity - COALESCE(p.sold_quantity, 0), 0) > 0
           ORDER BY p.listed_at DESC`
        );
      } else {
        rows = await query(
          `SELECT p.*, GREATEST(p.quantity - COALESCE(p.sold_quantity, 0), 0) AS available_quantity,
                  u.location AS farmer_location, u.phone AS farmer_phone
           FROM produce p
           LEFT JOIN users u ON p.farmer_id = u.id
           ORDER BY p.listed_at DESC`
        );
      }
    } catch (err) {
      if (!isMissingColumnError(err)) throw err;

      try {
        if (req.user.role === 'farmer') {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    u.location AS farmer_location, u.phone AS farmer_phone
             FROM produce p
             LEFT JOIN users u ON p.farmer_id = u.id
             WHERE p.farmer_id = ?
             ORDER BY p.listed_at DESC`,
            [req.user.id]
          );
        } else if (req.user.role === 'dealer') {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    u.location AS farmer_location, u.phone AS farmer_phone
             FROM produce p
             LEFT JOIN users u ON p.farmer_id = u.id
             WHERE p.status <> 'Sold'
             ORDER BY p.listed_at DESC`
          );
        } else {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    u.location AS farmer_location, u.phone AS farmer_phone
             FROM produce p
             LEFT JOIN users u ON p.farmer_id = u.id
             ORDER BY p.listed_at DESC`
          );
        }
      } catch (legacyErr) {
        if (!isMissingColumnError(legacyErr)) throw legacyErr;

        if (req.user.role === 'farmer') {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    '' AS farmer_location, '' AS farmer_phone
             FROM produce p
             WHERE p.farmer_id = ?
             ORDER BY p.listed_at DESC`,
            [req.user.id]
          );
        } else if (req.user.role === 'dealer') {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    '' AS farmer_location, '' AS farmer_phone
             FROM produce p
             WHERE p.status <> 'Sold'
             ORDER BY p.listed_at DESC`
          );
        } else {
          rows = await query(
            `SELECT p.*, p.quantity AS available_quantity,
                    '' AS farmer_location, '' AS farmer_phone
             FROM produce p
             ORDER BY p.listed_at DESC`
          );
        }
      }
    }

    success(res, rows);
  } catch (err) {
    console.error('[produce.get] Failed:', err.code || '', err.message || err);
    error(res, 'Failed to fetch produce.', 500);
  }
});

router.post('/', auth(['farmer']), async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      harvest_date,
      location,
      storage_temp,
      storage_humidity,
      fresh_days,
      storage_tips,
      expected_price_per_kg,
      image_url,
      image_urls,
      short_description,
    } = req.body;

    if (!name || !quantity || !harvest_date || !location) return error(res, 'Required fields missing.');
    const safeCategory = normalizeCategory(category);
    const normalizedImages = normalizeImageList(image_urls);
    const primaryImage = image_url || normalizedImages[0] || null;

    let result;
    try {
      [result] = await pool.execute(
        `INSERT INTO produce (farmer_id, farmer_name, name, category, quantity, sold_quantity, unit, harvest_date, location,
          storage_temp, storage_humidity, fresh_days, short_description, storage_tips, expected_price_per_kg, image_url, image_urls, status)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
        [
          req.user.id,
          req.user.name,
          name,
          safeCategory,
          quantity,
          unit || 'kg',
          harvest_date,
          location,
          storage_temp || '',
          storage_humidity || '',
          fresh_days || 0,
          short_description || '',
          storage_tips || '',
          expected_price_per_kg || null,
          primaryImage,
          normalizedImages.length ? JSON.stringify(normalizedImages) : null,
        ]
      );
    } catch (err) {
      if (!isMissingColumnError(err)) throw err;

      try {
        [result] = await pool.execute(
          `INSERT INTO produce (farmer_id, farmer_name, name, category, quantity, unit, harvest_date, location,
            storage_temp, storage_humidity, fresh_days, storage_tips, expected_price_per_kg, image_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
          [
            req.user.id,
            req.user.name,
            name,
            safeCategory,
            quantity,
            unit || 'kg',
            harvest_date,
            location,
            storage_temp || '',
            storage_humidity || '',
            fresh_days || 0,
            storage_tips || '',
            expected_price_per_kg || null,
            primaryImage,
          ]
        );
      } catch (legacyErr) {
        if (!isMissingColumnError(legacyErr)) throw legacyErr;

        [result] = await pool.execute(
          `INSERT INTO produce (farmer_id, farmer_name, name, category, quantity, unit, harvest_date, location, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
          [
            req.user.id,
            req.user.name,
            name,
            safeCategory,
            quantity,
            unit || 'kg',
            harvest_date,
            location,
          ]
        );
      }
    }

    const [newItem] = await query('SELECT * FROM produce WHERE id = ?', [result.insertId]);
    success(res, newItem, 201);
  } catch (err) {
    console.error('[produce.post] Failed:', err.code || '', err.message || err);
    error(res, 'Failed to add produce.', 500);
  }
});

router.delete('/:id', auth(['farmer', 'admin']), async (req, res) => {
  try {
    const item = await query('SELECT * FROM produce WHERE id = ?', [req.params.id]);
    if (!item.length) return error(res, 'Produce not found.', 404);
    if (req.user.role === 'farmer' && item[0].farmer_id !== req.user.id) return error(res, 'Not your listing.', 403);

    await query('DELETE FROM produce WHERE id = ?', [req.params.id]);
    success(res, { message: 'Produce removed.' });
  } catch (err) {
    error(res, 'Failed to delete produce.', 500);
  }
});

router.patch('/:id/status', auth(['farmer', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Sold', 'Reserved'].includes(status)) return error(res, 'Invalid status.');

    const item = await query('SELECT * FROM produce WHERE id = ?', [req.params.id]);
    if (!item.length) return error(res, 'Produce not found.', 404);

    if (req.user.role === 'farmer' && item[0].farmer_id !== req.user.id) {
      return error(res, 'Not your produce.', 403);
    }

    await query('UPDATE produce SET status = ? WHERE id = ?', [status, req.params.id]);
    success(res, { message: 'Status updated.' });
  } catch (err) {
    error(res, 'Failed to update status.', 500);
  }
});

module.exports = router;