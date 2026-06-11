const express = require('express');
const db = require('./config/db');
const authRoutes = require('./routes/auth/authRoutes');
const guestRoomRoutes = require('./routes/guest/roomRoutes');
const hostRoomRoutes = require('./routes/host/roomRoutes');
const adminRoomRoutes = require('./routes/admin/roomRoutes');
const { success } = require('./utils/responseHelper');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  return success(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/db', async (req, res, next) => {
  try {
    const result = await db.raw('SELECT 1 AS ok');
    return success(res, {
      status: 'ok',
      database: 'reachable',
      result: result.rows?.[0]?.ok || 1,
    });
  } catch (err) {
    next(err);
  }
});

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/rooms', hostRoomRoutes);
app.use('/rooms', guestRoomRoutes);
app.use('/api/rooms', hostRoomRoutes);
app.use('/api/rooms', guestRoomRoutes);
app.use('/admin/rooms', adminRoomRoutes);
app.use('/api/admin/rooms', adminRoomRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
