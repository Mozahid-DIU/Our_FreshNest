-- ============================================================
--  FreshNest — MySQL Database Schema
--  Post-Harvest Storage & Logistics Management System
--  Run: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS freshnest_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE freshnest_db;

-- TABLE 1: USERS
CREATE TABLE IF NOT EXISTS users (
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
) ENGINE=InnoDB;

-- TABLE 2: PRODUCE
CREATE TABLE IF NOT EXISTS produce (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id          INT          NOT NULL,
  farmer_name        VARCHAR(150) NOT NULL,
  name               VARCHAR(100) NOT NULL,
  category           ENUM('Fruit','Vegetable','Other') NOT NULL DEFAULT 'Other',
  emoji              VARCHAR(10)  DEFAULT '🌿',
  quantity           DECIMAL(10,2) NOT NULL,
  sold_quantity      DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit               ENUM('kg','ton','pieces','crate') NOT NULL DEFAULT 'kg',
  harvest_date       DATE         NOT NULL,
  location           VARCHAR(150) NOT NULL,
  storage_temp       VARCHAR(30)  DEFAULT '',
  storage_humidity   VARCHAR(30)  DEFAULT '',
  fresh_days         INT          DEFAULT 7,
  short_description  TEXT,
  image_url          MEDIUMTEXT   DEFAULT NULL,
  image_urls         MEDIUMTEXT   DEFAULT NULL,
  expected_price_per_kg DECIMAL(10,2) DEFAULT NULL,
  storage_tips       TEXT,
  status             ENUM('Available','Reserved','Sold','Expired') NOT NULL DEFAULT 'Available',
  listed_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_farmer   (farmer_id),
  INDEX idx_status   (status),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- TABLE 3: TRANSPORT REQUESTS
CREATE TABLE IF NOT EXISTS transport_requests (
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
) ENGINE=InnoDB;

-- TABLE 4: TRANSPORT PROPOSALS
CREATE TABLE IF NOT EXISTS transport_proposals (
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
) ENGINE=InnoDB;

-- TABLE 4: PRODUCE CONDITIONS (Reference Table)
CREATE TABLE IF NOT EXISTS produce_conditions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  produce_name      VARCHAR(100) NOT NULL UNIQUE,
  category          ENUM('Fruit','Vegetable') NOT NULL,
  emoji             VARCHAR(10) DEFAULT '🌿',
  storage_temp      VARCHAR(30) DEFAULT '',
  storage_humidity  VARCHAR(30) DEFAULT '',
  fresh_days        INT DEFAULT 7,
  harvest_months   VARCHAR(50) DEFAULT '',
  storage_tips      TEXT,
  INDEX idx_name    (produce_name),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
--  DEALS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  dealer_id             INT          NOT NULL,
  dealer_name           VARCHAR(150) NOT NULL,
  farmer_id             INT          NOT NULL,
  farmer_name           VARCHAR(150) NOT NULL,
  product_id            INT          DEFAULT NULL,
  produce_name          VARCHAR(100) NOT NULL,
  quantity_requested    VARCHAR(100) DEFAULT '',
  expected_price_per_kg  DECIMAL(10,2) DEFAULT NULL,
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
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
--  DELIVERY FAILURES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_failures (
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
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS failure_alternative_requests (
  id                         INT AUTO_INCREMENT PRIMARY KEY,
  failure_id                 INT NOT NULL,
  source_transport_request_id INT NOT NULL,
  source_deal_id             INT DEFAULT NULL,
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
  published_at               DATETIME DEFAULT NULL,
  expires_at                 DATETIME DEFAULT NULL,
  claimed_dealer_id          INT DEFAULT NULL,
  claimed_dealer_name        VARCHAR(150) DEFAULT NULL,
  claimed_at                 DATETIME DEFAULT NULL,
  generated_transport_request_id INT DEFAULT NULL,
  decision_notes             TEXT,
  status                     ENUM('PendingFarmerDecision','PublishedToDealers','ClaimedByDealer','Returned','ExpiredAutoReturn') NOT NULL DEFAULT 'PendingFarmerDecision',
  created_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (failure_id) REFERENCES delivery_failures(id) ON DELETE CASCADE,
  FOREIGN KEY (source_transport_request_id) REFERENCES transport_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (source_deal_id) REFERENCES deals(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES produce(id) ON DELETE SET NULL,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dealer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (claimed_dealer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_transport_request_id) REFERENCES transport_requests(id) ON DELETE SET NULL,
  UNIQUE KEY uq_failure_id (failure_id),
  INDEX idx_failure (failure_id),
  INDEX idx_farmer_status (farmer_id, status),
  INDEX idx_dealer_status (dealer_id, status),
  INDEX idx_transporter_status (transporter_id, status)
) ENGINE=InnoDB;

-- ============================================================
--  SEED DATA
-- ============================================================

-- ── Produce Conditions Reference ──────────────────────────
INSERT INTO produce_conditions (produce_name, category, emoji, storage_temp, storage_humidity, fresh_days, harvest_months, storage_tips) VALUES
-- Fruits
('Mango',        'Fruit', '🥭', '13–15°C', '85–90%', 14, 'May–July',       'Store away from ethylene-sensitive produce. Ripen at room temperature.'),
('Banana',       'Fruit', '🍌', '13–15°C', '85–95%', 7,  'Year-round',     'Never refrigerate unripe bananas. Keep dry and ventilated.'),
('Litchi',       'Fruit', '🍒', '2–5°C',   '90–95%', 5,  'May–June',       'Refrigerate immediately after harvest to retain red color.'),
('Pineapple',    'Fruit', '🍍', '7–10°C',  '85–90%', 10, 'Apr–Aug',        'Store upright. Do not stack. Avoid ethylene exposure.'),
('Guava',        'Fruit', '🍈', '8–10°C',  '85–90%', 7,  'Year-round',     'Wrap individually in tissue paper for longer shelf life.'),
('Papaya',       'Fruit', '🍈', '10–13°C', '85–90%', 7,  'Year-round',     'Harvest at 25% yellow for long-distance transport.'),
('Jackfruit',    'Fruit', '🟡', '11–14°C', '85–90%', 5,  'Jun–Aug',        'Cut jackfruit must be refrigerated and consumed within 3 days.'),
('Watermelon',   'Fruit', '🍉', '10–15°C', '85–90%', 14, 'Apr–Sep',        'Store away from other fruits. Do not refrigerate uncut.'),
('Coconut',      'Fruit', '🥥', '0–2°C',   '80–85%', 30, 'Year-round',     'Remove husks for longer cold storage. Avoid moisture.'),
('Orange',       'Fruit', '🍊', '3–9°C',   '85–90%', 21, 'Nov–Feb',        'Check regularly for mold. Do not wash before storage.'),
('Strawberry',   'Fruit', '🍓', '0–2°C',   '90–95%', 5,  'Dec–Feb',        'Handle with extreme care. Never wash before storage.'),
('Grape',        'Fruit', '🍇', '0–2°C',   '90–95%', 21, 'Dec–Mar',        'Store in original clusters. Avoid temperature fluctuation.'),

-- Vegetables
('Tomato',       'Vegetable', '🍅', '10–13°C', '85–90%', 10, 'Oct–Mar',    'Store stem-up. Never refrigerate fully ripe tomatoes.'),
('Potato',       'Vegetable', '🥔', '4–7°C',   '85–90%', 60, 'Jan–Mar',    'Store in dark, dry, cool place. Avoid light to prevent greening.'),
('Onion',        'Vegetable', '🧅', '0–4°C',   '65–70%', 90, 'Jan–Apr',    'Store dry with good airflow. Low humidity is critical.'),
('Eggplant',     'Vegetable', '🍆', '10–12°C', '90–95%', 7,  'Year-round', 'Very chilling-sensitive. Keep away from ethylene.'),
('Cucumber',     'Vegetable', '🥒', '10–13°C', '90–95%', 7,  'Year-round', 'Wrap individually. Ethylene sensitive; isolate from ripening fruits.'),
('Cauliflower',  'Vegetable', '🥦', '0–1°C',   '90–95%', 14, 'Nov–Feb',    'Store wrapped to prevent discoloration. Keep very cold.'),
('Cabbage',      'Vegetable', '🥬', '0–1°C',   '90–95%', 21, 'Nov–Feb',    'Remove outer damaged leaves before storage.'),
('Carrot',       'Vegetable', '🥕', '0–1°C',   '90–95%', 28, 'Nov–Feb',    'Remove tops before storage to retain moisture.'),
('Spinach',      'Vegetable', '🥗', '0–2°C',   '95–100%',5,  'Nov–Feb',    'Store in perforated plastic bags. Very perishable.'),
('Green Bean',   'Vegetable', '🫘', '4–8°C',   '90–95%', 7,  'Year-round', 'Blanch before freezing for longer storage.'),
('Bitter Gourd', 'Vegetable', '🫑', '10–12°C', '85–90%', 7,  'Year-round', 'Store in cool and shaded area. Avoid direct sunlight.'),
('Pumpkin',      'Vegetable', '🎃', '10–13°C', '60–70%', 60, 'Year-round', 'Keep stem intact. Store in dry area with good ventilation.');

-- ── Demo Users (bcrypt hash for "pass123") ────────────────
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i
INSERT IGNORE INTO users (name, email, phone, password_hash, role, location, vehicle_type) VALUES
('Admin User',      'admin@harvest.bd',  '+8801700000001', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'admin',     '',          ''),
('Rahim Uddin',     'rahim@farm.bd',     '+8801700000002', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'farmer',    'Rajshahi',  ''),
('Sufia Begum',     'sufia@farm.bd',     '+8801700000003', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'farmer',    'Mymensingh',''),
('Karim Transport', 'karim@trans.bd',    '+8801700000004', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'transport', '',          'Refrigerated Truck'),
('Dhaka Fresh Ltd', 'dhaka@fresh.bd',    '+8801700000005', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'dealer',    'Dhaka',     ''),
('Chittagong Grocers', 'chittagong@fresh.bd', '+8801700000006', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMRfDpv1rqmEu5C7.cVZ7i', 'dealer', 'Chittagong', '');

-- ── Sample Produce Listings ────────────────────────────────
INSERT INTO produce (farmer_id, farmer_name, name, category, emoji, quantity, sold_quantity, unit, harvest_date, location, storage_temp, storage_humidity, fresh_days, short_description, image_url, image_urls, storage_tips, status) VALUES
(2, 'Rahim Uddin', 'Mango',   'Fruit',     '🥭', 500, 0, 'kg',    '2026-01-20', 'Rajshahi',   '13–15°C',  '85–90%',  14, 'Fresh Rajshahi mangoes ready for market.', NULL, NULL, 'Store away from ethylene-sensitive produce. Ripen at room temperature.', 'Available'),
(3, 'Sufia Begum', 'Tomato',  'Vegetable', '🍅', 300, 0, 'kg',    '2026-01-22', 'Mymensingh', '10–13°C',  '85–90%',  10, 'Bright, firm tomatoes for wholesale buyers.', NULL, NULL, 'Store stem-up. Never refrigerate fully ripe tomatoes.',                'Available'),
(2, 'Rahim Uddin', 'Potato',  'Vegetable', '🥔', 1000, 0, 'kg',    '2026-01-15', 'Rajshahi',   '4–7°C',    '85–90%',  60, 'Bulk stock for long storage.', NULL, NULL, 'Store in dark, dry, cool place. Avoid light to prevent greening.',     'Available'),
(3, 'Sufia Begum', 'Cauliflower','Vegetable','🥦',150, 0, 'kg',    '2026-01-25', 'Mymensingh', '0–1°C',    '90–95%',  14, 'Fresh cauliflowers for quick sale.', NULL, NULL, 'Store wrapped to prevent discoloration. Keep very cold.',               'Available');

-- ── Sample Transport Request ──────────────────────────────
INSERT INTO transport_requests (farmer_id, farmer_name, product_id, produce_name, contact_phone, pickup_location, destination, pickup_date, quantity, notes, status) VALUES
(2, 'Rahim Uddin', 1, 'Mango', '+8801700000002', 'Rajshahi', 'Dhaka Kawran Bazar', '2026-02-01', '500 kg', 'Refrigerated vehicle required. Handle with care.', 'Open');

-- ── Sample Transport Proposal ─────────────────────────────
INSERT INTO transport_proposals (transport_provider_id, transport_provider_name, current_location, fruit_type, harvest_date, preferred_dealer_location, notes, farmer_id, farmer_name, farmer_price, admin_notes, route_from, route_to, status, published_at, expires_at) VALUES
(4, 'Karim Transport', 'Rajshahi', 'Mango', '2026-02-01', 'Dhaka', 'Cold chain available. Ready for same-day dispatch.', 2, 'Rahim Uddin', 82.50, 'Demo proposal for workflow testing.', 'Rajshahi', 'Dhaka', 'Published', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_ADD(NOW(), INTERVAL 50 MINUTE));

-- ── Sample Deal ───────────────────────────────────────────
INSERT INTO deals (dealer_id, dealer_name, farmer_id, farmer_name, product_id, produce_name, quantity_requested, offered_price_per_kg, message, status) VALUES
(5, 'Dhaka Fresh Ltd', 2, 'Rahim Uddin', 1, 'Mango', '200 kg', 80.00, 'We are interested in a weekly supply arrangement for the season.', 'Pending');
