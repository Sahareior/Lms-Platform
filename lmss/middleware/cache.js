import { redis, isRedisAvailable } from '../config/redis.js';

/**
 * Middleware that caches GET responses in Redis.
 *
 * Usage:
 *   router.get('/list', cacheMiddleware({ ttl: 300 }), listCourses)
 *
 * - Only caches successful (2xx) JSON responses.
 * - Cache key is based on the request path + query string,
 *   which keeps user-specific routes (with /:userId etc.) separate.
 * - When Redis is unavailable, requests pass through untouched.
 */
export function cacheMiddleware({ ttl = 300, keyPrefix = 'cache' } = {}) {
  return async (req, res, next) => {
    if (!isRedisAvailable()) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      // Note: @upstash/redis auto-parses JSON on get(), so `cached` is
      // already the parsed value — no JSON.parse needed here.
      const cached = await redis.get(key);
      if (cached !== null && cached !== undefined) {
        return res
          .set('X-Cache', 'HIT')
          .status(200)
          .json(cached);
      }
    } catch (err) {
      console.error('Redis cache read error:', err);
      return next();
    }

    // Cache the response after the route handler finishes
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, JSON.stringify(body), { ex: ttl })
          .catch((err) => console.error('Redis cache write error:', err));
      }
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

/**
 * Helper to invalidate a cached key (or a prefix pattern via scan).
 * Call this after mutations (create/update/delete) on cached collections.
 */
export async function invalidateCache(key) {
  if (!isRedisAvailable()) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Redis cache invalidate error:', err);
  }
}
