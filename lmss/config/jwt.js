/**
 * Shared JWT configuration.
 *
 * In development, a hardcoded fallback is used.
 * In production, always set the JWT_SECRET environment variable.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'brainforge_jwt_secret_key_2026';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_fallback`;
// Access tokens are short-lived on purpose: when stolen they stop working in
// minutes. The refresh token (30 days) is what keeps users signed in.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
// Refresh token lifetime (days). Also enforced server-side via RefreshToken.expiresAt.
const JWT_REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30', 10);

export { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_DAYS };
