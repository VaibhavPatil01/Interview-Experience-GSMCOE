import { Worker } from 'bullmq';
import { redisConnection } from '../../configs/redis.js';
import { SYNC_QUEUE_NAME } from './syncQueue.js';
import { Post } from '../../modules/posts/models/Post.js';
import User from '../../modules/users/models/User.js';
import { PromptBuilder } from '../../ai/promptBuilder.js';
import { EmbeddingService } from '../../ai/embeddingService.js';
import { QdrantRepository } from './qdrantRepository.js';
import { eventBus, EVENTS } from '../../modules/posts/events/index.js';

export const initEmbeddingSyncWorker = () => {
  const worker = new Worker(SYNC_QUEUE_NAME, async (job) => {
    const { entityType, entityId } = job.data;
    
    console.log(`[Worker] Processing sync job for ${entityType} ${entityId}`);

    try {
      if (entityType === 'post') {
        const post = await Post.findById(entityId);
        if (!post) {
          console.warn(`[Worker] Post ${entityId} not found, skipping sync.`);
          return;
        }

        const documentStr = PromptBuilder.buildPostDocument(post);
        const vector = await EmbeddingService.generateEmbedding(documentStr);
        
        const payload = {
          company: post.company,
          role: post.role,
          technologies: post.technologies || [],
          difficulty: post.rounds?.[0]?.difficulty || 'Unknown',
          tags: post.tags || [],
          createdDate: new Date(post.createdAt).getTime(),
          authorId: post.userId.toString(),
          version: 1
        };

        await QdrantRepository.upsertPost(entityId, vector, payload);
        console.log(`[Worker] Synced Post ${entityId} to Qdrant`);
        
        // Trigger notification worker to find matching users
        eventBus.emit(EVENTS.POST_MATCH_READY, {
          postId: entityId,
          vector: vector
        });
      }
      else if (entityType === 'user') {
        const user = await User.findById(entityId);
        if (!user) {
          console.warn(`[Worker] User ${entityId} not found, skipping sync.`);
          return;
        }

        const documentStr = PromptBuilder.buildUserDocument(user);
        const vector = await EmbeddingService.generateEmbedding(documentStr);
        
        const payload = {
          createdDate: new Date(user.createdAt).getTime(),
          version: 1
        };

        await QdrantRepository.upsertUser(entityId, vector, payload);
        console.log(`[Worker] Synced User ${entityId} to Qdrant`);
      }
    } catch (error) {
      console.error(`[Worker] Error syncing ${entityType} ${entityId}:`, error);
      throw error; // Let BullMQ handle retries
    }
  }, {
    connection: redisConnection
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed with error ${err.message}`);
  });

  return worker;
};
