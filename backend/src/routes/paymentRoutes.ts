// src/routes/paymentRoutes.ts

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  handlePaystackWebhook,
  getLocalizedPricingQuote,
  initializeLocalizedSubscription,
  initializeSubscription,
  listSubscriptionPlans,
  verifySubscription,
} from '../controllers/paymentController';

const router = express.Router();

// Webhook (no auth)
router.post('/webhook', handlePaystackWebhook);

// Authenticated endpoints
router.get('/quote', protect, getLocalizedPricingQuote);
router.get('/plans', protect, listSubscriptionPlans);
router.post('/pay', protect, initializeLocalizedSubscription);
router.post('/initialize', protect, initializeSubscription);
router.post('/verify', protect, verifySubscription);

export default router;
