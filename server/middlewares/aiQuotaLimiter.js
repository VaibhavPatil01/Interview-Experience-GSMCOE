import quotaService from '../modules/ai/services/quotaService.js';
import logger from '../utils/logger.js';

/**
 * Creates a middleware to enforce strict daily AI usage quotas.
 * @param {string} type - 'assistant' or 'resume'
 */
export const aiQuotaLimiter = (type) => {
  return async (req, res, next) => {
    let idType = 'anonymous';
    let id = null;
    let userEmail = null;

    // Check if user is authenticated
    if (req.authTokenData && req.authTokenData.id) {
      idType = 'user';
      id = req.authTokenData.id;
      userEmail = req.authTokenData.email;
    } else {
      // Use anon context if available
      if (req.anonContext) {
        id = req.anonContext.primaryId;
      }
    }

    if (!id) {
      // This should never happen if anonIdentity middleware is placed correctly
      return res.status(400).json({ success: false, message: 'Identity resolution failed' });
    }

    // Fixed limit of 2 per day for both assistant and resume.
    const limit = 2;

    const { allowed, remaining, quotaKey, error } = await quotaService.reserveQuota({
      resource: type,
      identityType: idType,
      identityId: id,
      limit,
      email: userEmail
    });

    if (error) {
      // Redis failed, fail open for user / fail closed for anon?
      // "Because this quota exists to protect paid Gemini usage, do NOT simply bypass all quotas when Redis is unavailable.
      // Prefer fail-closed for anonymous AI requests if quota enforcement cannot be verified."
      if (idType === 'anonymous') {
        logger.error('Redis unavailable, failing closed for anonymous AI request.');
        return res.status(503).json({
          success: false,
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI Service is temporarily unavailable. Please try again later.'
        });
      }
      // For authenticated users, fail open slightly to prevent breaking UX completely
      return next();
    }

    if (!allowed) {
      logger.warn('AI Quota Exceeded', { type, idType, id });
      return res.status(429).json({
        success: false,
        code: 'DAILY_AI_QUOTA_EXCEEDED',
        message: 'Daily AI usage limit reached. Please try again tomorrow.',
        remaining: 0
      });
    }

    // Attach quota key to request object in case the controller needs to release it upon internal failure
    req.aiQuotaKey = quotaKey;

    next();
  };
};
