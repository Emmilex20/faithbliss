// src/routes/messageRoutes.ts (FIXED & CONSOLIDATED)
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware'; 
import { 
    // Importing the real Mongoose implementations from matchController
    getMatchConversations,
    getUnreadCount,
    getMatchMessages as getConversationMessages // Renaming on import for clarity
} from '../controllers/matchController'; // <-- Pulling real logic from matchController

const router = Router();

// Apply protection to all message routes
router.use(protect);

// ----------------------------------------
// ✅ Messaging Routes (Protected)
// ----------------------------------------

// Route to get the list of all match conversations
// GET /api/messages/conversations
router.route('/conversations').get(getMatchConversations);

// Route to get the unread count
// GET /api/messages/unread-count
router.route('/unread-count').get(getUnreadCount);

// Route to get the messages for a specific match
// GET /api/messages/:matchId 
// We use the root path here, as /messages is the base in server.ts
router.route('/match/:matchId').get(getConversationMessages);

export default router;