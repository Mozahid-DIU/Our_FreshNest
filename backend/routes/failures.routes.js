const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { parseQuantityValue } = require('../utils/inventory');

const router = express.Router();
const DEALER_ALTERNATIVE_WINDOW_HOURS = 1;

async function readAlternativeStatusEnum(connection) {
  const [rows] = await connection.execute(
    `SELECT COLUMN_TYPE AS column_type
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'failure_alternative_requests'
       AND COLUMN_NAME = 'status'
     LIMIT 1`
  );

  return String(rows[0]?.column_type || '');
}

function isAlternativeFallbackError(err) {
  const fallbackEligibleCodes = [
    'ER_BAD_FIELD_ERROR',
    'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD',
    'WARN_DATA_TRUNCATED',
    'ER_WARN_DATA_TRUNCATED',
  ];

  return Boolean(err && fallbackEligibleCodes.includes(String(err.code || '')));
}

async function syncProduceInventoryFromAcceptedDeals(connection, productId, farmerId) {
  if (!productId) return;

  const [produceRows] = await connection.execute(
    'SELECT id, quantity FROM produce WHERE id = ? FOR UPDATE',
    [productId]
  );

  if (!produceRows.length) return;

  const totalQuantity = Math.max(Number(produceRows[0].quantity) || 0, 0);
  const [acceptedRows] = await connection.execute(
    `SELECT COALESCE(SUM(CAST(quantity_requested AS DECIMAL(10,2))), 0) AS accepted_quantity
     FROM deals
     WHERE product_id = ? AND farmer_id = ? AND status = 'Accepted'`,
    [productId, farmerId]
  );

  const acceptedQuantity = Math.max(Number(acceptedRows[0]?.accepted_quantity || 0), 0);
  const nextSoldQuantity = Math.min(acceptedQuantity, totalQuantity);
  const nextStatus = nextSoldQuantity >= totalQuantity ? 'Sold' : nextSoldQuantity > 0 ? 'Reserved' : 'Available';

  await connection.execute(
    'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
    [nextSoldQuantity, nextStatus, productId]
  );
}

async function revertAlternativeToInventory(connection, alternative, notes = '') {
  if (!alternative?.product_id) return;

  let releasedQuantity = 0;

  if (alternative.source_deal_id) {
    const [sourceDealRows] = await connection.execute(
      'SELECT id, quantity_requested FROM deals WHERE id = ? AND status = ? LIMIT 1',
      [alternative.source_deal_id, 'Accepted']
    );

    if (sourceDealRows.length) {
      releasedQuantity = Math.max(parseQuantityValue(sourceDealRows[0].quantity_requested) || 0, 0);
      await connection.execute(
        'UPDATE deals SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Cancelled', alternative.source_deal_id]
      );
    }
  }

  if (!releasedQuantity && alternative.dealer_id) {
    const [fallbackDealRows] = await connection.execute(
      `SELECT id, quantity_requested
       FROM deals
       WHERE product_id = ? AND farmer_id = ? AND dealer_id = ? AND status = 'Accepted'
       ORDER BY responded_at DESC, created_at DESC
       LIMIT 1`,
      [alternative.product_id, alternative.farmer_id, alternative.dealer_id]
    );

    if (fallbackDealRows.length) {
      releasedQuantity = Math.max(parseQuantityValue(fallbackDealRows[0].quantity_requested) || 0, 0);
      await connection.execute(
        'UPDATE deals SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Cancelled', fallbackDealRows[0].id]
      );
    }
  }

  const [produceRows] = await connection.execute(
    'SELECT id, quantity, sold_quantity FROM produce WHERE id = ? FOR UPDATE',
    [alternative.product_id]
  );

  if (produceRows.length) {
    const totalQuantity = Math.max(Number(produceRows[0].quantity) || 0, 0);
    const currentSoldQuantity = Math.max(Number(produceRows[0].sold_quantity) || 0, 0);
    const nextSoldQuantity = Math.max(0, currentSoldQuantity - releasedQuantity);
    const normalizedSoldQuantity = Math.min(nextSoldQuantity, totalQuantity);
    const nextStatus = normalizedSoldQuantity === 0 ? 'Available' : normalizedSoldQuantity >= totalQuantity ? 'Sold' : 'Reserved';

    await connection.execute(
      'UPDATE produce SET sold_quantity = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [normalizedSoldQuantity, nextStatus, alternative.product_id]
    );
  }

  if (notes) {
    await connection.execute(
      `UPDATE failure_alternative_requests
       SET decision_notes = TRIM(CONCAT(IFNULL(decision_notes, ''), CASE WHEN IFNULL(decision_notes, '') = '' THEN '' ELSE ' | ' END, ?)), updated_at = NOW()
       WHERE id = ?`,
      [notes, alternative.id]
    );
  }
}

async function expireStalePublishedAlternatives() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT *
       FROM failure_alternative_requests
       WHERE status = 'PublishedToDealers'
         AND expires_at IS NOT NULL
         AND expires_at <= NOW()
       FOR UPDATE`
    );

    for (const alternative of rows) {
      await revertAlternativeToInventory(connection, alternative, 'Auto expired after 1 hour dealer window');
      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = 'ExpiredAutoReturn',
             claimed_dealer_id = NULL,
             claimed_dealer_name = NULL,
             claimed_at = NULL,
             generated_transport_request_id = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [alternative.id]
      );
    }

    await connection.commit();
  } catch (_err) {
    await connection.rollback();
  } finally {
    connection.release();
  }
}

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
    await expireStalePublishedAlternatives();

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
      try {
        rows = await query(
          `SELECT *
           FROM failure_alternative_requests
           WHERE status = 'PublishedToDealers'
              OR (status = 'AcceptedNewPrice' AND DATE_ADD(COALESCE(updated_at, created_at), INTERVAL ? HOUR) > NOW())
              OR claimed_dealer_id = ?
              OR dealer_id = ?
           ORDER BY created_at DESC`,
          [DEALER_ALTERNATIVE_WINDOW_HOURS, req.user.id, req.user.id]
        );
      } catch (dealerReadErr) {
        if (!dealerReadErr || dealerReadErr.code !== 'ER_BAD_FIELD_ERROR') throw dealerReadErr;

        rows = await query(
          `SELECT *
           FROM failure_alternative_requests
           WHERE (status IN ('AcceptedNewPrice', 'PublishedToDealers') AND DATE_ADD(COALESCE(updated_at, created_at), INTERVAL ? HOUR) > NOW())
              OR dealer_id = ?
           ORDER BY created_at DESC`,
          [DEALER_ALTERNATIVE_WINDOW_HOURS, req.user.id]
        );
      }
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
       WHERE failure_id = ? AND status IN ('PendingFarmerDecision', 'PublishedToDealers', 'ClaimedByDealer')
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
    let sourceDealId = null;

    if (failure.product_id) {
      const [dealRows] = await connection.execute(
        `SELECT d.id, d.dealer_id, d.dealer_name, d.offered_price_per_kg, d.status, u.phone AS dealer_phone, u.location AS dealer_location
         FROM deals d
         LEFT JOIN users u ON u.id = d.dealer_id
         WHERE d.product_id = ? AND d.farmer_id = ? AND d.status IN ('Accepted','Completed')
         ORDER BY (d.status = 'Accepted') DESC, d.responded_at DESC, d.created_at DESC
         LIMIT 1`,
        [failure.product_id, failure.farmer_id]
      );

      if (dealRows.length) {
        const deal = dealRows[0];
        sourceDealId = String(deal.status || '').toLowerCase() === 'accepted' ? deal.id : null;
        dealerId = dealerId || deal.dealer_id || null;
        dealerName = dealerName || deal.dealer_name || '';
        dealerPhone = dealerPhone || deal.dealer_phone || '';
        dealerLocation = dealerLocation || deal.dealer_location || '';
        requestedPrice = deal.offered_price_per_kg ?? null;
      }
    }

    let insertResult;
    try {
      [insertResult] = await connection.execute(
        `INSERT INTO failure_alternative_requests (
           failure_id, source_transport_request_id, source_deal_id, product_id, produce_name, quantity,
           farmer_id, farmer_name, dealer_id, dealer_name, dealer_phone, dealer_location,
           transporter_id, transporter_name, current_location, fruit_type, pickup_date, preferred_dealer_location,
           requested_price_per_kg, proposed_price_per_kg, decision_notes, status
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PendingFarmerDecision')`,
        [
          failure.id,
          failure.source_transport_request_id,
          sourceDealId,
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
    } catch (insertErr) {
      if (!insertErr || insertErr.code !== 'ER_BAD_FIELD_ERROR') throw insertErr;

      [insertResult] = await connection.execute(
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
    }

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

    if (normalizedAction === 'return_product') {
      await revertAlternativeToInventory(connection, alternative);

      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = 'Returned', generated_transport_request_id = NULL, decision_notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [notes || '', alternative.id]
      );

      await connection.commit();
      return success(res, { message: 'Product returned to farmer inventory. Transporter can coordinate return manually.' });
    }

    const finalPrice = parseQuantityValue(new_price_per_kg);

    if (!finalPrice || finalPrice <= 0) {
      await connection.rollback();
      return error(res, 'A valid price is required for acceptance.', 400);
    }

    try {
      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = 'PublishedToDealers',
             final_price_per_kg = ?,
             published_at = NOW(),
             expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR),
             claimed_dealer_id = NULL,
             claimed_dealer_name = NULL,
             claimed_at = NULL,
             generated_transport_request_id = NULL,
             decision_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [finalPrice, DEALER_ALTERNATIVE_WINDOW_HOURS, notes || '', alternative.id]
      );
    } catch (publishErr) {
      // Backward-compatible fallback for databases that still use the older schema.
      if (!isAlternativeFallbackError(publishErr)) {
        throw publishErr;
      }

      const enumType = await readAlternativeStatusEnum(connection);
      const fallbackStatus = enumType.includes("'PublishedToDealers'")
        ? 'PublishedToDealers'
        : enumType.includes("'AcceptedNewPrice'")
          ? 'AcceptedNewPrice'
          : 'PendingFarmerDecision';

      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = ?,
             final_price_per_kg = ?,
             decision_notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [fallbackStatus, finalPrice, notes || '', alternative.id]
      );
    }

    await connection.commit();
    return success(res, { message: 'Alternative request published to all dealers for 1 hour.' });
  } catch (err) {
    await connection.rollback();
    error(res, 'Failed to process farmer decision.', 500);
  } finally {
    connection.release();
  }
});

router.patch('/alternatives/:id/accept', auth(['dealer']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await expireStalePublishedAlternatives();
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
    if (!['PublishedToDealers', 'AcceptedNewPrice'].includes(String(alternative.status || ''))) {
      await connection.rollback();
      return error(res, 'Alternative request is no longer available to claim.', 409);
    }

    const isLegacyPublished = String(alternative.status || '') === 'AcceptedNewPrice';
    const hasExplicitExpiry = Boolean(alternative.expires_at);
    if (isLegacyPublished || !hasExplicitExpiry) {
      const fallbackWindowSource = alternative.updated_at || alternative.created_at;
      const fallbackWindowExpiresAt = fallbackWindowSource
        ? new Date(new Date(fallbackWindowSource).getTime() + DEALER_ALTERNATIVE_WINDOW_HOURS * 60 * 60 * 1000)
        : null;

      if (!fallbackWindowExpiresAt || fallbackWindowExpiresAt.getTime() <= Date.now()) {
        await connection.rollback();
        return error(res, 'Alternative request has expired.', 410);
      }
    }

    if (!isLegacyPublished && hasExplicitExpiry && new Date(alternative.expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      await expireStalePublishedAlternatives();
      return error(res, 'Alternative request has expired.', 410);
    }

    const [dealerRows] = await connection.execute(
      'SELECT id, name, phone, location FROM users WHERE id = ? AND role = ? LIMIT 1',
      [req.user.id, 'dealer']
    );
    if (!dealerRows.length) {
      await connection.rollback();
      return error(res, 'Dealer profile not found.', 404);
    }
    const dealer = dealerRows[0];

    const [transportResult] = await connection.execute(
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
        dealer.id,
        dealer.name,
        dealer.phone || '',
        dealer.location || '',
        alternative.current_location,
        alternative.preferred_dealer_location,
        alternative.pickup_date || null,
        String(alternative.quantity),
        `Dealer accepted alternative #${alternative.id}`,
      ]
    );

    if (alternative.product_id) {
      if (alternative.source_deal_id) {
        const [sourceDealRows] = await connection.execute(
          'SELECT id, dealer_id, status FROM deals WHERE id = ? LIMIT 1',
          [alternative.source_deal_id]
        );

        if (sourceDealRows.length && Number(sourceDealRows[0].dealer_id) === Number(dealer.id)) {
          const [sourceUpdateResult] = await connection.execute(
            `UPDATE deals
             SET status = 'Accepted',
                 produce_name = ?,
                 quantity_requested = ?,
                 offered_price_per_kg = ?,
                 message = ?,
                 responded_at = NOW(),
                 updated_at = NOW()
             WHERE id = ? AND status = 'Accepted'`,
            [
              alternative.fruit_type || alternative.produce_name,
              String(alternative.quantity),
              alternative.final_price_per_kg,
              'Accepted from alternative dealer window after transport failure.',
              alternative.source_deal_id,
            ]
          );

          if (!Number(sourceUpdateResult?.affectedRows || 0)) {
            await connection.execute(
              `INSERT INTO deals (
                 dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name,
                 quantity_requested, offered_price_per_kg, message, status, responded_at
               )
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', NOW())`,
              [
                dealer.id,
                dealer.name,
                alternative.farmer_id,
                alternative.farmer_name,
                alternative.product_id,
                alternative.fruit_type || alternative.produce_name,
                String(alternative.quantity),
                alternative.final_price_per_kg,
                'Accepted from alternative dealer window after transport failure.',
              ]
            );
          }
        } else {
          if (sourceDealRows.length && String(sourceDealRows[0].status || '').toLowerCase() === 'accepted') {
            await connection.execute(
              `UPDATE deals
               SET status = 'Cancelled', updated_at = NOW()
               WHERE id = ?`,
              [alternative.source_deal_id]
            );
          }

          await connection.execute(
            `INSERT INTO deals (
               dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name,
               quantity_requested, offered_price_per_kg, message, status, responded_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', NOW())`,
            [
              dealer.id,
              dealer.name,
              alternative.farmer_id,
              alternative.farmer_name,
              alternative.product_id,
              alternative.fruit_type || alternative.produce_name,
              String(alternative.quantity),
              alternative.final_price_per_kg,
              'Accepted from alternative dealer window after transport failure.',
            ]
          );
        }
      } else if (alternative.dealer_id && Number(alternative.dealer_id) !== Number(dealer.id)) {
        await connection.execute(
          `UPDATE deals
           SET status = 'Cancelled', updated_at = NOW()
           WHERE id = (
             SELECT id FROM (
               SELECT id
               FROM deals
               WHERE product_id = ?
                 AND farmer_id = ?
                 AND dealer_id = ?
                 AND status = 'Accepted'
                 AND created_at <= COALESCE(?, NOW())
               ORDER BY responded_at DESC, created_at DESC
               LIMIT 1
             ) x
           )`,
          [alternative.product_id, alternative.farmer_id, alternative.dealer_id, alternative.created_at || null]
        );

        await connection.execute(
          `INSERT INTO deals (
             dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name,
             quantity_requested, offered_price_per_kg, message, status, responded_at
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', NOW())`,
          [
            dealer.id,
            dealer.name,
            alternative.farmer_id,
            alternative.farmer_name,
            alternative.product_id,
            alternative.fruit_type || alternative.produce_name,
            String(alternative.quantity),
            alternative.final_price_per_kg,
            'Accepted from alternative dealer window after transport failure.',
          ]
        );
      } else if (alternative.dealer_id && Number(alternative.dealer_id) === Number(dealer.id)) {
        const [sameDealerAcceptedRows] = await connection.execute(
          `SELECT id
           FROM deals
           WHERE product_id = ? AND farmer_id = ? AND dealer_id = ? AND status = 'Accepted'
           ORDER BY responded_at DESC, created_at DESC
           LIMIT 1`,
          [alternative.product_id, alternative.farmer_id, dealer.id]
        );

        if (sameDealerAcceptedRows.length) {
          await connection.execute(
            `UPDATE deals
             SET produce_name = ?,
                 quantity_requested = ?,
                 offered_price_per_kg = ?,
                 message = ?,
                 responded_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [
              alternative.fruit_type || alternative.produce_name,
              String(alternative.quantity),
              alternative.final_price_per_kg,
              'Accepted from alternative dealer window after transport failure.',
              sameDealerAcceptedRows[0].id,
            ]
          );
        } else {
          await connection.execute(
            `INSERT INTO deals (
               dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name,
               quantity_requested, offered_price_per_kg, message, status, responded_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', NOW())`,
            [
              dealer.id,
              dealer.name,
              alternative.farmer_id,
              alternative.farmer_name,
              alternative.product_id,
              alternative.fruit_type || alternative.produce_name,
              String(alternative.quantity),
              alternative.final_price_per_kg,
              'Accepted from alternative dealer window after transport failure.',
            ]
          );
        }
      } else {
        await connection.execute(
          `INSERT INTO deals (
             dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name,
             quantity_requested, offered_price_per_kg, message, status, responded_at
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Accepted', NOW())`,
          [
            dealer.id,
            dealer.name,
            alternative.farmer_id,
            alternative.farmer_name,
            alternative.product_id,
            alternative.fruit_type || alternative.produce_name,
            String(alternative.quantity),
            alternative.final_price_per_kg,
            'Accepted from alternative dealer window after transport failure.',
          ]
        );
      }

      await syncProduceInventoryFromAcceptedDeals(connection, alternative.product_id, alternative.farmer_id);
    }

    try {
      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = 'ClaimedByDealer',
             claimed_dealer_id = ?,
             claimed_dealer_name = ?,
             claimed_at = NOW(),
             dealer_id = ?,
             dealer_name = ?,
             dealer_phone = ?,
             dealer_location = ?,
             generated_transport_request_id = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          dealer.id,
          dealer.name,
          dealer.id,
          dealer.name,
          dealer.phone || '',
          dealer.location || '',
          transportResult.insertId,
          alternative.id,
        ]
      );
    } catch (claimErr) {
      if (!isAlternativeFallbackError(claimErr)) throw claimErr;

      const enumType = await readAlternativeStatusEnum(connection);
      const fallbackStatus = enumType.includes("'ClaimedByDealer'") ? 'ClaimedByDealer' : 'AcceptedNewPrice';

      await connection.execute(
        `UPDATE failure_alternative_requests
         SET status = ?,
             dealer_id = ?,
             dealer_name = ?,
             dealer_phone = ?,
             dealer_location = ?,
             generated_transport_request_id = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          fallbackStatus,
          dealer.id,
          dealer.name,
          dealer.phone || '',
          dealer.location || '',
          transportResult.insertId,
          alternative.id,
        ]
      );
    }

    await connection.commit();
    return success(res, { message: 'Alternative request accepted. Transport request created.' });
  } catch (err) {
    await connection.rollback();
    return error(res, 'Failed to accept alternative request.', 500);
  } finally {
    connection.release();
  }
});

module.exports = router;