const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { parseQuantityValue, getInventoryState } = require('../utils/inventory');

const router = express.Router();

function isMissingColumnError(err) {
  return err && err.code === 'ER_BAD_FIELD_ERROR';
}

router.get('/', auth(), async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'farmer') {
      rows = await query(
        `SELECT d.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                ud.location AS dealer_location, ud.phone AS dealer_phone
         FROM deals d
         LEFT JOIN users uf ON d.farmer_id = uf.id
         LEFT JOIN users ud ON d.dealer_id = ud.id
         WHERE d.farmer_id = ?
         ORDER BY d.created_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'dealer') {
      rows = await query(
        `SELECT d.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                ud.location AS dealer_location, ud.phone AS dealer_phone
         FROM deals d
         LEFT JOIN users uf ON d.farmer_id = uf.id
         LEFT JOIN users ud ON d.dealer_id = ud.id
         WHERE d.dealer_id = ?
         ORDER BY d.created_at DESC`,
        [req.user.id]
      );
    } else {
      rows = await query(
        `SELECT d.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                ud.location AS dealer_location, ud.phone AS dealer_phone
         FROM deals d
         LEFT JOIN users uf ON d.farmer_id = uf.id
         LEFT JOIN users ud ON d.dealer_id = ud.id
         ORDER BY d.created_at DESC`
      );
    }

    success(res, rows);
  } catch (err) {
    error(res, 'Failed to fetch deals.', 500);
  }
});

router.post('/', auth(['dealer']), async (req, res) => {
  try {
    const { farmer_id, farmer_name, product_id, produce_name, quantity_requested, offered_price_per_kg, message } = req.body;
    if (!offered_price_per_kg) return error(res, 'Required fields missing.');

    const requestedQuantity = parseQuantityValue(quantity_requested);
    if (!requestedQuantity || requestedQuantity <= 0) {
      return error(res, 'Deal quantity must be greater than 0.', 400);
    }

    let canonicalFarmerId = farmer_id;
    let canonicalFarmerName = farmer_name;
    let canonicalProduceName = produce_name;
    let canonicalProductId = product_id || null;

    if (product_id) {
      const produce = await query('SELECT p.*, u.name as farmer_name FROM produce p LEFT JOIN users u ON p.farmer_id = u.id WHERE p.id = ?', [product_id]);
      if (!produce.length) return error(res, 'Product not found.', 404);
      if (produce[0].status === 'Sold') return error(res, 'Product is not available.');
      if (farmer_id && produce[0].farmer_id !== farmer_id) return error(res, 'Farmer does not match product owner.', 400);

      const inventory = getInventoryState(produce[0].quantity, produce[0].sold_quantity);
      if (requestedQuantity > inventory.availableQuantity) {
        return error(res, `Only ${inventory.availableQuantity} ${produce[0].unit || 'kg'} available for offer.`, 409);
      }

      canonicalFarmerId = produce[0].farmer_id;
      canonicalFarmerName = produce[0].farmer_name;
      canonicalProduceName = produce[0].name;
      canonicalProductId = produce[0].id;
    } else {
      if (!farmer_id || !produce_name) return error(res, 'Farmer and produce required.');
      const farmer = await query('SELECT name FROM users WHERE id = ? AND role = "farmer"', [farmer_id]);
      if (!farmer.length) return error(res, 'Farmer not found.', 404);
      canonicalFarmerName = farmer[0].name;
    }

    const [result] = await pool.execute(
      `INSERT INTO deals (dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name, quantity_requested, offered_price_per_kg, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [req.user.id, req.user.name, canonicalFarmerId, canonicalFarmerName, canonicalProductId, canonicalProduceName, String(requestedQuantity), offered_price_per_kg, message || '']
    );

    if (canonicalProductId) {
      await pool.execute(
        'INSERT INTO price_history (product_id, dealer_id, offered_price_per_kg) VALUES (?, ?, ?)',
        [canonicalProductId, req.user.id, offered_price_per_kg]
      );
    }

    const [newItem] = await query('SELECT * FROM deals WHERE id = ?', [result.insertId]);
    success(res, newItem, 201);
  } catch (err) {
    error(res, 'Failed to create deal.', 500);
  }
});

router.patch('/:id', auth(['farmer', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Declined'].includes(status)) return error(res, 'Invalid status.');

    const item = await query('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!item.length) return error(res, 'Deal not found.', 404);
    if (item[0].status !== 'Pending') return error(res, 'Deal already responded.', 400);
    if (req.user.role === 'farmer' && item[0].farmer_id !== req.user.id) return error(res, 'Not your deal.', 403);

    if (status === 'Declined' || !item[0].product_id) {
      await query('UPDATE deals SET status = ?, responded_at = NOW() WHERE id = ?', [status, req.params.id]);
      return success(res, { message: `Deal ${status.toLowerCase()}.` });
    }

    const requestedQuantity = parseQuantityValue(item[0].quantity_requested);
    if (!requestedQuantity || requestedQuantity <= 0) return error(res, 'Deal quantity is invalid.', 400);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      try {
        const [produceRows] = await conn.execute(
          'SELECT id, quantity, sold_quantity, status FROM produce WHERE id = ? FOR UPDATE',
          [item[0].product_id]
        );

        if (!produceRows.length) {
          await conn.rollback();
          return error(res, 'Product not found.', 404);
        }

        const inventory = getInventoryState(produceRows[0].quantity, produceRows[0].sold_quantity);
        if (inventory.availableQuantity < requestedQuantity) {
          await conn.rollback();
          return error(res, 'Not enough available stock for this deal.', 409);
        }

        const nextSoldQuantity = inventory.soldQuantity + requestedQuantity;
        const nextStatus = nextSoldQuantity >= inventory.totalQuantity ? 'Sold' : 'Reserved';

        await conn.execute(
          'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [nextSoldQuantity, nextStatus, item[0].product_id]
        );
      } catch (invErr) {
        if (!isMissingColumnError(invErr)) throw invErr;

        // Legacy schema fallback (no sold_quantity column yet)
        const [produceRowsLegacy] = await conn.execute(
          'SELECT id, quantity, status FROM produce WHERE id = ? FOR UPDATE',
          [item[0].product_id]
        );

        if (!produceRowsLegacy.length) {
          await conn.rollback();
          return error(res, 'Product not found.', 404);
        }

        const totalQuantity = Number(produceRowsLegacy[0].quantity || 0);
        if (requestedQuantity > totalQuantity) {
          await conn.rollback();
          return error(res, 'Not enough available stock for this deal.', 409);
        }

        const nextStatus = requestedQuantity >= totalQuantity ? 'Sold' : 'Reserved';
        await conn.execute(
          'UPDATE produce SET status = ?, updated_at = NOW() WHERE id = ?',
          [nextStatus, item[0].product_id]
        );
      }

      await conn.execute(
        'UPDATE deals SET status = ?, responded_at = NOW() WHERE id = ?',
        [status, req.params.id]
      );

      await conn.commit();
      return success(res, { message: `Deal ${status.toLowerCase()}.` });
    } catch (txErr) {
      await conn.rollback();
      console.error('[deals.patch.tx] Failed:', txErr.code || '', txErr.message || txErr);
      return error(res, 'Failed to update deal.', 500);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[deals.patch] Failed:', err.code || '', err.message || err);
    error(res, 'Failed to update deal.', 500);
  }
});

module.exports = router;