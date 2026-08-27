import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisAvailable } from '../config/redis.js';

/**
 * Builds a rate limiter backed by Upstash Redis.
 * When Redis isn't configured, returns a pass-through middleware
 * so the app still works locally.
 */
function createLimiter({ prefix, limit, windowSeconds, message }) {
  if (!isRedisAvailable()) {
    return (req, res, next) => next();
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix,
    analytics: true,
  });

  return async (req, res, next) => {
    const identifier = req.user?.userId || req.ip || 'anonymous';
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
  };
}

/**
 * General API rate limiter: e.g. 60 requests / minute per user/IP.
 */
export const generalRateLimit = createLimiter({
  prefix: 'rl:general',
  limit: 160,
  windowSeconds: 60,
  message: 'Too many requests. Please try again in a minute.',
});

/**
 * Stricter limiter for AI chat: e.g. 20 requests / minute per user/IP.
 */
export const aiChatRateLimit = createLimiter({
  prefix: 'rl:ai-chat',
  limit: 20,
  windowSeconds: 60,
  message: 'AI chat rate limit exceeded. Please slow down and try again.',
});

/**
 * Dedicated limiter for authentication endpoints to slow down brute-force
 * password guessing: e.g. 10 attempts / minute per IP.
 */
export const authRateLimit = createLimiter({
  prefix: 'rl:auth',
  limit: 10,
  windowSeconds: 60,
  message: 'Too many login attempts. Please wait a minute and try again.',
});
