import express from 'express';
import * as chatSessionController from '../controllers/chatSessionController.js';
import * as chatStreamController from '../controllers/chatStreamController.js';
import * as chatMessageController from '../controllers/chatMessageController.js';
import isUserAuth from '../../../middlewares/isUserAuth.js';
import { strictChatLimiter } from '../../../middlewares/rateLimiter.js';
import { sanitizeInput, verifySessionOwnership } from '../../../middlewares/chatSecurity.js';
import { aiQuotaLimiter } from '../../../middlewares/aiQuotaLimiter.js';
import { aiIPRateLimiter } from '../../../middlewares/aiIPRateLimiter.js';
import { aiGlobalLimiter } from '../../../middlewares/aiGlobalLimiter.js';
import { anonIdentity } from '../../../middlewares/anonIdentity.js';

const router = express.Router();

// Guest / Unauthenticated Routes
router.post('/guest/chat', anonIdentity, aiIPRateLimiter(), strictChatLimiter, aiGlobalLimiter, aiQuotaLimiter('assistant'), sanitizeInput, chatStreamController.streamGuestChatGeneration);

// Global Authentication Middleware
router.use(isUserAuth);

// Session Management (Root Level)
router.post('/', sanitizeInput, chatSessionController.createSession);
router.get('/', chatSessionController.getRecentSessions);
router.get('/search', chatSessionController.searchSessions);
router.post('/guest/sync', sanitizeInput, chatSessionController.syncGuestSession);

// Individual Session Management
router.put('/:sessionId/rename', verifySessionOwnership, sanitizeInput, chatSessionController.renameSession);
router.put('/:sessionId/pin', verifySessionOwnership, chatSessionController.togglePinSession);
router.delete('/:sessionId', verifySessionOwnership, chatSessionController.softDeleteSession);
router.put('/:sessionId/restore', verifySessionOwnership, chatSessionController.restoreSession);

// Chat Streams & AI Generation
router.post('/:sessionId/chat', verifySessionOwnership, strictChatLimiter, aiGlobalLimiter, aiQuotaLimiter('assistant'), sanitizeInput, chatStreamController.streamChatGeneration);
router.post('/:sessionId/messages/:messageId/regenerate', verifySessionOwnership, strictChatLimiter, aiGlobalLimiter, aiQuotaLimiter('assistant'), chatStreamController.regenerateChat);
router.post('/:sessionId/stop', verifySessionOwnership, chatStreamController.abortChatStream);

// Message CRUD & Feedback
router.get('/:sessionId/messages', verifySessionOwnership, chatMessageController.getSessionMessages);
router.post('/:sessionId/messages/user', verifySessionOwnership, sanitizeInput, chatMessageController.saveUserMessage);
router.post('/:sessionId/messages/assistant', verifySessionOwnership, chatMessageController.saveAssistantMessage);
router.delete('/:sessionId/messages/:messageId', verifySessionOwnership, chatMessageController.deleteMessage);
router.post('/:sessionId/messages/:messageId/feedback', verifySessionOwnership, chatMessageController.submitFeedback);

export default router;
