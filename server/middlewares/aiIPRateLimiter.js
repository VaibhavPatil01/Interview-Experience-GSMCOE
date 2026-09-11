import redisConnection from '../configs/redis.js';
import logger from '../utils/logger.js';

/**
 * Strict Redis-backed IP rate limiter for AI endpoints.
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} limit - Max requests per IP within the window
 */
export const aiIPRateLimiter = (windowMs = 600000, limit = 15) => {
  return async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip) return next(); // Fallback if IP cannot be determined

    const key = `ai:ip_limit:${ip}`;

    try {
      // INCR returns the value AFTER incrementing
      const current = await redisConnection.incr(key);
      
      if (current === 1) {
        // First request in the window, set expiry
        // converting ms to seconds for EXPIRE command or use PEXPIRE
        await redisConnection.pexpire(key, windowMs);
      }

      if (current > limit) {
        logger.warn('AI IP Rate Limit Exceeded', { ip, current, limit });
        return res.status(429).json({
          success: false,
          code: 'AI_IP_RATE_LIMIT_EXCEEDED',
          message: 'Too many rapid requests from this IP. Please slow down and try again later.',
        });
      }

      next();
    } catch (error) {
      logger.error('Error in AI IP Rate Limiter', { error: error.message, ip });
      // Fail open on Redis error so normal users aren't locked out due to transient cache issues
      next();
    }
  };
};
