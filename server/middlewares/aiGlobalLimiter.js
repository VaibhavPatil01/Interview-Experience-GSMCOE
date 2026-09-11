import redisConnection from '../configs/redis.js';
import logger from '../utils/logger.js';

/**
 * Global safety budget limiter for Gemini API across all users.
 * Prevents catastrophic billing spikes in case of coordinated attacks.
 * Default: 1000 requests per hour globally.
 */
export const aiGlobalLimiter = async (req, res, next) => {
  const windowSeconds = 3600; // 1 hour window
  const globalLimit = parseInt(process.env.AI_GLOBAL_HOURLY_LIMIT || '1000', 10);
  
  // Create a time bucket key based on the current hour
  const currentHour = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `ai:global_limit:${currentHour}`;

  try {
    const current = await redisConnection.incr(key);

    if (current === 1) {
      await redisConnection.expire(key, windowSeconds * 2); // Expiry slightly longer than the bucket
    }

    if (current > globalLimit) {
      logger.error('CRITICAL: AI Global Safety Limit Exceeded', { current, globalLimit, currentHour });
      return res.status(429).json({
        success: false,
        code: 'AI_GLOBAL_LIMIT_EXCEEDED',
        message: 'The platform is currently experiencing exceptionally high AI traffic. Please try again later.',
      });
    }

    next();
  } catch (error) {
    logger.error('Error in AI Global Rate Limiter', { error: error.message });
    // Fail open on Redis error
    next();
  }
};
