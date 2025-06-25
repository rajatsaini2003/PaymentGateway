// Update your payment routes file (e.g., routes/payment.js)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// Existing routes
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.get('/transactions', authMiddleware, paymentController.getTransactions);

// Subscription routes
router.post('/subscribe', authMiddleware, paymentController.createSubscription);
router.post('/verify-subscription', authMiddleware, paymentController.verifySubscription);
router.get('/subscriptions', authMiddleware, paymentController.getSubscriptions);
router.post('/subscription/cancel', authMiddleware, paymentController.cancelSubscription);

// NEW: Enhanced subscription management routes
router.get('/subscriptions/notifications', authMiddleware, paymentController.getSubscriptionNotifications);
router.post('/subscriptions/sync/:subscriptionId', authMiddleware, paymentController.syncSubscriptionStatus);
router.get('/subscriptions/:subscriptionId', authMiddleware, paymentController.getSubscriptionDetails);
router.post('/subscriptions/:subscriptionId/update', authMiddleware, paymentController.updateSubscription);
router.get('/subscriptions/:subscriptionId/payments', authMiddleware, paymentController.getSubscriptionPayments);

// Webhook route (no auth required)
router.post('/webhook/subscription', paymentController.handleSubscriptionWebhook);

module.exports = router;