// src/routes/paymentRoutes.ts

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  handlePaystackWebhook,
  initializeSubscription,
  verifySubscription,
} from '../controllers/paymentController';

const router = express.Router();

// Webhook (no auth)
router.post('/webhook', handlePaystackWebhook);

// Authenticated endpoints
router.post('/initialize', protect, initializeSubscription);
router.post('/verify', protect, verifySubscription);

export default router;
