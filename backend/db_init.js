const mysql = require('mysql2/promise');

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(200)  NOT NULL UNIQUE,
    phone         VARCHAR(20)   DEFAULT '',
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('farmer','transport','dealer','admin') NOT NULL DEFAULT 'farmer',
    location      VARCHAR(150)  DEFAULT '',
    vehicle_type  VARCHAR(150)  DEFAULT '',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS produce (
    image_urls         MEDIUMTEXT   DEFAULT NULL,
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id          INT          NOT NULL,
    farmer_name        VARCHAR(150) NOT NULL,
    name               VARCHAR(100) NOT NULL,
    category           ENUM('Fruit','Vegetable','Other') NOT NULL DEFAULT 'Other',
    emoji              VARCHAR(10)  DEFAULT '🌿',
    quantity           DECIMAL(10,2) NOT NULL,
    unit               ENUM('kg','ton','pieces','crate') NOT NULL DEFAULT 'kg',
    harvest_date       DATE         NOT NULL,
    location           VARCHAR(150) NOT NULL,
    storage_temp       VARCHAR(30)  DEFAULT '',
    storage_humidity   VARCHAR(30)  DEFAULT '',
    fresh_days         INT          DEFAULT 7,
    storage_tips       TEXT,
    expected_price_per_kg DECIMAL(10,2) DEFAULT NULL,
    status             ENUM('Available','Reserved','Sold','Expired') NOT NULL DEFAULT 'Available',
    listed_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer   (farmer_id),
    INDEX idx_status   (status),
    INDEX idx_category (category)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS transport_requests (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id        INT          NOT NULL,
    farmer_name      VARCHAR(150) NOT NULL,
    product_id       INT          DEFAULT NULL,
    produce_name     VARCHAR(100) NOT NULL,
    contact_phone    VARCHAR(20)  DEFAULT '',
    dealer_id        INT          DEFAULT NULL,
    dealer_name      VARCHAR(150) DEFAULT '',
    dealer_phone     VARCHAR(20)  DEFAULT '',
    dealer_location  VARCHAR(150) DEFAULT '',
    pickup_location  VARCHAR(200) NOT NULL,
    destination      VARCHAR(200) NOT NULL,
    pickup_date      DATE,
    quantity         VARCHAR(100) DEFAULT '',
    notes            TEXT,
    status           ENUM('Open','Accepted','Completed','Cancelled','Failed') NOT NULL DEFAULT 'Open',
    assigned_to      INT          DEFAULT NULL,
    transporter_name VARCHAR(150) DEFAULT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (dealer_id)   REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id)  REFERENCES produce(id) ON DELETE SET NULL,
    INDEX idx_farmer   (farmer_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_status   (status)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS transport_proposals (
    id                         INT AUTO_INCREMENT PRIMARY KEY,
    transport_provider_id      INT          NOT NULL,
    transport_provider_name    VARCHAR(150) NOT NULL,
    current_location           VARCHAR(200) NOT NULL,
    fruit_type                 VARCHAR(100) NOT NULL,
    harvest_date               DATE         NOT NULL,
    preferred_dealer_location  VARCHAR(200) NOT NULL,
    notes                      TEXT,
    farmer_id                  INT          DEFAULT NULL,
    farmer_name                VARCHAR(150) DEFAULT NULL,
    farmer_price               DECIMAL(10,2) DEFAULT NULL,
    admin_notes                TEXT,
    route_from                 VARCHAR(200) DEFAULT NULL,
    route_to                   VARCHAR(200) DEFAULT NULL,
    status                     ENUM('PendingReview','AwaitingFarmerPrice','AwaitingAdminApproval','Published','Expired','Converted','Completed','Rejected','Cancelled') NOT NULL DEFAULT 'PendingReview',
    published_at               DATETIME     DEFAULT NULL,
    expires_at                 DATETIME     DEFAULT NULL,
    converted_at               DATETIME     DEFAULT NULL,
    converted_dealer_id        INT          DEFAULT NULL,
    converted_dealer_name      VARCHAR(150) DEFAULT NULL,
    created_at                 DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transport_provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id)             REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (converted_dealer_id)    REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_provider (transport_provider_id),
    INDEX idx_farmer    (farmer_id),
    INDEX idx_status    (status),
    INDEX idx_expires   (expires_at)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS deals (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    dealer_id             INT          NOT NULL,
    dealer_name           VARCHAR(150) NOT NULL,
    farmer_id             INT          NOT NULL,
    farmer_name           VARCHAR(150) NOT NULL,
    product_id            INT          DEFAULT NULL,
    produce_name          VARCHAR(100) NOT NULL,
    quantity_requested    VARCHAR(100) DEFAULT '',
    offered_price_per_kg  DECIMAL(10,2) NOT NULL,
    message               TEXT,
    status                ENUM('Pending','Accepted','Declined','Cancelled','Completed') NOT NULL DEFAULT 'Pending',
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at          DATETIME     DEFAULT NULL,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES produce(id) ON DELETE SET NULL,
    INDEX idx_dealer (dealer_id),
    INDEX idx_farmer (farmer_id),
    INDEX idx_status (status)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS delivery_failures (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    transporter_id        INT          NOT NULL,
    transporter_name      VARCHAR(150) NOT NULL,
    transport_request_id  INT          NOT NULL,
    produce_name          VARCHAR(100) DEFAULT '',
    route                 VARCHAR(300) DEFAULT '',
    reason                VARCHAR(200) NOT NULL,
    notes                 TEXT,
    alternatives          JSON,
    reported_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transporter_id)       REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transport_request_id) REFERENCES transport_requests(id) ON DELETE CASCADE,
    INDEX idx_transporter (transporter_id)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS failure_alternative_requests (
    id                         INT AUTO_INCREMENT PRIMARY KEY,
    failure_id                 INT NOT NULL,
    source_transport_request_id INT NOT NULL,
    product_id                 INT DEFAULT NULL,
    produce_name               VARCHAR(100) DEFAULT '',
    quantity                   DECIMAL(10,2) NOT NULL DEFAULT 0,
    farmer_id                  INT NOT NULL,
    farmer_name                VARCHAR(150) NOT NULL,
    dealer_id                  INT DEFAULT NULL,
    dealer_name                VARCHAR(150) DEFAULT '',
    dealer_phone               VARCHAR(20) DEFAULT '',
    dealer_location            VARCHAR(150) DEFAULT '',
    transporter_id             INT NOT NULL,
    transporter_name           VARCHAR(150) NOT NULL,
    current_location           VARCHAR(200) NOT NULL,
    fruit_type                 VARCHAR(100) NOT NULL,
    pickup_date                DATE NOT NULL,
    preferred_dealer_location  VARCHAR(200) NOT NULL,
    requested_price_per_kg     DECIMAL(10,2) DEFAULT NULL,
    proposed_price_per_kg      DECIMAL(10,2) DEFAULT NULL,
    final_price_per_kg         DECIMAL(10,2) DEFAULT NULL,
    generated_transport_request_id INT DEFAULT NULL,
    decision_notes             TEXT,
    status                     ENUM('PendingFarmerDecision','AcceptedOldPrice','AcceptedNewPrice','Returned') NOT NULL DEFAULT 'PendingFarmerDecision',
    created_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (failure_id) REFERENCES delivery_failures(id) ON DELETE CASCADE,
    FOREIGN KEY (source_transport_request_id) REFERENCES transport_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES produce(id) ON DELETE SET NULL,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_transport_request_id) REFERENCES transport_requests(id) ON DELETE SET NULL,
    UNIQUE KEY uq_failure_id (failure_id),
    INDEX idx_failure (failure_id),
    INDEX idx_farmer_status (farmer_id, status),
    INDEX idx_dealer_status (dealer_id, status),
    INDEX idx_transporter_status (transporter_id, status)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          DEFAULT NULL,
    action      VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100) DEFAULT NULL,
    entity_id   INT          DEFAULT NULL,
    meta        JSON,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS price_history (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    product_id           INT          NOT NULL,
    dealer_id            INT          NOT NULL,
    offered_price_per_kg DECIMAL(10,2) NOT NULL,
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES produce(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_dealer (dealer_id)
  ) ENGINE=InnoDB`
];

const SEED_DATA = [
  `INSERT IGNORE INTO users (name, email, phone, password_hash, role, location, vehicle_type) VALUES
  ('Admin User',      'admin@harvest.bd',  '+8801700000001', '$2a$12$cN1Y6KhF8dv.asRSGgKZYO8mdZ0ak1YEP3s6sbvq542uqShny3Yfe', 'admin',     '',          ''),
  ('Rahim Uddin',     'rahim@farm.bd',     '+8801700000002', '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW', 'farmer',    'Rajshahi',  ''),
  ('Sufia Begum',     'sufia@farm.bd',     '+8801700000003', '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW', 'farmer',    'Mymensingh',''),
  ('Karim Transport', 'karim@trans.bd',    '+8801700000004', '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW', 'transport', '',          'Refrigerated Truck'),
  ('Dhaka Fresh Ltd', 'dhaka@fresh.bd',    '+8801700000005', '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW', 'dealer',    'Dhaka',     ''),
  ('Chittagong Grocers', 'chittagong@fresh.bd', '+8801700000006', '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW', 'dealer', 'Chittagong', '')`,

  `INSERT IGNORE INTO produce (farmer_id, farmer_name, name, category, emoji, quantity, unit, harvest_date, location, storage_temp, storage_humidity, fresh_days, storage_tips, status) VALUES
  (2, 'Rahim Uddin', 'Mango',   'Fruit',     '🥭', 500,  'kg',    '2026-01-20', 'Rajshahi',   '13-15°C',  '85-90%',  14, 'Store away from ethylene-sensitive produce. Ripen at room temperature.', 'Available'),
  (3, 'Sufia Begum', 'Tomato',  'Vegetable', '🍅', 300,  'kg',    '2026-01-22', 'Mymensingh', '10-13°C',  '85-90%',  10, 'Store stem-up. Never refrigerate fully ripe tomatoes.',                'Available'),
  (2, 'Rahim Uddin', 'Potato',  'Vegetable', '🥔', 1000, 'kg',    '2026-01-15', 'Rajshahi',   '4-7°C',    '85-90%',  60, 'Store in dark, dry, cool place. Avoid light to prevent greening.',     'Available'),
  (3, 'Sufia Begum', 'Cauliflower','Vegetable','🥦',150, 'kg',    '2026-01-25', 'Mymensingh', '0-1°C',    '90-95%',  14, 'Store wrapped to prevent discoloration. Keep very cold.',               'Available')`,

  `INSERT IGNORE INTO transport_requests (farmer_id, farmer_name, product_id, produce_name, pickup_location, destination, pickup_date, quantity, notes, status) VALUES
  (2, 'Rahim Uddin', 1, 'Mango', 'Rajshahi', 'Dhaka Kawran Bazar', '2026-02-01', '500 kg', 'Refrigerated vehicle required. Handle with care.', 'Open')`,

  `INSERT IGNORE INTO transport_proposals (transport_provider_id, transport_provider_name, current_location, fruit_type, harvest_date, preferred_dealer_location, notes, farmer_id, farmer_name, farmer_price, admin_notes, route_from, route_to, status, published_at, expires_at) VALUES
  (4, 'Karim Transport', 'Rajshahi', 'Mango', '2026-02-01', 'Dhaka', 'Cold chain available. Ready for same-day dispatch.', 2, 'Rahim Uddin', 82.50, 'Demo proposal for workflow testing.', 'Rajshahi', 'Dhaka', 'Published', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_ADD(NOW(), INTERVAL 50 MINUTE))`,

  `INSERT IGNORE INTO deals (dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name, quantity_requested, offered_price_per_kg, message, status) VALUES
  (5, 'Dhaka Fresh Ltd', 2, 'Rahim Uddin', 1, 'Mango', '200 kg', 80.00, 'We are interested in a weekly supply arrangement for the season.', 'Pending')`
];

async function init() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'freshnest_db',
    waitForConnections: true,
    connectionLimit: 5,
  });

  async function ensureColumn(table, column, definition) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME || 'freshnest_db', table, column]
    );
    if (rows[0].cnt === 0) {
      await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
    }
  }

  async function ensureProposalCompletedStatus() {
    const [rows] = await pool.execute(
      `SELECT COLUMN_TYPE AS column_type
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transport_proposals' AND COLUMN_NAME = 'status'`,
      [process.env.DB_NAME || 'freshnest_db']
    );

    if (!rows.length) return;

    const columnType = String(rows[0].column_type || '');
    if (columnType.includes("'Completed'")) return;

    await pool.execute(
      `ALTER TABLE transport_proposals
       MODIFY COLUMN status ENUM('PendingReview','AwaitingFarmerPrice','AwaitingAdminApproval','Published','Expired','Converted','Completed','Rejected','Cancelled') NOT NULL DEFAULT 'PendingReview'`
    );
  }

  async function ensureUniqueIndex(table, indexName, ddl) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [process.env.DB_NAME || 'freshnest_db', table, indexName]
    );

    if (rows[0].cnt === 0) {
      await pool.execute(`ALTER TABLE \`${table}\` ADD ${ddl}`);
    }
  }

  async function ensureDealCompletedStatus() {
    const [rows] = await pool.execute(
      `SELECT COLUMN_TYPE AS column_type
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deals' AND COLUMN_NAME = 'status'`,
      [process.env.DB_NAME || 'freshnest_db']
    );

    if (!rows.length) return;

    const columnType = String(rows[0].column_type || '');
    if (columnType.includes("'Completed'")) return;

    await pool.execute(
      `ALTER TABLE deals
       MODIFY COLUMN status ENUM('Pending','Accepted','Declined','Cancelled','Completed') NOT NULL DEFAULT 'Pending'`
    );
  }

  try {
    console.log('Creating tables...');
    for (const sql of CREATE_TABLES) {
      await pool.execute(sql);
    }

    console.log('Applying safe migrations...');
    await ensureColumn('users', 'phone', "phone VARCHAR(20) DEFAULT ''");
    await ensureColumn('produce', 'sold_quantity', 'sold_quantity DECIMAL(10,2) NOT NULL DEFAULT 0');
    await ensureColumn('produce', 'short_description', 'short_description TEXT');
    await ensureColumn('produce', 'expected_price_per_kg', 'expected_price_per_kg DECIMAL(10,2) DEFAULT NULL');
    await ensureColumn('produce', 'image_url', 'image_url MEDIUMTEXT DEFAULT NULL');
    await ensureColumn('produce', 'image_urls', 'image_urls MEDIUMTEXT DEFAULT NULL');
    await ensureColumn('transport_requests', 'contact_phone', "contact_phone VARCHAR(20) DEFAULT ''");
    await ensureColumn('transport_requests', 'dealer_id', 'dealer_id INT DEFAULT NULL');
    await ensureColumn('transport_requests', 'dealer_name', "dealer_name VARCHAR(150) DEFAULT ''");
    await ensureColumn('transport_requests', 'dealer_phone', "dealer_phone VARCHAR(20) DEFAULT ''");
    await ensureColumn('transport_requests', 'dealer_location', "dealer_location VARCHAR(150) DEFAULT ''");
    await ensureUniqueIndex('failure_alternative_requests', 'uq_failure_id', 'UNIQUE KEY uq_failure_id (failure_id)');
    await ensureColumn('failure_alternative_requests', 'current_location', "current_location VARCHAR(200) NOT NULL DEFAULT ''");
    await ensureColumn('failure_alternative_requests', 'fruit_type', "fruit_type VARCHAR(100) NOT NULL DEFAULT ''");
    await ensureColumn('failure_alternative_requests', 'pickup_date', 'pickup_date DATE NULL');
    await ensureColumn('failure_alternative_requests', 'preferred_dealer_location', "preferred_dealer_location VARCHAR(200) NOT NULL DEFAULT ''");
    await pool.execute(
      `UPDATE failure_alternative_requests
       SET pickup_date = COALESCE(pickup_date, DATE(created_at), CURRENT_DATE)
       WHERE pickup_date IS NULL`
    );
    await pool.execute(
      `ALTER TABLE failure_alternative_requests
       MODIFY COLUMN pickup_date DATE NOT NULL`
    );
    await ensureColumn('deals', 'updated_at', 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await ensureColumn('delivery_failures', 'created_at', 'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('delivery_failures', 'updated_at', 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await ensureProposalCompletedStatus();
    await ensureDealCompletedStatus();
    const oldSeedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i';
    const adminHash = '$2a$12$cN1Y6KhF8dv.asRSGgKZYO8mdZ0ak1YEP3s6sbvq542uqShny3Yfe';
    const userHash = '$2a$12$8HyQhraBlMaxyuj1V/NODOgL99TIjAyShGLF65vqVXzcrZhplNgPW';
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ? AND password_hash = ?',
      [adminHash, 'admin@harvest.bd', oldSeedHash]
    );
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email IN (?,?,?,?,?) AND password_hash = ?',
      [userHash, 'rahim@farm.bd', 'sufia@farm.bd', 'karim@trans.bd', 'dhaka@fresh.bd', 'chittagong@fresh.bd', oldSeedHash]
    );

    console.log('Seeding data...');
    for (const sql of SEED_DATA) {
      await pool.execute(sql);
    }

    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Database init error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

module.exports = { init };
