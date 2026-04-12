function parseQuantityValue(value) {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeImageList(value) {
  if (!value) return [];

  let items = [];
  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      items = Array.isArray(parsed) ? parsed : [trimmed];
    } catch (_err) {
      items = trimmed.includes(',') ? trimmed.split(',') : [trimmed];
    }
  }

  return items.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3);
}

function getInventoryState(quantity, soldQuantity) {
  const totalQuantity = Math.max(Number(quantity) || 0, 0);
  const sold = Math.max(Number(soldQuantity) || 0, 0);
  const availableQuantity = Math.max(totalQuantity - sold, 0);

  return {
    totalQuantity,
    soldQuantity: sold,
    availableQuantity,
    status: availableQuantity === 0 ? 'Sold' : sold > 0 ? 'Reserved' : 'Available',
  };
}

module.exports = {
  parseQuantityValue,
  normalizeImageList,
  getInventoryState,
};