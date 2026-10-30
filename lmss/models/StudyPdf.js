import mongoose from 'mongoose';

const studyPdfSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  category: { type: String, enum: ['academic', 'job'], required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, default: null },
  fileName: { type: String, default: null },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: 'application/pdf' },
  coverImage: { type: String, default: null },
  isPublished: { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

studyPdfSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
studyPdfSchema.index({ title: 'text', description: 'text' });

const StudyPdf = mongoose.model('StudyPdf', studyPdfSchema);
export default StudyPdf;
