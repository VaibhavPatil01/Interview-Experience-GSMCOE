import redisConnection from '../../../configs/redis.js';
import { reserveQuotaLua, releaseQuotaLua, mergeAnonymousQuotaLua } from '../utils/quotaScripts.js';
import logger from '../../../utils/logger.js';

// Pre-load scripts on module initialization for faster execution
let reserveScriptSha = null;
let releaseScriptSha = null;
let mergeScriptSha = null;

const initializeScripts = async () => {
  try {
    reserveScriptSha = await redisConnection.script('LOAD', reserveQuotaLua);
    releaseScriptSha = await redisConnection.script('LOAD', releaseQuotaLua);
    mergeScriptSha = await redisConnection.script('LOAD', mergeAnonymousQuotaLua);
  } catch (error) {
    logger.error('Failed to load Redis Lua Scripts for AI Quota', { error: error.message });
  }
};

initializeScripts();

/**
 * Gets the current date string in UTC. (YYYY-MM-DD)
 */
const getUTCDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Reserves 1 quota slot atomically.
 * @param {Object} params
 * @param {string} params.resource - 'assistant' or 'resume'
 * @param {string} params.identityType - 'user' or 'anonymous'
 * @param {string} params.identityId - User ID or Visitor/Cookie ID
 * @param {number} params.limit - The maximum allowed requests per day
 * @param {string} [params.email] - Optional. Used for admin bypass check.
 * @returns {Promise<{allowed: boolean, remaining: number, quotaKey?: string, error?: boolean}>}
 */
const reserveQuota = async ({ resource, identityType, identityId, limit, email }) => {
  try {
    // 1. Admin/Demo Bypass Check
    const bypassEmail = process.env.AI_QUOTA_BYPASS_EMAIL;
    if (bypassEmail && email && email.toLowerCase() === bypassEmail.toLowerCase()) {
      return { allowed: true, remaining: 999 };
    }

    // 2. Determine Key
    const dateStr = getUTCDateString();
    const quotaKey = `ai:quota:${resource}:${identityType}:${identityId}:${dateStr}`;
    const expirySeconds = 60 * 60 * 24; // 24 hours

    // 3. Execute Lua Script
    // EVALSHA sha1 numkeys key [key ...] arg [arg ...]
    let result;
    try {
      if (reserveScriptSha) {
        result = await redisConnection.evalsha(reserveScriptSha, 1, quotaKey, limit, expirySeconds);
      } else {
        // Fallback if SHA is not loaded
        result = await redisConnection.eval(reserveQuotaLua, 1, quotaKey, limit, expirySeconds);
      }
    } catch (err) {
      if (err.message.includes('NOSCRIPT')) {
        await initializeScripts();
        result = await redisConnection.evalsha(reserveScriptSha, 1, quotaKey, limit, expirySeconds);
      } else {
        throw err;
      }
    }

    const [status, currentUsage] = result;
    const allowed = status === 1;
    // status: 1 = success, 0 = rejected
    // currentUsage: the value after increment (if success), or the current value (if rejected)
    const remaining = Math.max(0, limit - currentUsage);

    return { allowed, remaining, quotaKey };
  } catch (error) {
    logger.error('Error reserving AI quota', { error: error.message, resource, identityType, identityId });
    // Fail open: Allow request if Redis is temporarily down
    return { allowed: true, remaining: 0, error: true };
  }
};

/**
 * Releases 1 quota slot (Refund). Used when Gemini fails after reservation.
 * @param {string} quotaKey - The precise Redis key returned by reserveQuota
 */
const releaseQuota = async (quotaKey) => {
  if (!quotaKey) return;
  try {
    if (releaseScriptSha) {
      await redisConnection.evalsha(releaseScriptSha, 1, quotaKey);
    } else {
      await redisConnection.eval(releaseQuotaLua, 1, quotaKey);
    }
  } catch (error) {
    if (error.message.includes('NOSCRIPT')) {
      await initializeScripts();
      await redisConnection.evalsha(releaseScriptSha, 1, quotaKey);
    } else {
      logger.error('Error releasing AI quota', { error: error.message, quotaKey });
    }
  }
};

/**
 * Merges anonymous quota usage into the authenticated user's quota.
 * This prevents a user from getting 2 anonymous + 2 logged-in requests.
 */
const mergeAnonymousToUser = async (visitorId, cookieId, userId) => {
  const resources = ['assistant', 'resume'];
  const dateStr = getUTCDateString();
  const expirySeconds = 60 * 60 * 24;

  const identifiers = [];
  if (visitorId) identifiers.push(visitorId);
  if (cookieId) identifiers.push(cookieId);

  try {
    for (const resource of resources) {
      const userKey = `ai:quota:${resource}:user:${userId}:${dateStr}`;
      
      for (const id of identifiers) {
        const anonKey = `ai:quota:${resource}:anonymous:${id}:${dateStr}`;
        
        let mergedAmount = 0;
        if (mergeScriptSha) {
          mergedAmount = await redisConnection.evalsha(mergeScriptSha, 2, anonKey, userKey, expirySeconds);
        } else {
          mergedAmount = await redisConnection.eval(mergeAnonymousQuotaLua, 2, anonKey, userKey, expirySeconds);
        }

        if (mergedAmount > 0) {
          logger.info(`Merged ${mergedAmount} ${resource} usage from anon ${id} to user ${userId}`);
        }
      }
    }
  } catch (error) {
    if (error.message.includes('NOSCRIPT')) {
      await initializeScripts();
      // Safe to ignore re-attempt here, will just happen on next auth action
    } else {
      logger.error('Error merging AI quotas', { error: error.message, userId });
    }
  }
};

export default {
  reserveQuota,
  releaseQuota,
  mergeAnonymousToUser
};
