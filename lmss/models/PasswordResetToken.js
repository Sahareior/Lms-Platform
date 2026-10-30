import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // SHA-256 hash of the raw token — never store the raw token itself.
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ user: 1, expiresAt: 1 });
passwordResetTokenSchema.index({ tokenHash: 1 });

const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
export default PasswordResetToken;
