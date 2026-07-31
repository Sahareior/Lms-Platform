/**
 * Shared JWT configuration.
 *
 * In development, a hardcoded fallback is used.
 * In production, always set the JWT_SECRET environment variable.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'brainforge_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export { JWT_SECRET, JWT_EXPIRES_IN };
