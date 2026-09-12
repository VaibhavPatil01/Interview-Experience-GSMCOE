import geminiClient from '../../../configs/gemini.js';
import ChatSessionRepository from '../repositories/ChatSessionRepository.js';
import ChatMessageRepository from '../repositories/ChatMessageRepository.js';
import logger from '../../../utils/logger.js';

export default class ChatSessionService {
  constructor(repo = new ChatSessionRepository(), messageRepo = new ChatMessageRepository()) {
    this.repo = repo;
    this.messageRepo = messageRepo;
  }

  /**
   * Generates a short title based on the first prompt
   */
  async generateTitle(prompt) {
    const promptText = `Generate a very short, concise title (max 5 words) summarizing this chat prompt. Do not use quotes or prefixes. Prompt: "${prompt}"`;
    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText
        });
        let title = (response.text || '').trim();
        title = title.replace(/^["'](.*)["']$/, '$1');
        return title || 'New Conversation';
      } catch (error) {
        if (attempt === maxRetries) {
          logger.error('Failed to generate session title via Gemini after max retries', { error: error.message, prompt });
          return 'New Conversation'; // Fallback
        }
        logger.warn(`Rate limit hit during title generation. Retrying in ${delay}ms...`, { attempt });
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    return 'New Conversation';
  }

  async createSession(userId, initialPrompt) {
    logger.info('Creating new chat session', { category: 'db', userId });
    
    let title = 'New Conversation';
    if (initialPrompt) {
      title = await this.generateTitle(initialPrompt);
    }

    const session = await this.repo.createSession(userId, title);
    logger.info('Chat session created successfully', { category: 'db', sessionId: session._id });
    
    return session;
  }

  async syncGuestSession(userId, messages) {
    logger.info('Syncing guest chat session to DB', { userId, messageCount: messages.length });
    
    let title = 'New Conversation';
    if (messages.length > 0 && messages[0].content) {
      title = await this.generateTitle(messages[0].content);
    }

    const session = await this.repo.createSession(userId, title);
    
    const now = Date.now();
    const messagesToInsert = messages.map((msg, idx) => ({
      sessionId: session._id,
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
      createdAt: new Date(now + idx) // stagger by 1ms to preserve chronological order in sorting
    }));

    await this.messageRepo.model.insertMany(messagesToInsert);
    logger.info('Guest session synced successfully', { sessionId: session._id });
    
    return session;
  }

  async getRecentSessions(userId, skip = 0, limit = 20) {
    logger.debug('Fetching recent sessions', { userId, skip, limit });
    return await this.repo.findSessionsByUserId(userId, '', skip, limit);
  }

  async searchSessions(userId, query, skip = 0, limit = 20) {
    logger.debug('Searching sessions', { userId, query });
    return await this.repo.findSessionsByUserId(userId, query, skip, limit);
  }

  async renameSession(sessionId, userId, newTitle) {
    logger.info('Renaming session', { category: 'db', sessionId, newTitle });
    
    return await this.repo.updateSessionTitle(sessionId, newTitle);
  }

  async togglePinSession(sessionId, userId, isPinned) {
    logger.info('Toggling session pin status', { category: 'db', sessionId, isPinned });
    
    return await this.repo.togglePin(sessionId, isPinned);
  }

  async softDeleteSession(sessionId, userId) {
    logger.info('Soft deleting session', { category: 'db', sessionId });
    
    return await this.repo.softDeleteSession(sessionId);
  }

  async restoreSession(sessionId, userId) {
    logger.info('Restoring session', { category: 'db', sessionId });
    
    return await this.repo.restoreSession(sessionId);
  }
}
