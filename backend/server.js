const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const transactionRoutes = require('./routes/transactions');
const notificationRoutes = require('./routes/notifications');
const { startScheduler } = require('./cronJobs/scheduler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Start Scheduler
startScheduler();

// Mock WhatsApp Alert Endpoint
app.post('/api/alert', (req, res) => {
  const { to, message } = req.body;
  console.log(`[WhatsApp Mock] To: ${to}, Message: ${message}`);
  // In a real app, call Cloud API here
  res.json({ success: true, status: 'sent (mock)' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
