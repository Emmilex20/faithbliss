// src/routes/messageRoutes.ts (FIXED & CONSOLIDATED)
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware'; 
import { 
    uploadMessageAttachment,
    uploadMessageAttachmentMiddleware,
    getMatchConversations,
    getMediaLibrary,
    getUnreadCount,
    markMessageAsRead,
    getMatchMessages as getConversationMessages
} from '../controllers/matchController';

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

// Proxy media library requests (Giphy/Tenor) to avoid browser CORS issues.
// GET /api/messages/media/library
router.route('/media/library').get(getMediaLibrary);

// Upload a message attachment to Cloudinary
// POST /api/messages/attachments
router.route('/attachments').post(uploadMessageAttachmentMiddleware, uploadMessageAttachment);

// Mark a message as read
// PATCH /api/messages/:messageId/read
router.route('/:messageId/read').patch(markMessageAsRead);

export default router;
