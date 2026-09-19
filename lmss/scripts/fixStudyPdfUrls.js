/**
 * One-time fix: normalize Cloudinary "raw" (PDF) URLs stored in StudyPdf.
 *
 * Cloudinary requires the file extension to be part of the public_id for raw
 * files. Signed uploads that didn't set public_id produce extension-less
 * delivery URLs that Chrome serves as application/octet-stream, which makes
 * the PDF viewer fail with "Failed to load PDF document".
 *
 * For every StudyPdf whose fileUrl points to a Cloudinary raw delivery URL
 * without an extension, rewrite it to the .../<public_id>.pdf form.
 *
 * Usage (from the lmss/ directory):
 *   node scripts/fixStudyPdfUrls.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import StudyPdf from '../models/StudyPdf.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

/** Rewrite a Cloudinary raw delivery URL to include the .pdf extension. */
function toPdfUrl(rawUrl) {
  const marker = '/raw/upload/';
  const idx = rawUrl.indexOf(marker);
  if (idx === -1) return null;

  const publicId = rawUrl.slice(idx + marker.length);
  // Already has an extension (or query params / version segment) — leave it.
  if (publicId.endsWith('.pdf')) return null;

  const cleanId = publicId.split('?')[0].replace(/\/+$/, '');
  if (!cleanId) return null;

  return `${rawUrl.slice(0, idx + marker.length)}${cleanId}.pdf`;
}

async function run() {
  await mongoose.connect(url);
  console.log('MongoDB connected');

  const pdfs = await StudyPdf.find({ fileUrl: { $regex: '/raw/upload/' } });
  console.log(`Found ${pdfs.length} StudyPdf document(s) with Cloudinary raw URLs`);

  let fixed = 0;
  for (const pdf of pdfs) {
    const newUrl = toPdfUrl(pdf.fileUrl);
    if (!newUrl) continue;
    await StudyPdf.updateOne({ _id: pdf._id }, { $set: { fileUrl: newUrl } });
    console.log(`Fixed: ${pdf.title}\n  ${pdf.fileUrl}\n  -> ${newUrl}`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} URL(s) rewritten.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
