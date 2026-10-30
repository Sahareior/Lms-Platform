import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisAvailable } from '../config/redis.js';

/**
 * Builds a rate limiter backed by Upstash Redis.
 * In development or when Redis isn't configured, returns a pass-through middleware
 * so local development and testing are never blocked.
 */
function createLimiter({ prefix, limit, windowSeconds, message }) {
  // Always disable rate limiting in development or when explicitly disabled
  if (
    !isRedisAvailable() ||
    process.env.NODE_ENV === 'development' ||
    process.env.DISABLE_RATE_LIMIT === 'true' ||
    !process.env.NODE_ENV // default local dev when unset
  ) {
    return (req, res, next) => next();
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix,
    analytics: true,
  });

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const tokenPart = authHeader?.startsWith('Bearer ') ? authHeader.slice(7, 32) : null;
      const identifier = req.user?.userId || tokenPart || req.ip || 'anonymous';
      const { success, remaining, reset } = await ratelimit.limit(identifier);

      if (!success) {
        res.set('X-RateLimit-Remaining', String(remaining));
        res.set('X-RateLimit-Reset', String(reset));
        return res.status(429).json({
          message: message || 'Too many requests. Please try again later.',
        });
      }

      res.set('X-RateLimit-Remaining', String(remaining));
      next();
    } catch (err) {
      console.warn('[RateLimit] Warning:', err.message);
      // Fail open so Redis network glitches never break user requests
      next();
    }
  };
}

/**
 * General API rate limiter: generous limit (1500 req/min) for SPAs with concurrent queries.
 */
export const generalRateLimit = createLimiter({
  prefix: 'rl:general',
  limit: 1500,
  windowSeconds: 60,
  message: 'Too many requests. Please try again in a minute.',
});

/**
 * Limiter for AI chat: e.g. 60 requests / minute per user.
 */
export const aiChatRateLimit = createLimiter({
  prefix: 'rl:ai-chat',
  limit: 60,
  windowSeconds: 60,
  message: 'AI chat rate limit exceeded. Please slow down and try again.',
});

/**
 * Dedicated limiter for authentication endpoints: e.g. 30 attempts / minute.
 */
export const authRateLimit = createLimiter({
  prefix: 'rl:auth',
  limit: 30,
  windowSeconds: 60,
  message: 'Too many login attempts. Please wait a minute and try again.',
});
