// src/routes/supportRoutes.ts

import express from 'express';
import { submitSupportTicket } from '../controllers/supportController';

const router = express.Router();

router.post('/', submitSupportTicket);

export default router;
