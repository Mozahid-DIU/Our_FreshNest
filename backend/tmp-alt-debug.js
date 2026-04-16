const { query } = require('./config/db');

(async () => {
  const cols = await query("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'failure_alternative_requests' ORDER BY ORDINAL_POSITION");
  console.log('---COLUMNS---');
  console.log(JSON.stringify(cols, null, 2));

  const rows = await query("SELECT id, failure_id, farmer_id, status, created_at, updated_at, final_price_per_kg, published_at, expires_at, source_deal_id FROM failure_alternative_requests ORDER BY id DESC LIMIT 10");
  console.log('---ROWS---');
  console.log(JSON.stringify(rows, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
