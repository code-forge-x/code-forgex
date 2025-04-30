const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserActivities,
  createActivity
} = require('../controllers/activityController');
const {
  getMessages,
  createMessage,
  markAsRead
} = require('../controllers/messageController');
const {
  getClientInvoices,
  createInvoice,
  updateInvoiceStatus
} = require('../controllers/invoiceController');

// Apply authentication middleware to all routes
router.use(auth);

// Activity routes
router.get('/activity', getUserActivities);
router.post('/activity', createActivity);

// Message routes
router.get('/messages', getMessages);
router.post('/messages', createMessage);
router.put('/messages/:id/read', markAsRead);

// Invoice routes
router.get('/invoices', getClientInvoices);
router.post('/invoices', createInvoice);
router.put('/invoices/:id/status', updateInvoiceStatus);

module.exports = router; 