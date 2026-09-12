import User from '../../users/models/User.js';
import { Post } from '../../posts/models/Post.js';
import ChatMessageRepository from '../repositories/ChatMessageRepository.js';
import { QdrantRepository } from '../../../core/qdrant/qdrantRepository.js';
import { EmbeddingService } from '../../../ai/embeddingService.js';
import logger from '../../../utils/logger.js';
import NodeCache from 'node-cache';

const profileCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes TTL

export default class ChatRetrievalService {
  constructor(messageRepo = new ChatMessageRepository()) {
    this.messageRepo = messageRepo;
  }

  /**
   * Orchestrates the retrieval of context from multiple sources in parallel.
   * Ranks and deduplicates the results into a clean, LLM-agnostic payload.
   * 
   * @param {string} userId - ID of the user requesting context
   * @param {string} sessionId - ID of the active chat session
   * @param {string} prompt - The current user prompt
   * @param {number} topK - Number of Qdrant documents to retrieve
   */
  async buildContext(userId, sessionId, prompt, topK = 5) {
    logger.info('Building retrieval context started', { category: 'ai', userId, sessionId, topK });
    const startTime = performance.now();

    try {
      // 1. Kick off parallel promises to optimize latency
      const [userProfile, { summary, recentMessages }, qdrantResults] = await Promise.all([
        this.fetchUserProfile(userId),
        this.fetchChatHistory(sessionId),
        this.fetchVectorContext(prompt, topK)
      ]);

      // 2. Fetch raw MongoDB posts for the Qdrant hits to get full context
      const retrievedDocs = await this.hydrateAndDeduplicate(qdrantResults);

      // 3. Assemble the ranked context payload
      const rankedContext = {
        systemContext: this.formatSystemContext(userProfile, summary),
        chatHistory: recentMessages,
        retrievedDocuments: retrievedDocs, // Sorted by relevance natively via Qdrant
        currentPrompt: prompt
      };

      const endTime = performance.now();
      logger.info('Retrieval context built successfully', { 
        category: 'ai', 
        latencyMs: Math.round(endTime - startTime),
        retrievedCount: retrievedDocs.length 
      });

      return rankedContext;
    } catch (error) {
      logger.error('Failed to build retrieval context', { category: 'ai', error: error.message });
      throw error;
    }
  }

  /**
   * Fetches the core user profile to establish persona boundaries.
   */
  async fetchUserProfile(userId) {
    const cacheKey = `profile_${userId}`;
    const cachedProfile = profileCache.get(cacheKey);
    
    if (cachedProfile) {
      return cachedProfile;
    }

    const user = await User.findById(userId).select('username skills').lean();
    if (!user) throw new Error('User not found');
    
    profileCache.set(cacheKey, user);
    return user;
  }

  /**
   * Fetches the immediate recent history for context continuity and the long-term summary.
   */
  async fetchChatHistory(sessionId) {
    const session = await this.messageRepo.model.db.model('ChatSession').findById(sessionId).select('memory.summary').lean();
    const summary = session?.memory?.summary || '';

    // Fetch last 5 messages for high-resolution immediate context
    const history = await this.messageRepo.findMessagesBySessionId(sessionId, 5);
    
    // Reverse them to chronological order for the LLM
    const recentMessages = history.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    return { summary, recentMessages };
  }

  /**
   * Generates embedding for the prompt and hits Qdrant.
   */
  async fetchVectorContext(prompt, topK) {
    // Generate embedding
    const promptVector = await EmbeddingService.generateEmbedding(prompt);
    
    // Query Qdrant
    const startTime = performance.now();
    const rawResults = await QdrantRepository.searchPosts(promptVector, topK * 2);
    const endTime = performance.now();
    logger.info('Qdrant Search completed', { category: 'db', latencyMs: Math.round(endTime - startTime), hits: rawResults?.length || 0 });
    
    return rawResults || [];
  }

  /**
   * Extracts MongoDB IDs from Qdrant results, fetches full docs, and deduplicates.
   */
  async hydrateAndDeduplicate(qdrantResults) {
    if (!qdrantResults || qdrantResults.length === 0) return [];

    // Deduplicate on mongoId immediately to prevent fetching the same post twice
    const uniqueMap = new Map();
    for (const result of qdrantResults) {
      const mongoId = result.payload.mongoId;
      // Keep only the highest scoring chunk per document
      if (!uniqueMap.has(mongoId)) {
        uniqueMap.set(mongoId, {
          mongoId,
          score: result.score
        });
      }
    }

    const uniquePostIds = Array.from(uniqueMap.keys());

    const startTime = performance.now();
    const posts = await Post.find({ _id: { $in: uniquePostIds } })
      .select('title content author company role status tags createdAt')
      .populate('userId', 'username branch designation')
      .lean();
    const endTime = performance.now();
    logger.info('Mongo Hydration completed', { category: 'db', latencyMs: Math.round(endTime - startTime), hydratedCount: posts.length });

    // Map the scores back and format as clean context documents
    const hydratedDocs = posts.map(post => {
      const scoreObj = uniqueMap.get(post._id.toString());
      return {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        company: post.company,
        role: post.role,
        status: post.status,
        author: post.userId ? post.userId.username : 'Anonymous',
        authorDetails: post.userId ? 'Student' : '',
        score: scoreObj ? scoreObj.score : 0,
        url: `/post/${post._id}` // Citation reference link
      };
    });

    // Rank strictly by the similarity score descending
    hydratedDocs.sort((a, b) => b.score - a.score);

    return hydratedDocs;
  }

  /**
   * Formats the user profile and conversation summary into a clean system instruction string.
   */
  formatSystemContext(userProfile, summary) {
    const { username, skills } = userProfile;
    
    let ctx = `System Role: You are the AI Assistant for Experio, a platform dedicated to career growth, interview preparation, and professional networking.\n`;
    ctx += `User Context: You are talking to ${username}. `;

    if (skills && skills.length > 0) {
      ctx += `Their skills include: ${skills.join(', ')}. `;
    }

    ctx += '\nCRITICAL: Never ignore this profile context. You MUST personalize all your answers using this information.';

    if (summary) {
      ctx += `\n\n[Previous Conversation Summary]\n${summary}`;
    }

    return ctx;
  }
}
