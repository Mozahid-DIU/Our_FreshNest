const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { parseQuantityValue, getInventoryState } = require('../utils/inventory');

const router = express.Router();

router.get('/', auth(), async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'transport') {
      rows = await query(
        'SELECT * FROM delivery_failures WHERE transporter_id = ? ORDER BY reported_at DESC',
        [req.user.id]
      );
    } else if (req.user.role === 'farmer') {
      rows = await query(
        `SELECT df.*
         FROM delivery_failures df
         INNER JOIN transport_requests tr ON tr.id = df.transport_request_id
         WHERE tr.farmer_id = ?
         ORDER BY df.reported_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'dealer') {
      rows = await query(
        `SELECT df.*
         FROM delivery_failures df
         INNER JOIN transport_requests tr ON tr.id = df.transport_request_id
         WHERE tr.dealer_id = ?
         ORDER BY df.reported_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'admin') {
      rows = await query('SELECT * FROM delivery_failures ORDER BY reported_at DESC');
    } else {
      rows = [];
    }
    success(res, rows);
  } catch (err) {
    error(res, 'Failed to fetch failures.', 500);
  }
});

router.post('/', auth(['transport']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { transport_request_id, produce_name, route, reason, notes, alternatives } = req.body;
    if (!transport_request_id || !reason) return error(res, 'Request ID and reason required.');

    await connection.beginTransaction();

    const [requests] = await connection.execute(
      'SELECT * FROM transport_requests WHERE id = ? FOR UPDATE',
      [transport_request_id]
    );
    if (!requests.length) {
      await connection.rollback();
      return error(res, 'Transport request not found.', 404);
    }
    
    const request = requests[0];
    if (request.assigned_to !== req.user.id) {
      await connection.rollback();
      return error(res, 'You are not assigned to this request.', 403);
    }
    if (request.status !== 'Accepted') {
      await connection.rollback();
      return error(res, 'Can only report failure for Accepted requests.', 400);
    }
    
    const [insertResult] = await connection.execute(
      `INSERT INTO delivery_failures (transporter_id, transporter_name, transport_request_id, produce_name, route, reason, notes, alternatives)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.name, transport_request_id, request.produce_name || '', `${request.pickup_location} -> ${request.destination}`, reason, notes || '', JSON.stringify(alternatives || [])]
    );
    
    await connection.execute(
      "UPDATE transport_requests SET status = 'Failed' WHERE id = ?",
      [transport_request_id]
    );
    
    await connection.commit();
    
    const [newItem] = await connection.execute('SELECT * FROM delivery_failures WHERE id = ?', [insertResult.insertId]);
    success(res, newItem[0], 201);
  } catch (err) {
    await connection.rollback();
    error(res, 'Failed to report failure.', 500);
  } finally {
    connection.release();
  }
});

router.get('/alternatives', auth(), async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'transport') {
      rows = await query(
        'SELECT * FROM failure_alternative_requests WHERE transporter_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    } else if (req.user.role === 'farmer') {
      rows = await query(
        'SELECT * FROM failure_alternative_requests WHERE farmer_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    } else if (req.user.role === 'dealer') {
      rows = await query(
        'SELECT * FROM failure_alternative_requests WHERE dealer_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    } else if (req.user.role === 'admin') {
      rows = await query('SELECT * FROM failure_alternative_requests ORDER BY created_at DESC');
    } else {
      return error(res, 'Unauthorized role.', 403);
    }

    success(res, rows);
  } catch (err) {
    error(res, 'Failed to fetch alternative requests.', 500);
  }
});

router.post('/:id/alternatives', auth(['transport']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      quantity,
      current_location,
      fruit_type,
      pickup_date,
      preferred_dealer_location,
      notes,
    } = req.body;

    const currentLocation = String(current_location || '').trim();
    const fruitType = String(fruit_type || '').trim();
    const preferredDealerLocation = String(preferred_dealer_location || '').trim();
    const pickupDate = String(pickup_date || '').trim();

    if (!currentLocation || !fruitType || !pickupDate || !preferredDealerLocation) {
      return error(res, 'Current location, fruits type, date, and preferred dealer location are required.', 400);
    }

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(pickupDate) && !Number.isNaN(Date.parse(`${pickupDate}T00:00:00Z`));
    if (!isValidDate) {
      return error(res, 'Date must be a valid YYYY-MM-DD value.', 400);
    }

    await connection.beginTransaction();

    const [failureRows] = await connection.execute(
      `SELECT df.*, tr.id AS source_transport_request_id, tr.product_id, tr.produce_name,
              tr.quantity AS source_quantity, tr.farmer_id, tr.farmer_name,
              tr.dealer_id, tr.dealer_name, tr.dealer_phone, tr.dealer_location
       FROM delivery_failures df
       INNER JOIN transport_requests tr ON tr.id = df.transport_request_id
       WHERE df.id = ?
       FOR UPDATE`,
      [req.params.id]
    );

    if (!failureRows.length) {
      await connection.rollback();
      return error(res, 'Failure record not found.', 404);
    }
    const failure = failureRows[0];

    if (failure.transporter_id !== req.user.id) {
      await connection.rollback();
      return error(res, 'You can only create alternatives for your own failure reports.', 403);
    }

    const [sourceRequestRows] = await connection.execute(
      'SELECT id, status FROM transport_requests WHERE id = ? LIMIT 1',
      [failure.source_transport_request_id]
    );

    if (!sourceRequestRows.length || sourceRequestRows[0].status !== 'Failed') {
      await connection.rollback();
      return error(res, 'Alternative request can only be created from a failed transport request.', 400);
    }

    const [existingRows] = await connection.execute(
      `SELECT id
       FROM failure_alternative_requests
       WHERE failure_id = ? AND status IN ('PendingFarmerDecision', 'AcceptedOldPrice', 'AcceptedNewPrice')
       LIMIT 1`,
      [failure.id]
    );
    if (existingRows.length) {
      await connection.rollback();
      return error(res, 'Alternative request already exists for this failure.', 409);
    }

    const sourceQty = parseQuantityValue(failure.source_quantity) || 0;
    const requestedQty = parseQuantityValue(quantity) || sourceQty;
    if (!requestedQty || requestedQty <= 0) {
      await connection.rollback();
      return error(res, 'Alternative quantity must be greater than 0.', 400);
    }
    if (sourceQty > 0 && requestedQty > sourceQty) {
      await connection.rollback();
      return error(res, `Alternative quantity cannot exceed ${sourceQty}.`, 400);
    }

    let dealerId = failure.dealer_id || null;
    let dealerName = failure.dealer_name || '';
    let dealerPhone = failure.dealer_phone || '';
    let dealerLocation = failure.dealer_location || '';
    let requestedPrice = null;

    if (failure.product_id) {
      const [dealRows] = await connection.execute(
        `SELECT d.dealer_id, d.dealer_name, d.offered_price_per_kg, u.phone AS dealer_phone, u.location AS dealer_location
         FROM deals d
         LEFT JOIN users u ON u.id = d.dealer_id
         WHERE d.product_id = ? AND d.farmer_id = ? AND d.status IN ('Accepted','Completed')
         ORDER BY d.responded_at DESC, d.created_at DESC
         LIMIT 1`,
        [failure.product_id, failure.farmer_id]
      );

      if (dealRows.length) {
        const deal = dealRows[0];
        dealerId = dealerId || deal.dealer_id || null;
        dealerName = dealerName || deal.dealer_name || '';
        dealerPhone = dealerPhone || deal.dealer_phone || '';
        dealerLocation = dealerLocation || deal.dealer_location || '';
        requestedPrice = deal.offered_price_per_kg ?? null;
      }
    }

    const [insertResult] = await connection.execute(
      `INSERT INTO failure_alternative_requests (
         failure_id, source_transport_request_id, product_id, produce_name, quantity,
         farmer_id, farmer_name, dealer_id, dealer_name, dealer_phone, dealer_location,
         transporter_id, transporter_name, current_location, fruit_type, pickup_date, preferred_dealer_location,
         requested_price_per_kg, proposed_price_per_kg, decision_notes, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PendingFarmerDecision')`,
      [
        failure.id,
        failure.source_transport_request_id,
        failure.product_id || null,
        failure.produce_name || '',
        requestedQty,
        failure.farmer_id,
        failure.farmer_name || '',
        dealerId,
        dealerName,
        dealerPhone,
        dealerLocation,
        req.user.id,
        req.user.name,
        currentLocation,
        fruitType,
        pickupDate,
        preferredDealerLocation,
        requestedPrice,
        null,
        notes || '',
      ]
    );

    const [newRows] = await connection.execute('SELECT * FROM failure_alternative_requests WHERE id = ?', [insertResult.insertId]);
    await connection.commit();
    success(res, newRows[0], 201);
  } catch (err) {
    await connection.rollback();
    error(res, 'Failed to create alternative request.', 500);
  } finally {
    connection.release();
  }
});

router.patch('/alternatives/:id/decision', auth(['farmer']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { action, new_price_per_kg, notes } = req.body;
    const normalizedAction = String(action || '').toLowerCase();
    if (!['accept_new_price', 'return_product'].includes(normalizedAction)) {
      return error(res, 'Invalid decision action.', 400);
    }

    await connection.beginTransaction();

    const [altRows] = await connection.execute(
      'SELECT * FROM failure_alternative_requests WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!altRows.length) {
      await connection.rollback();
      return error(res, 'Alternative request not found.', 404);
    }

    const alternative = altRows[0];
    if (alternative.farmer_id !== req.user.id) {
      await connection.rollback();
      return error(res, 'Not your alternative request.', 403);
    }
    if (alternative.status !== 'PendingFarmerDecision') {
      await connection.rollback();
      return error(res, 'Alternative request already decided.', 400);
    }

    const [sourceRows] = await connection.execute(
      `SELECT id, pickup_location
       FROM transport_requests
       WHERE id = ?
       LIMIT 1`,
      [alternative.source_transport_request_id]
    );

    if (!sourceRows.length) {
      await connection.rollback();
      return error(res, 'Source transport request not found.', 404);
    }

    const sourceRequest = sourceRows[0];

    if (normalizedAction === 'return_product') {
      const [returnTransportResult] = await connection.execute(
        `INSERT INTO transport_requests (
           farmer_id, farmer_name, product_id, produce_name, contact_phone,
           dealer_id, dealer_name, dealer_phone, dealer_location,
           pickup_location, destination, pickup_date, quantity, notes, status, assigned_to, transporter_name
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', ?, ?)` ,
        [
          alternative.farmer_id,
          alternative.farmer_name,
          alternative.product_id || null,
          alternative.fruit_type || alternative.produce_name,
          '',
          null,
          '',
          '',
          '',
          alternative.current_location,
          sourceRequest.pickup_location,
          alternative.pickup_date || null,
          String(alternative.quantity),
          `Return to farmer requested from alternative #${alternative.id}${notes ? ` | ${notes}` : ''}`,
          alternative.transporter_id,
          alternative.transporter_name || null,
        ]
      );

      if (alternative.product_id) {
        const [produceRows] = await connection.execute(
          'SELECT id, quantity, sold_quantity FROM produce WHERE id = ? FOR UPDATE',
          [alternative.product_id]
        );

        if (produceRows.length) {
          await connection.execute(
            'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
            [0, 'Available', alternative.product_id]
          );
        }

        await connection.execute(
          `UPDATE deals
           SET status = 'Cancelled', updated_at = NOW()
           WHERE id = (
             SELECT id FROM (
               SELECT id
               FROM deals
               WHERE product_id = ? AND farmer_id = ? AND status = 'Accepted'
                 AND (? IS NULL OR dealer_id = ?)
               ORDER BY responded_at DESC, created_at DESC
               LIMIT 1
             ) x
           )`,
          [alternative.product_id, alternative.farmer_id, alternative.dealer_id, alternative.dealer_id]
        );
      }

      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = 'Returned', generated_transport_request_id = ?, decision_notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [returnTransportResult.insertId, notes || '', alternative.id]
      );

      await connection.commit();
      return success(res, { message: 'Return request created and assigned to transporter.' });
    }

    const finalPrice = parseQuantityValue(new_price_per_kg);

    if (!finalPrice || finalPrice <= 0) {
      await connection.rollback();
      return error(res, 'A valid price is required for acceptance.', 400);
    }

    if (alternative.product_id) {
      const [produceRows] = await connection.execute(
        'SELECT id, quantity FROM produce WHERE id = ? FOR UPDATE',
        [alternative.product_id]
      );

      if (produceRows.length) {
        const totalQuantity = Math.max(Number(produceRows[0].quantity) || 0, 0);
        await connection.execute(
          'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [totalQuantity, 'Sold', alternative.product_id]
        );
      }
    }

    const [newTransportResult] = await connection.execute(
      `INSERT INTO transport_requests (
         farmer_id, farmer_name, product_id, produce_name, contact_phone,
         dealer_id, dealer_name, dealer_phone, dealer_location,
         pickup_location, destination, pickup_date, quantity, notes, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [
        alternative.farmer_id,
        alternative.farmer_name,
        alternative.product_id || null,
        alternative.fruit_type || alternative.produce_name,
        '',
        alternative.dealer_id || null,
        alternative.dealer_name || '',
        alternative.dealer_phone || '',
        alternative.preferred_dealer_location || alternative.dealer_location || '',
        alternative.current_location,
        alternative.preferred_dealer_location,
        alternative.pickup_date || null,
        String(alternative.quantity),
        `Alternative request after failure #${alternative.failure_id}${notes ? ` | ${notes}` : ''}`,
      ]
    );

    if (alternative.product_id) {
      await connection.execute(
        `UPDATE deals
         SET offered_price_per_kg = ?, updated_at = NOW()
         WHERE id = (
           SELECT id FROM (
             SELECT id
             FROM deals
             WHERE product_id = ? AND farmer_id = ? AND status = 'Accepted'
               AND (? IS NULL OR dealer_id = ?)
             ORDER BY responded_at DESC, created_at DESC
             LIMIT 1
           ) x
         )`,
        [finalPrice, alternative.product_id, alternative.farmer_id, alternative.dealer_id, alternative.dealer_id]
      );
    }

    await connection.execute(
      `UPDATE failure_alternative_requests
       SET status = ?, final_price_per_kg = ?, generated_transport_request_id = ?, decision_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        'AcceptedNewPrice',
        finalPrice,
        newTransportResult.insertId,
        notes || '',
        alternative.id,
      ]
    );

    await connection.commit();
    return success(res, { message: 'Alternative request accepted and rerouted.' });
  } catch (err) {
    await connection.rollback();
    error(res, 'Failed to process farmer decision.', 500);
  } finally {
    connection.release();
  }
});

module.exports = router;