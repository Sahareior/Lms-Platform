import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// ── Initialize Firebase Admin (once) ──────────────────────────────────────────
// Set FIREBASE_SERVICE_ACCOUNT_JSON to the minified JSON string of your
// Firebase service account key (Firebase Console → Project Settings →
// Service Accounts → Generate New Private Key).
if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn(
      '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
      'Google Sign-In will not work until this env var is configured.'
    );
  } else {
    try {
      const serviceAccount = JSON.parse(raw);
      initializeApp({ credential: cert(serviceAccount) });
    } catch (err) {
      console.error('[Firebase Admin] Failed to parse service account JSON:', err.message);
    }
  }
}

/**
 * Verify a Google ID token obtained from the frontend (Firebase Auth popup).
 * Returns the decoded token payload, or throws if the token is invalid.
 *
 * @param {string} idToken - The Firebase ID token from the client.
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export async function verifyGoogleToken(idToken) {
  const auth = getAuth();
  return auth.verifyIdToken(idToken);
}
