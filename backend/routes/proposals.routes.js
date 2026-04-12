const express = require('express');
const { query, pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const {
  buildProposalWindow,
  isProposalVisibleToDealer,
  expireProposalIfNeeded,
  convertProposalOnDealerAcceptance,
} = require('../utils/proposalLifecycle');

const router = express.Router();

async function expireStalePublishedProposals() {
  await pool.execute(
    `UPDATE transport_proposals
     SET status = 'Expired', updated_at = NOW()
     WHERE status = 'Published' AND expires_at IS NOT NULL AND expires_at <= NOW()`
  );
}

function serializeProposal(row) {
  const proposal = expireProposalIfNeeded(row);
  return {
    ...proposal,
    published_at: proposal.published_at || proposal.publishedAt || null,
    expires_at: proposal.expires_at || proposal.expiresAt || null,
    converted_at: proposal.converted_at || proposal.convertedAt || null,
  };
}

router.get('/', auth(), async (req, res) => {
  try {
    await expireStalePublishedProposals();

    let rows;
    if (req.user.role === 'transport') {
      rows = await query(
        `SELECT tp.*, tf.location AS transport_provider_location, tf.phone AS transport_provider_phone,
                fu.location AS farmer_location, fu.phone AS farmer_phone,
                du.location AS converted_dealer_location, du.phone AS converted_dealer_phone
         FROM transport_proposals tp
         LEFT JOIN users tf ON tp.transport_provider_id = tf.id
         LEFT JOIN users fu ON tp.farmer_id = fu.id
         LEFT JOIN users du ON tp.converted_dealer_id = du.id
         WHERE tp.transport_provider_id = ?
         ORDER BY tp.created_at DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'dealer') {
      rows = await query(
      `SELECT tp.*, tf.location AS transport_provider_location, '' AS transport_provider_phone,
        fu.location AS farmer_location, '' AS farmer_phone,
                du.location AS converted_dealer_location, du.phone AS converted_dealer_phone
         FROM transport_proposals tp
         LEFT JOIN users tf ON tp.transport_provider_id = tf.id
         LEFT JOIN users fu ON tp.farmer_id = fu.id
         LEFT JOIN users du ON tp.converted_dealer_id = du.id
         WHERE tp.status = 'Published' AND (tp.expires_at IS NULL OR tp.expires_at > NOW())
         ORDER BY tp.published_at DESC, tp.created_at DESC`
      );
      rows = rows.filter((row) => isProposalVisibleToDealer(row));
    } else if (req.user.role === 'farmer') {
      rows = await query(
        `SELECT tp.*, tf.location AS transport_provider_location,
                CASE WHEN tp.farmer_id = ? THEN tf.phone ELSE '' END AS transport_provider_phone,
                fu.location AS farmer_location,
                CASE WHEN tp.farmer_id = ? THEN fu.phone ELSE '' END AS farmer_phone,
                du.location AS converted_dealer_location,
                CASE WHEN tp.farmer_id = ? THEN du.phone ELSE '' END AS converted_dealer_phone
         FROM transport_proposals tp
         LEFT JOIN users tf ON tp.transport_provider_id = tf.id
         LEFT JOIN users fu ON tp.farmer_id = fu.id
         LEFT JOIN users du ON tp.converted_dealer_id = du.id
         WHERE tp.farmer_id IS NULL OR tp.farmer_id = ?
         ORDER BY tp.created_at DESC`,
        [req.user.id, req.user.id, req.user.id, req.user.id]
      );
    } else {
      rows = await query(
        `SELECT tp.*, tf.location AS transport_provider_location, tf.phone AS transport_provider_phone,
                fu.location AS farmer_location, fu.phone AS farmer_phone,
                du.location AS converted_dealer_location, du.phone AS converted_dealer_phone
         FROM transport_proposals tp
         LEFT JOIN users tf ON tp.transport_provider_id = tf.id
         LEFT JOIN users fu ON tp.farmer_id = fu.id
         LEFT JOIN users du ON tp.converted_dealer_id = du.id
         ORDER BY tp.created_at DESC`
      );
    }

    success(res, rows.map(serializeProposal));
  } catch (err) {
    error(res, 'Failed to fetch transport proposals.', 500);
  }
});

router.post('/', auth(['transport']), async (req, res) => {
  try {
    const {
      current_location,
      fruit_type,
      harvest_date,
      preferred_dealer_location,
      notes,
    } = req.body;

    if (!current_location || !fruit_type || !harvest_date || !preferred_dealer_location) {
      return error(res, 'Current location, fruit type, harvest date, and preferred dealer location are required.');
    }

    const [result] = await pool.execute(
      `INSERT INTO transport_proposals
       (transport_provider_id, transport_provider_name, current_location, fruit_type, harvest_date, preferred_dealer_location, notes, route_from, route_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PendingReview')`,
      [req.user.id, req.user.name, current_location, fruit_type, harvest_date, preferred_dealer_location, notes || '', current_location, preferred_dealer_location]
    );

    const [rows] = await pool.execute('SELECT * FROM transport_proposals WHERE id = ?', [result.insertId]);
    success(res, rows[0], 201);
  } catch (err) {
    error(res, 'Failed to create transport proposal.', 500);
  }
});

router.patch('/:id', auth(['admin', 'farmer', 'dealer', 'transport']), async (req, res) => {
  try {
    const { action } = req.body;
    const [rows] = await pool.execute('SELECT * FROM transport_proposals WHERE id = ?', [req.params.id]);
    if (!rows.length) return error(res, 'Proposal not found.', 404);

    const proposal = rows[0];

    if (String(action || '').toLowerCase() === 'request_price') {
      if (req.user.role !== 'admin') return error(res, 'Only admin can request farmer price.', 403);
      const { farmer_id, farmer_name, admin_notes } = req.body;
      if (!farmer_id) return error(res, 'Farmer is required to request price.');

      const farmer = await query("SELECT id, name FROM users WHERE id = ? AND role = 'farmer'", [farmer_id]);
      if (!farmer.length) return error(res, 'Farmer not found.', 404);

      await pool.execute(
        `UPDATE transport_proposals
         SET farmer_id = ?, farmer_name = ?, admin_notes = ?, status = 'AwaitingFarmerPrice'
         WHERE id = ?`,
        [farmer[0].id, farmer_name || farmer[0].name, admin_notes || '', req.params.id]
      );
      return success(res, { message: 'Price requested from farmer.' });
    }

    if (String(action || '').toLowerCase() === 'submit_price') {
      if (req.user.role !== 'farmer') return error(res, 'Only farmer can submit price.');
      if (proposal.farmer_id && proposal.farmer_id !== req.user.id) return error(res, 'Not your proposal.', 403);
      if (!['PendingReview', 'AwaitingFarmerPrice'].includes(proposal.status)) return error(res, 'Proposal is not awaiting price.');

      const { farmer_price, admin_notes } = req.body;
      if (farmer_price === undefined || farmer_price === null || farmer_price === '') return error(res, 'Farmer price is required.');

      await pool.execute(
        `UPDATE transport_proposals
         SET farmer_id = ?, farmer_name = ?, farmer_price = ?, admin_notes = ?, status = 'AwaitingAdminApproval'
         WHERE id = ?`,
        [req.user.id, req.user.name, farmer_price, admin_notes || proposal.admin_notes || '', req.params.id]
      );
      return success(res, { message: 'Farmer price submitted.' });
    }

    if (String(action || '').toLowerCase() === 'approve') {
      if (req.user.role !== 'admin') return error(res, 'Only admin can approve proposal.', 403);
      if (!proposal.farmer_price) return error(res, 'Farmer price is required before approval.');

      const { publishedAt, expiresAt } = buildProposalWindow();
      await pool.execute(
        `UPDATE transport_proposals
         SET status = 'Published', published_at = ?, expires_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [publishedAt, expiresAt, req.params.id]
      );
      return success(res, { message: 'Proposal approved and published.', published_at: publishedAt, expires_at: expiresAt });
    }

    if (String(action || '').toLowerCase() === 'accept') {
      if (req.user.role !== 'dealer') return error(res, 'Only dealer can accept proposal.', 403);

      await expireStalePublishedProposals();
      const [freshRows] = await pool.execute('SELECT * FROM transport_proposals WHERE id = ?', [req.params.id]);
      if (!freshRows.length) return error(res, 'Proposal not found.', 404);

      const freshProposal = freshRows[0];
      if (!isProposalVisibleToDealer(freshProposal)) {
        await pool.execute(
          `UPDATE transport_proposals
           SET status = 'Expired', updated_at = NOW()
           WHERE id = ? AND status = 'Published'`,
          [req.params.id]
        );
        return error(res, 'Proposal has expired.', 410);
      }

      const converted = convertProposalOnDealerAcceptance(freshProposal);
      await pool.execute(
        `UPDATE transport_proposals
         SET status = 'Converted', converted_at = ?, converted_dealer_id = ?, converted_dealer_name = ?, route_from = ?, route_to = ?, updated_at = NOW()
         WHERE id = ?`,
        [converted.convertedAt, req.user.id, req.user.name, freshProposal.current_location, freshProposal.preferred_dealer_location, req.params.id]
      );
      return success(res, { message: 'Proposal accepted and route updated.' });
    }

    if (String(action || '').toLowerCase() === 'complete') {
      if (!['admin', 'transport'].includes(req.user.role)) return error(res, 'Only admin or transport can complete proposal.', 403);
      if (proposal.status !== 'Converted') return error(res, 'Only converted proposals can be completed.', 400);

      if (req.user.role === 'transport' && proposal.transport_provider_id !== req.user.id) {
        return error(res, 'You can only complete your own proposals.', 403);
      }

      const linkedRequests = await query(
        `SELECT id
         FROM transport_requests
         WHERE status = 'Completed'
           AND farmer_id = ?
           AND pickup_location = ?
           AND destination = ?
           AND produce_name = ?
           AND updated_at >= ?
         LIMIT 1`,
        [
          proposal.farmer_id,
          proposal.route_from || proposal.current_location,
          proposal.route_to || proposal.preferred_dealer_location,
          proposal.fruit_type,
          proposal.converted_at || proposal.created_at,
        ]
      );

      if (!linkedRequests.length) {
        return error(res, 'No completed transport request found for this route yet.', 400);
      }

      await pool.execute(
        `UPDATE transport_proposals
         SET status = 'Completed', updated_at = NOW()
         WHERE id = ?`,
        [req.params.id]
      );
      return success(res, { message: 'Proposal marked as completed.' });
    }

    return error(res, 'Invalid proposal action.');
  } catch (err) {
    error(res, 'Failed to update proposal.', 500);
  }
});

module.exports = router;