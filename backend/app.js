const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { notFound, globalError } = require('./middleware/errorHandler');

const authRoutes      = require('./routes/auth.routes');
const produceRoutes   = require('./routes/produce.routes');
const transportRoutes = require('./routes/transport.routes');
const proposalRoutes  = require('./routes/proposals.routes');
const dealRoutes      = require('./routes/deals.routes');
const failureRoutes   = require('./routes/failures.routes');
const userRoutes      = require('./routes/users.routes');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin === 'null') {
      callback(null, true);
    } else {
      callback(null, process.env.CLIENT_ORIGIN === origin ? true : false);
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'OK', timestamp: new Date().toISOString(), service: 'FreshNest API' },
  });
});

app.use('/api/auth',      authRoutes);
app.use('/api/produce',   produceRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/deals',     dealRoutes);
app.use('/api/failures',  failureRoutes);
app.use('/api/users',     userRoutes);

app.use(notFound);
app.use(globalError);

module.exports = app;