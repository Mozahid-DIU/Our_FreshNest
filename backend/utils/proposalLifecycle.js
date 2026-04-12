const HOUR_IN_MS = 60 * 60 * 1000;

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function buildProposalWindow(approvedAt = new Date(), durationMs = HOUR_IN_MS) {
  const publishedAt = toDate(approvedAt) || new Date();
  return {
    publishedAt,
    expiresAt: new Date(publishedAt.getTime() + durationMs),
  };
}

function isProposalExpired(proposal, now = new Date()) {
  if (!proposal) return false;
  const expiresAt = toDate(proposal.expiresAt || proposal.expires_at);
  const status = String(proposal.status || '').toLowerCase();
  if (!expiresAt) return status === 'published' || status === 'expired';
  return status === 'published' && toDate(now).getTime() >= expiresAt.getTime();
}

function isProposalVisibleToDealer(proposal, now = new Date()) {
  if (!proposal) return false;
  const status = String(proposal.status || '').toLowerCase();
  if (status !== 'published') return false;
  if (proposal.convertedAt || proposal.converted_at) return false;
  const expiresAt = toDate(proposal.expiresAt || proposal.expires_at);
  if (!expiresAt) return false;
  return toDate(now).getTime() < expiresAt.getTime();
}

function expireProposalIfNeeded(proposal, now = new Date()) {
  if (!proposal) return proposal;
  if (!isProposalExpired(proposal, now)) return proposal;
  return {
    ...proposal,
    status: 'Expired',
    expiredAt: toDate(now),
  };
}

function convertProposalOnDealerAcceptance(proposal, now = new Date()) {
  if (!proposal) throw new Error('Proposal not found');
  if (!isProposalVisibleToDealer(proposal, now)) {
    throw new Error('Proposal expired or not available');
  }

  const acceptedAt = toDate(now) || new Date();
  return {
    ...proposal,
    status: 'Converted',
    convertedAt: acceptedAt,
  };
}

module.exports = {
  HOUR_IN_MS,
  buildProposalWindow,
  isProposalExpired,
  isProposalVisibleToDealer,
  expireProposalIfNeeded,
  convertProposalOnDealerAcceptance,
};