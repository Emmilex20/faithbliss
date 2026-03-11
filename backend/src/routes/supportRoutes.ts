// src/routes/supportRoutes.ts

import express from 'express';
import { getSupportTickets, submitSupportTicket } from '../controllers/supportController';

const router = express.Router();

router.get('/tickets', getSupportTickets);
router.post('/', submitSupportTicket);

export default router;
