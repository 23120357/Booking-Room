const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth/authRoutes');
const reviewRoutes = require('./routes/guest/reviewRoutes');
const favoriteRoutes = require('./routes/guest/favoriteRoutes');
const conversationRoutes = require('./routes/guest/conversationRoutes');
const notificationRoutes = require('./routes/guest/notificationRoutes');
const supportTicketRoutes = require('./routes/guest/supportTicketRoutes');
const violationReportRoutes = require('./routes/guest/violationReportRoutes');
const aiRoutes = require('./routes/guest/aiRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Trust the first proxy so req.ip / X-Forwarded-For resolve correctly in prod.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// Liveness probe.
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

// Feature routes.
app.use('/api/auth', authRoutes);
app.use('/api/rooms/:roomId/reviews', reviewRoutes); // GET reviews for a room (public)
app.use('/api/reviews', reviewRoutes);               // POST create
app.use('/api/favorites', favoriteRoutes);           // GET list, POST toggle
app.use('/api/conversations', conversationRoutes);   // Chat Module
app.use('/api/notifications', notificationRoutes);   // Notifications Module
app.use('/api/support-tickets', supportTicketRoutes); // Support Tickets Module
app.use('/api/violation-reports', violationReportRoutes); // Violation Reports Module
app.use('/api/ai', aiRoutes);                        // AI Recommendations Module

// 404 + centralised error handling (must be last).
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
