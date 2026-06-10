const express = require('express');
const db = require('./config/db');
const authRoutes = require('./routes/auth/authRoutes');
const { success } = require('./utils/responseHelper');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
