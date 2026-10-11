/**
 * Shared JWT configuration.
 *
 * JWT_SECRET MUST be provided via the environment in production. Falling back
 * to a value that lives in source code would let anyone who reads the repo
 * forge access tokens (including admin tokens), so we fail fast instead.
 * In development a throwaway fallback keeps the app runnable locally.
 */
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
      'Refusing to start in production with a hardcoded secret.'
  );
}

const DEV_JWT_SECRET = 'brainforge_dev_only_insecure_secret';
const JWT_SECRET = process.env.JWT_SECRET || DEV_JWT_SECRET;
// The refresh secret is derived from the (now trusted) access secret unless
// explicitly overridden, so it is never a value committed to source control.
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;
// Access tokens are short-lived on purpose: when stolen they stop working in
// minutes. The refresh token (30 days) is what keeps users signed in.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
// Refresh token lifetime (days). Also enforced server-side via RefreshToken.expiresAt.
const JWT_REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30', 10);

export { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_DAYS };
