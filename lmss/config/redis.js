import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client (serverless-friendly, works on Vercel).
 *
 * Reads credentials from the environment:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Falls back to a local in-memory stub so the app still boots
 * when Redis isn't configured (e.g. local dev before setup).
 */
const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

export const redis = hasRedisConfig
  ? Redis.fromEnv()
  : null;

/**
 * True when Redis is actually connected/configured.
 * Use this to skip caching/rate-limiting gracefully when Redis is unavailable.
 */
export const isRedisAvailable = () => Boolean(redis);
