require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDatabase();
  } catch (e) {
    console.log('Continuing without DB init...');
  }

  app.listen(PORT, () => {
    console.log(`✅ FreshNest API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();