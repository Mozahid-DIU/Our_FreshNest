const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { parseQuantityValue } = require('../utils/inventory');

const router = express.Router();

function isMissingColumnError(err) {
  return err && err.code === 'ER_BAD_FIELD_ERROR';
}

router.get('/', auth(['farmer', 'transport', 'admin', 'dealer']), async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'farmer') {
      rows = await query(
        `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                ut.location AS transporter_location, ut.phone AS transporter_phone
         FROM transport_requests tr
         LEFT JOIN users uf ON tr.farmer_id = uf.id
         LEFT JOIN users ut ON tr.assigned_to = ut.id
         WHERE tr.farmer_id = ?
         ORDER BY tr.created_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'transport') {
      try {
        rows = await query(
          `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                  ut.location AS transporter_location, ut.phone AS transporter_phone,
                  COALESCE(
                    tr.dealer_id,
                    (
                      SELECT d.dealer_id
                      FROM deals d
                      WHERE d.product_id = tr.product_id AND d.farmer_id = tr.farmer_id AND d.status = 'Accepted'
                      ORDER BY d.responded_at DESC, d.created_at DESC
                      LIMIT 1
                    )
                  ) AS dealer_id,
                  COALESCE(
                    tr.dealer_name,
                    (
                      SELECT d.dealer_name
                      FROM deals d
                      WHERE d.product_id = tr.product_id AND d.farmer_id = tr.farmer_id AND d.status = 'Accepted'
                      ORDER BY d.responded_at DESC, d.created_at DESC
                      LIMIT 1
                    )
                  ) AS dealer_name,
                  COALESCE(
                    tr.dealer_phone,
                    (
                      SELECT u.phone
                      FROM deals d
                      LEFT JOIN users u ON u.id = d.dealer_id
                      WHERE d.product_id = tr.product_id AND d.farmer_id = tr.farmer_id AND d.status = 'Accepted'
                      ORDER BY d.responded_at DESC, d.created_at DESC
                      LIMIT 1
                    )
                  ) AS dealer_phone,
                  COALESCE(
                    tr.dealer_location,
                    (
                      SELECT u.location
                      FROM deals d
                      LEFT JOIN users u ON u.id = d.dealer_id
                      WHERE d.product_id = tr.product_id AND d.farmer_id = tr.farmer_id AND d.status = 'Accepted'
                      ORDER BY d.responded_at DESC, d.created_at DESC
                      LIMIT 1
                    )
                  ) AS dealer_location
           FROM transport_requests tr
           LEFT JOIN users uf ON tr.farmer_id = uf.id
           LEFT JOIN users ut ON tr.assigned_to = ut.id
           WHERE tr.status = 'Open' OR tr.assigned_to = ?
           ORDER BY tr.created_at DESC`,
          [req.user.id]
        );
      } catch (transportReadErr) {
        if (!isMissingColumnError(transportReadErr)) throw transportReadErr;

        // Legacy schema fallback before dealer columns are migrated.
        rows = await query(
          `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                  ut.location AS transporter_location, ut.phone AS transporter_phone
           FROM transport_requests tr
           LEFT JOIN users uf ON tr.farmer_id = uf.id
           LEFT JOIN users ut ON tr.assigned_to = ut.id
           WHERE tr.status = 'Open' OR tr.assigned_to = ?
           ORDER BY tr.created_at DESC`,
          [req.user.id]
        );
      }

      rows = rows.map((item) => (item.assigned_to !== req.user.id ? { ...item, farmer_phone: '', contact_phone: '' } : item));
    } else if (req.user.role === 'dealer') {
      try {
        rows = await query(
          `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                  ut.location AS transporter_location, ut.phone AS transporter_phone
           FROM transport_requests tr
           LEFT JOIN users uf ON tr.farmer_id = uf.id
           LEFT JOIN users ut ON tr.assigned_to = ut.id
           WHERE tr.dealer_id = ?
           ORDER BY tr.created_at DESC`,
          [req.user.id]
        );
      } catch (dealerReadErr) {
        if (!isMissingColumnError(dealerReadErr)) throw dealerReadErr;

        // Legacy schema fallback before dealer_id migration is applied.
        rows = await query(
          `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                  ut.location AS transporter_location, ut.phone AS transporter_phone,
                  d.dealer_id, d.dealer_name, ud.phone AS dealer_phone, ud.location AS dealer_location
           FROM transport_requests tr
           LEFT JOIN users uf ON tr.farmer_id = uf.id
           LEFT JOIN users ut ON tr.assigned_to = ut.id
           INNER JOIN deals d ON d.product_id = tr.product_id AND d.status = 'Accepted'
           LEFT JOIN users ud ON d.dealer_id = ud.id
           WHERE d.dealer_id = ?
           ORDER BY tr.created_at DESC`,
          [req.user.id]
        );
      }
    } else {
      rows = await query(
        `SELECT tr.*, uf.location AS farmer_location, uf.phone AS farmer_phone,
                ut.location AS transporter_location, ut.phone AS transporter_phone
         FROM transport_requests tr
         LEFT JOIN users uf ON tr.farmer_id = uf.id
         LEFT JOIN users ut ON tr.assigned_to = ut.id
         ORDER BY tr.created_at DESC`
      );
    }

    success(res, rows);
  } catch (err) {
    error(res, 'Failed to fetch transport requests.', 500);
  }
});

router.post('/', auth(['farmer']), async (req, res) => {
  try {
    const {
      product_id,
      produce_name,
      contact_phone,
      pickup_location,
      destination,
      pickup_date,
      quantity,
      notes,
      description,
      dealer_id,
      dealer_name,
      dealer_phone,
      dealer_location,
    } = req.body;
    if (!destination) return error(res, 'Destination required.');
    if (!product_id) return error(res, 'Product selection required.');

    let canonicalProductId = product_id || null;
    let canonicalProduceName = produce_name || '';
    let canonicalPickup = pickup_location || '';

    if (product_id) {
      const [produce] = await query('SELECT id, name, location, farmer_id FROM produce WHERE id = ?', [product_id]);
      if (!produce) return error(res, 'Product not found.', 404);
      if (produce.farmer_id !== req.user.id) return error(res, 'Not your produce.', 403);

      canonicalProductId = produce.id;
      canonicalProduceName = produce.name;
      canonicalPickup = pickup_location || produce.location || '';
    }

    if (!canonicalProduceName) return error(res, 'Produce required.');
    if (!canonicalPickup) return error(res, 'Pickup location required.');

    const safePickupDate = pickup_date || null;
    const safeQuantity = quantity || '';
    const safeNotes = notes || description || '';
    const safePhone = contact_phone || req.user.phone || '';
    let safeDealerId = Number.isFinite(Number(dealer_id)) ? Number(dealer_id) : null;
    let safeDealerName = dealer_name ? String(dealer_name).trim() : '';
    let safeDealerPhone = dealer_phone ? String(dealer_phone).trim() : '';
    let safeDealerLocation = dealer_location ? String(dealer_location).trim() : '';

    if (!safeDealerName && canonicalProductId) {
      const [matchedDeal] = await query(
        `SELECT d.dealer_id, d.dealer_name, u.phone AS dealer_phone, u.location AS dealer_location
         FROM deals d
         LEFT JOIN users u ON d.dealer_id = u.id
         WHERE d.product_id = ? AND d.farmer_id = ? AND d.status = 'Accepted'
         ORDER BY d.responded_at DESC, d.created_at DESC
         LIMIT 1`,
        [canonicalProductId, req.user.id]
      );

      if (matchedDeal) {
        if (!safeDealerId && matchedDeal.dealer_id) safeDealerId = matchedDeal.dealer_id;
        if (!safeDealerName) safeDealerName = matchedDeal.dealer_name || '';
        if (!safeDealerPhone) safeDealerPhone = matchedDeal.dealer_phone || '';
        if (!safeDealerLocation) safeDealerLocation = matchedDeal.dealer_location || '';
      }
    }

    let result;
    try {
      [result] = await pool.execute(
        `INSERT INTO transport_requests (
           farmer_id, farmer_name, product_id, produce_name, contact_phone,
           dealer_id, dealer_name, dealer_phone, dealer_location,
           pickup_location, destination, pickup_date, quantity, notes, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
        [
          req.user.id,
          req.user.name,
          canonicalProductId,
          canonicalProduceName,
          safePhone,
          safeDealerId,
          safeDealerName,
          safeDealerPhone,
          safeDealerLocation,
          canonicalPickup,
          destination,
          safePickupDate,
          safeQuantity,
          safeNotes,
        ]
      );
    } catch (insertErr) {
      if (!isMissingColumnError(insertErr)) throw insertErr;

      try {
        // Partial migration fallback (dealer columns missing)
        [result] = await pool.execute(
          `INSERT INTO transport_requests (
             farmer_id, farmer_name, product_id, produce_name, contact_phone,
             pickup_location, destination, pickup_date, quantity, notes, status
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
          [req.user.id, req.user.name, canonicalProductId, canonicalProduceName, safePhone, canonicalPickup, destination, safePickupDate, safeQuantity, safeNotes]
        );
      } catch (fallbackErr) {
        if (!isMissingColumnError(fallbackErr)) throw fallbackErr;

        // Legacy schema fallback (contact/dealer columns unavailable)
        [result] = await pool.execute(
          `INSERT INTO transport_requests (farmer_id, farmer_name, product_id, produce_name, pickup_location, destination, pickup_date, quantity, notes, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
          [req.user.id, req.user.name, canonicalProductId, canonicalProduceName, canonicalPickup, destination, safePickupDate, safeQuantity, safeNotes]
        );
      }
    }

    const [newItem] = await query('SELECT * FROM transport_requests WHERE id = ?', [result.insertId]);
    success(res, newItem, 201);
  } catch (err) {
    console.error('[transport.post] Failed:', err.code || '', err.message || err);
    error(res, 'Failed to create transport request.', 500);
  }
});

router.patch('/:id', auth(['farmer', 'transport', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Open', 'Accepted', 'Completed', 'Cancelled', 'Failed'];
    if (!allowed.includes(status)) return error(res, 'Invalid status.');

    const item = await query('SELECT * FROM transport_requests WHERE id = ?', [req.params.id]);
    if (!item.length) return error(res, 'Request not found.', 404);

    const currentStatus = item[0].status;
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';
    const isTransport = req.user.role === 'transport';
    const isFarmOwner = item[0].farmer_id === req.user.id;
    const isAssigned = item[0].assigned_to === req.user.id;

    if (isTransport && !['Accepted', 'Completed', 'Failed'].includes(status)) {
      return error(res, 'Transporters can only accept, complete, or fail requests.', 403);
    }

    if (isTransport && status === 'Accepted') {
      if (currentStatus !== 'Open') return error(res, 'Can only accept Open requests.');
    } else if (isTransport && (status === 'Completed' || status === 'Failed')) {
      if (!isAssigned) return error(res, 'Only assigned transporter can complete this request.');
      if (currentStatus !== 'Accepted') return error(res, 'Can only complete Accepted requests.');
    } else if (isFarmer && status === 'Cancelled') {
      if (!isFarmOwner) return error(res, 'Not your request.', 403);
      if (currentStatus === 'Completed' || currentStatus === 'Failed') return error(res, 'Cannot cancel completed requests.');
    } else if (!isAdmin && !isFarmer && !isTransport) {
      return error(res, 'Unauthorized role for this action.', 403);
    }

    let sql;
    let params;
    let responseMessage = 'Status updated.';

    if (status === 'Accepted' && isTransport) {
      sql = 'UPDATE transport_requests SET status = ?, assigned_to = ?, transporter_name = ? WHERE id = ? AND status = ?';
      params = [status, req.user.id, req.user.name, req.params.id, 'Open'];
      responseMessage = 'Request accepted.';
    } else if (status === 'Cancelled' && isFarmer) {
      sql = "UPDATE transport_requests SET status = ? WHERE id = ? AND farmer_id = ? AND status IN ('Open','Accepted')";
      params = [status, req.params.id, req.user.id];
    } else if (isAdmin) {
      sql = 'UPDATE transport_requests SET status = ? WHERE id = ?';
      params = [status, req.params.id];
    } else if (isTransport && isAssigned && status === 'Completed') {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [requestRows] = await conn.execute(
          'SELECT id, product_id, farmer_id, dealer_id, quantity FROM transport_requests WHERE id = ? FOR UPDATE',
          [req.params.id]
        );
        if (!requestRows.length) {
          await conn.rollback();
          return error(res, 'Request not found.', 404);
        }

        const [requestUpdate] = await conn.execute(
          "UPDATE transport_requests SET status = ? WHERE id = ? AND assigned_to = ? AND status = 'Accepted'",
          [status, req.params.id, req.user.id]
        );

        if (requestUpdate.affectedRows === 0) {
          await conn.rollback();
          return error(res, 'Request is no longer in accepted state. Please refresh.', 409);
        }

        const request = requestRows[0];
        if (request.product_id) {
          try {
            const [produceRows] = await conn.execute(
              'SELECT id, quantity, sold_quantity FROM produce WHERE id = ? FOR UPDATE',
              [request.product_id]
            );

            if (produceRows.length) {
              const [completedRows] = await conn.execute(
                "SELECT quantity FROM transport_requests WHERE product_id = ? AND status = 'Completed'",
                [request.product_id]
              );

              const totalDelivered = completedRows.reduce((sum, row) => sum + (parseQuantityValue(row.quantity) || 0), 0);
              const totalQuantity = Math.max(Number(produceRows[0].quantity || 0), 0);
              const nextSoldQuantity = Math.min(totalDelivered, totalQuantity);
              const nextStatus = nextSoldQuantity >= totalQuantity ? 'Sold' : nextSoldQuantity > 0 ? 'Reserved' : 'Available';

              await conn.execute(
                'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
                [nextSoldQuantity, nextStatus, request.product_id]
              );
            }
          } catch (produceErr) {
            if (!isMissingColumnError(produceErr)) throw produceErr;
          }

          try {
            let targetDealId = null;

            if (request.dealer_id) {
              const [exactDeals] = await conn.execute(
                `SELECT id
                 FROM deals
                 WHERE product_id = ? AND farmer_id = ? AND dealer_id = ? AND status = 'Accepted'
                 ORDER BY responded_at DESC, created_at DESC
                 LIMIT 1`,
                [request.product_id, request.farmer_id, request.dealer_id]
              );

              if (exactDeals.length) targetDealId = exactDeals[0].id;
            } else {
              const [acceptedDeals] = await conn.execute(
                `SELECT id, dealer_id
                 FROM deals
                 WHERE product_id = ? AND farmer_id = ? AND status = 'Accepted'
                 ORDER BY responded_at DESC, created_at DESC`,
                [request.product_id, request.farmer_id]
              );

              if (acceptedDeals.length === 1) {
                targetDealId = acceptedDeals[0].id;
                if (!request.dealer_id && acceptedDeals[0].dealer_id) {
                  await conn.execute(
                    'UPDATE transport_requests SET dealer_id = ? WHERE id = ?',
                    [acceptedDeals[0].dealer_id, req.params.id]
                  );
                }
              } else if (acceptedDeals.length > 1) {
                await conn.rollback();
                return error(res, 'Multiple accepted deals found. Please assign a dealer before completing this request.', 409);
              }
            }

            if (targetDealId) {
              await conn.execute(
                `UPDATE deals
                 SET status = 'Completed', responded_at = COALESCE(responded_at, NOW()), updated_at = NOW()
                 WHERE id = ?`,
                [targetDealId]
              );
            }
          } catch (dealErr) {
            if (!isMissingColumnError(dealErr)) throw dealErr;
          }
        }

        await conn.commit();
        return success(res, { message: 'Status updated.' });
      } catch (txErr) {
        await conn.rollback();
        return error(res, 'Failed to update transport request.', 500);
      } finally {
        conn.release();
      }
    } else if (isTransport && isAssigned) {
      sql = "UPDATE transport_requests SET status = ? WHERE id = ? AND assigned_to = ? AND status = 'Accepted'";
      params = [status, req.params.id, req.user.id];
    } else {
      return error(res, 'Unauthorized to update this request.', 403);
    }

    const [result] = await pool.execute(sql, params);
    if (status === 'Accepted' && isTransport && result.affectedRows === 0) {
      return error(res, 'Request is no longer open. Please refresh.', 409);
    }
    if (status === 'Cancelled' && isFarmer && result.affectedRows === 0) {
      return error(res, 'Request state changed. Please refresh.', 409);
    }
    if (isTransport && isAssigned && ['Completed', 'Failed'].includes(status) && result.affectedRows === 0) {
      return error(res, 'Request is no longer in accepted state. Please refresh.', 409);
    }

    success(res, { message: responseMessage });
  } catch (err) {
    error(res, 'Failed to update transport request.', 500);
  }
});

module.exports = router;