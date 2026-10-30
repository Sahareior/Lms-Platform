import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
import { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_DAYS } from "../config/jwt.js";

/**
 * Refresh token helpers.
 * Refresh tokens are random 64-hex strings; only their SHA-256 hash is stored.
 * A JWT wrapper is NOT used so tokens can be revoked instantly server-side.
 */

export function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashRefreshToken(value) {
  return crypto.createHmac("sha256", JWT_REFRESH_SECRET).update(value).digest("hex");
}

export function refreshExpiryDate() {
  return new Date(Date.now() + JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
}

/** Persist a new refresh token for a user; returns the raw value (sent once). */
export async function issueRefreshToken(userId, userAgent = null) {
  const value = generateRefreshTokenValue();
  await RefreshToken.create({
    user: userId,
    tokenHash: hashRefreshToken(value),
    expiresAt: refreshExpiryDate(),
    userAgent: userAgent || null,
  });
  return value;
}

/**
 * Validate a refresh token value.
 * Returns { doc } when valid, or { doc, reuse: true } when the token was
 * already rotated/revoked (possible theft → caller should revoke the family).
 */
export async function validateRefreshToken(value) {
  if (!value || typeof value !== "string") return null;
  const tokenHash = hashRefreshToken(value);
  const doc = await RefreshToken.findOne({ tokenHash });
  if (!doc) return null;
  if (doc.revokedAt || doc.rotatedAt) return { doc, reuse: true };
  if (doc.expiresAt < new Date()) return { doc, reuse: false, expired: true };
  return { doc, reuse: false };
}

/** Rotate: mark the old token as rotated and point to its replacement. */
export async function rotateRefreshToken(doc, userId, userAgent = null) {
  const value = generateRefreshTokenValue();
  const newHash = hashRefreshToken(value);
  doc.rotatedAt = new Date();
  doc.replacedByHash = newHash;
  await doc.save();
  await RefreshToken.create({
    user: userId,
    tokenHash: newHash,
    expiresAt: refreshExpiryDate(),
    userAgent: userAgent || null,
  });
  return value;
}

/** Revoke a single token. */
export async function revokeRefreshToken(doc) {
  if (!doc.revokedAt) {
    doc.revokedAt = new Date();
    await doc.save();
  }
}

/** Revoke every active token for a user (used on reuse detection / logout-all). */
export async function revokeAllUserRefreshTokens(userId) {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null, rotatedAt: null },
    { revokedAt: new Date() }
  );
}
