const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildProposalWindow,
  isProposalVisibleToDealer,
  expireProposalIfNeeded,
  convertProposalOnDealerAcceptance,
} = require('../utils/proposalLifecycle');

test('buildProposalWindow creates a 1 hour dealer window', () => {
  const approvedAt = new Date('2026-04-09T10:00:00Z');
  const window = buildProposalWindow(approvedAt);

  assert.equal(window.publishedAt.toISOString(), '2026-04-09T10:00:00.000Z');
  assert.equal(window.expiresAt.toISOString(), '2026-04-09T11:00:00.000Z');
});

test('isProposalVisibleToDealer only returns true while published and not expired', () => {
  const proposal = {
    status: 'Published',
    publishedAt: new Date('2026-04-09T10:00:00Z'),
    expiresAt: new Date('2026-04-09T11:00:00Z'),
    convertedAt: null,
  };

  assert.equal(isProposalVisibleToDealer(proposal, new Date('2026-04-09T10:30:00Z')), true);
  assert.equal(isProposalVisibleToDealer(proposal, new Date('2026-04-09T11:00:01Z')), false);
});

test('expireProposalIfNeeded marks proposals expired after the window', () => {
  const proposal = {
    status: 'Published',
    publishedAt: new Date('2026-04-09T10:00:00Z'),
    expiresAt: new Date('2026-04-09T11:00:00Z'),
    convertedAt: null,
  };

  const expired = expireProposalIfNeeded(proposal, new Date('2026-04-09T11:00:01Z'));
  assert.equal(expired.status, 'Expired');
});

test('convertProposalOnDealerAcceptance rejects expired proposals', () => {
  const proposal = {
    id: 1,
    status: 'Published',
    publishedAt: new Date('2026-04-09T10:00:00Z'),
    expiresAt: new Date('2026-04-09T11:00:00Z'),
    routeFrom: 'Comilla',
    routeTo: 'Rajshahi',
  };

  assert.throws(() => {
    convertProposalOnDealerAcceptance(proposal, new Date('2026-04-09T11:00:01Z'));
  }, /expired/i);
});
