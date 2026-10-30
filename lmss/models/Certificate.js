import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Public, human-readable code (e.g. GNS-1A2B3C) used on the certificate
    // and for verification lookups.
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    // Snapshots so the certificate stays valid even if the user or course
    // is later renamed/deleted.
    userName: { type: String, default: "" },
    courseTitle: { type: String, default: "" },
    completedLessons: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One certificate per user+course, and fast lookups by owner.
certificateSchema.index({ user: 1, course: 1 }, { unique: true });
certificateSchema.index({ user: 1, issuedAt: -1 });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
