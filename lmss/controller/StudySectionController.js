import cloudinary from '../config/cloudinary.js';
import StudyPdf from '../models/StudyPdf.js';
import BlogPost from '../models/BlogPost.js';
import StudyGroupLink from '../models/StudyGroupLink.js';
import { invalidatePrefix } from '../middleware/cache.js';

// ─── Study PDFs Helpers ─────────────────────────────────────────

export const getCloudinaryPublicId = (pdf) => {
  if (pdf?.publicId) return pdf.publicId;
  if (!pdf?.fileUrl) return null;
  const match = pdf.fileUrl.match(/\/(?:raw|image|video)\/upload\/(?:v\d+\/)?([^?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const resolveAccessiblePdfUrl = (pdf) => {
  if (!pdf || !pdf.fileUrl) return pdf?.fileUrl;
  if (pdf.fileUrl.includes('/download?')) return pdf.fileUrl;

  // Cloudinary accounts have "Restrict PDF and ZIP files delivery" enabled by default,
  // which causes direct delivery URLs to return 401 Unauthorized (x-cld-error: deny or ACL failure).
  // Generating a signed private_download_url resolves this cleanly.
  if (pdf.fileUrl.includes('cloudinary.com') || pdf.fileUrl.includes('res.cloudinary')) {
    try {
      const publicId = getCloudinaryPublicId(pdf);
      if (publicId) {
        const isImage = pdf.fileUrl.includes('/image/upload/');
        return cloudinary.utils.private_download_url(publicId, 'pdf', {
          resource_type: isImage ? 'image' : 'raw',
          type: 'upload',
        });
      }
    } catch (e) {
      console.error('Error generating Cloudinary signed PDF URL:', e);
    }
  }

  return pdf.fileUrl;
};

// ─── Study PDFs (academic / job) ────────────────────────────────

/** GET /study-pdfs — public list. ?category=academic|job&search=... */
export const getStudyPdfs = async (req, res) => {
  try {
    const { category, search, includeUnpublished } = req.query;
    const filter = {};

    if (category === 'academic' || category === 'job') filter.category = category;
    // Admin panel passes includeUnpublished=true to also see drafts.
    if (includeUnpublished !== 'true') filter.isPublished = true;
    if (search) {
      const rx = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ title: rx }, { description: rx }];
    }

    const pdfs = await StudyPdf.find(filter)
      .sort({ createdAt: -1 });

    const formattedPdfs = pdfs.map((p) => {
      const doc = p.toObject();
      doc.fileUrl = resolveAccessiblePdfUrl(doc);
      return doc;
    });

    res.status(200).json({ pdfs: formattedPdfs });
  } catch (err) {
    console.error('getStudyPdfs error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** GET /study-pdfs/:id — single PDF (public). */
export const getStudyPdfById = async (req, res) => {
  try {
    const pdf = await StudyPdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });
    const doc = pdf.toObject();
    doc.fileUrl = resolveAccessiblePdfUrl(doc);
    res.status(200).json({ pdf: doc });
  } catch (err) {
    console.error('getStudyPdfById error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** POST /study-pdfs — admin create (after the file was uploaded to Cloudinary). */
export const createStudyPdf = async (req, res) => {
  try {
    const { title, description, category, fileUrl, publicId, fileName, fileSize, mimeType, coverImage, isPublished } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Title and file are required' });
    }
    if (category !== 'academic' && category !== 'job') {
      return res.status(400).json({ message: 'Category must be academic or job' });
    }

    const derivedPublicId = publicId || getCloudinaryPublicId({ fileUrl });

    const pdf = await StudyPdf.create({
      title,
      description,
      category,
      fileUrl,
      publicId: derivedPublicId || null,
      fileName: fileName || null,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/pdf',
      coverImage: coverImage || null,
      isPublished: isPublished !== false,
    });

    await invalidatePrefix('cache:study');
    const doc = pdf.toObject();
    doc.fileUrl = resolveAccessiblePdfUrl(doc);
    res.status(201).json({ message: 'PDF created successfully', pdf: doc });
  } catch (err) {
    console.error('createStudyPdf error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** PUT /study-pdfs/:id — admin update. */
export const updateStudyPdf = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'category', 'fileUrl', 'publicId', 'fileName', 'fileSize', 'mimeType', 'coverImage', 'isPublished'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    if (updates.fileUrl && !updates.publicId) {
      updates.publicId = getCloudinaryPublicId({ fileUrl: updates.fileUrl });
    }

    const pdf = await StudyPdf.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    await invalidatePrefix('cache:study');
    const doc = pdf.toObject();
    doc.fileUrl = resolveAccessiblePdfUrl(doc);
    res.status(200).json({ message: 'PDF updated successfully', pdf: doc });
  } catch (err) {
    console.error('updateStudyPdf error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** DELETE /study-pdfs/:id — admin delete. */
export const deleteStudyPdf = async (req, res) => {
  try {
    const pdf = await StudyPdf.findByIdAndDelete(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    await invalidatePrefix('cache:study');
    res.status(200).json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('deleteStudyPdf error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** POST /study-pdfs/:id/download — count a download (public, fire-and-forget). */
export const incrementPdfDownload = async (req, res) => {
  try {
    const pdf = await StudyPdf.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    ).select('downloadCount');
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });
    res.status(200).json({ downloadCount: pdf.downloadCount });
  } catch (err) {
    console.error('incrementPdfDownload error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** GET /study-pdfs/:id/file — direct download / view redirect */
export const getStudyPdfFile = async (req, res) => {
  try {
    const pdf = await StudyPdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    // Increment download count
    await StudyPdf.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    await invalidatePrefix('cache:study');

    const downloadUrl = resolveAccessiblePdfUrl(pdf.toObject());
    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('getStudyPdfFile error:', err);
    res.status(500).json({ message: 'Failed to access PDF file' });
  }
};

// ─── Blog Posts (সাম্প্রতিক পোস্ট) ───────────────────────────────

/** GET /blog-posts — public list. ?search=&tag=&limit= */
export const getBlogPosts = async (req, res) => {
  try {
    const { search, tag, limit, includeUnpublished } = req.query;
    const filter = {};

    if (includeUnpublished !== 'true') filter.isPublished = true;
    if (tag) filter.tags = { $regex: `^${String(tag).trim()}$`, $options: 'i' };
    if (search) {
      const rx = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ title: rx }, { content: rx }, { excerpt: rx }];
    }

    let query = BlogPost.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Math.min(parseInt(limit, 10) || 10, 50));

    const posts = await query;
    res.status(200).json({ posts });
  } catch (err) {
    console.error('getBlogPosts error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** GET /blog-posts/:id — single post (public). */
export const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ post });
  } catch (err) {
    console.error('getBlogPostById error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** POST /blog-posts — admin create. */
export const createBlogPost = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, author, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await BlogPost.create({
      title,
      content,
      excerpt: excerpt || String(content).slice(0, 200),
      coverImage: coverImage || null,
      tags: Array.isArray(tags) ? tags : [],
      author: author || 'BrainForge Team',
      isPublished: isPublished !== false,
    });

    await invalidatePrefix('cache:study');
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (err) {
    console.error('createBlogPost error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** PUT /blog-posts/:id — admin update. */
export const updateBlogPost = async (req, res) => {
  try {
    const allowed = ['title', 'content', 'excerpt', 'coverImage', 'tags', 'author', 'isPublished'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const post = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await invalidatePrefix('cache:study');
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error('updateBlogPost error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** DELETE /blog-posts/:id — admin delete. */
export const deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await invalidatePrefix('cache:study');
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('deleteBlogPost error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ─── Study Group Links (Facebook / Instagram / YouTube …) ───────

/** GET /study-group-links — public list (active only unless admin). */
export const getStudyGroupLinks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.includeInactive !== 'true') filter.isActive = true;

    const links = await StudyGroupLink.find(filter).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ links });
  } catch (err) {
    console.error('getStudyGroupLinks error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** POST /study-group-links — admin create. */
export const createStudyGroupLink = async (req, res) => {
  try {
    const { title, url, platform, description, iconUrl, isActive, order } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    const link = await StudyGroupLink.create({
      title,
      url,
      platform: platform || 'other',
      description: description || '',
      iconUrl: iconUrl || null,
      isActive: isActive !== false,
      order: order || 0,
    });

    await invalidatePrefix('cache:study');
    res.status(201).json({ message: 'Link created successfully', link });
  } catch (err) {
    console.error('createStudyGroupLink error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** PUT /study-group-links/:id — admin update. */
export const updateStudyGroupLink = async (req, res) => {
  try {
    const allowed = ['title', 'url', 'platform', 'description', 'iconUrl', 'isActive', 'order'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const link = await StudyGroupLink.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!link) return res.status(404).json({ message: 'Link not found' });

    await invalidatePrefix('cache:study');
    res.status(200).json({ message: 'Link updated successfully', link });
  } catch (err) {
    console.error('updateStudyGroupLink error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/** DELETE /study-group-links/:id — admin delete. */
export const deleteStudyGroupLink = async (req, res) => {
  try {
    const link = await StudyGroupLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    await invalidatePrefix('cache:study');
    res.status(200).json({ message: 'Link deleted successfully' });
  } catch (err) {
    console.error('deleteStudyGroupLink error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
