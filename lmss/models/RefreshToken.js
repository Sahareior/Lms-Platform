import mongoose from "mongoose";

/**
 * Refresh token model.
 * - Only the SHA-256 hash of the token is stored (a DB leak can't be replayed).
 * - `rotatedAt`/`revokedAt` support rotation + reuse detection.
 * - TTL index auto-removes expired tokens (expiresAt + 90d grace).
 */
const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  rotatedAt: {
    type: Date,
    default: null,
  },
  replacedByHash: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90, // auto-delete 90 days after creation
  },
});

// Partial index so token lookups by hash are fast
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
