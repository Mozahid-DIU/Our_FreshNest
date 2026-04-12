const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'freshnest_db',
  waitForConnections: true,
  connectionLimit:    10,
  timezone:           '+06:00',
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function initDatabase() {
  const dbName = process.env.DB_NAME || 'freshnest_db';
  const tempPool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit:    2,
  });

  try {
    await tempPool.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await tempPool.end();
    process.env.DB_NAME = dbName;
    const db = require('../db_init');
    if (db && db.init) await db.init();
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

module.exports = { pool, query, initDatabase };