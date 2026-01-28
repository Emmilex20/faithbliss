// src/controllers/supportController.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { db } from '../config/firebase-admin';

type TicketType = 'HELP' | 'REPORT';

export const submitSupportTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string | undefined;
    const { type, subject, message, metadata } = req.body as {
      type: TicketType;
      subject?: string;
      message: string;
      metadata?: Record<string, any>;
    };

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Firebase UID missing.' });
    }
    if (!type || !['HELP', 'REPORT'].includes(type)) {
      return res.status(400).json({ message: 'Invalid ticket type.' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const ticket = {
      userId,
      type,
      subject: subject || '',
      message,
      metadata: metadata || {},
      status: 'OPEN',
      createdAt: admin.firestore.Timestamp.now(),
    };

    await db.collection('supportTickets').add(ticket);

    return res.status(201).json({ message: 'Ticket submitted successfully.' });
  } catch (error: any) {
    console.error('Support ticket error:', error);
    return res.status(500).json({ message: error.message || 'Failed to submit ticket.' });
  }
};
