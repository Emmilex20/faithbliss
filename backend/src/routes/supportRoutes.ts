// src/routes/supportRoutes.ts

import express from 'express';
import { getMySupportTickets, getSupportTickets, replyToSupportTicket, submitSupportTicket } from '../controllers/supportController';

const router = express.Router();

router.get('/my-tickets', getMySupportTickets);
router.get('/tickets', getSupportTickets);
router.post('/tickets/:id/reply', replyToSupportTicket);
router.post('/', submitSupportTicket);

export default router;
