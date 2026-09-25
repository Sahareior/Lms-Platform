import mongoose from 'mongoose';

const studyGroupLinkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  url: { type: String, required: true, trim: true },
  platform: { type: String, enum: ['facebook', 'instagram', 'youtube', 'whatsapp', 'telegram', 'other'], default: 'other' },
  description: { type: String, trim: true, maxlength: 300, default: '' },
  iconUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

studyGroupLinkSchema.index({ isActive: 1, order: 1 });

const StudyGroupLink = mongoose.model('StudyGroupLink', studyGroupLinkSchema);
export default StudyGroupLink;
