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
 * Helper to invalidate a single cached key.
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

/**
 * Helper to invalidate every cached key under a prefix (e.g. 'cache:exam').
 * Uses SCAN + DEL so admin edits (create/update/delete) are reflected
 * immediately instead of waiting for the TTL to expire.
 */
export async function invalidatePrefix(prefix) {
  if (!isRedisAvailable()) return;
  try {
    let cursor = 0;
    do {
      // Note: @upstash/redis returns the scan cursor as a string,
      // so coerce it to a number before comparing.
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `${prefix}:*`,
        count: 100,
      });
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      cursor = Number(nextCursor);
    } while (cursor !== 0);
  } catch (err) {
    console.error('Redis cache prefix invalidate error:', err);
  }
}
