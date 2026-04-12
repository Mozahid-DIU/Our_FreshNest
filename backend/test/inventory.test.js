const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseQuantityValue,
  normalizeImageList,
  getInventoryState,
} = require('../utils/inventory');

test('parseQuantityValue extracts numeric quantities from strings', () => {
  assert.equal(parseQuantityValue('200 kg'), 200);
  assert.equal(parseQuantityValue('12.5 ton'), 12.5);
  assert.equal(parseQuantityValue('no quantity'), null);
});

test('normalizeImageList returns up to three cleaned images', () => {
  assert.deepEqual(normalizeImageList(['  a.jpg  ', '', 'b.jpg', 'c.jpg', 'd.jpg']), ['a.jpg', 'b.jpg', 'c.jpg']);
  assert.deepEqual(normalizeImageList('["x.jpg","y.jpg"]'), ['x.jpg', 'y.jpg']);
});

test('getInventoryState calculates available quantity and status', () => {
  assert.deepEqual(getInventoryState(100, 0), {
    totalQuantity: 100,
    soldQuantity: 0,
    availableQuantity: 100,
    status: 'Available',
  });

  assert.deepEqual(getInventoryState(100, 40), {
    totalQuantity: 100,
    soldQuantity: 40,
    availableQuantity: 60,
    status: 'Reserved',
  });

  assert.deepEqual(getInventoryState(100, 100), {
    totalQuantity: 100,
    soldQuantity: 100,
    availableQuantity: 0,
    status: 'Sold',
  });
});