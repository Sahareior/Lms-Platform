import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 250 },
  content: { type: String, required: true },
  excerpt: { type: String, trim: true, maxlength: 300, default: '' },
  coverImage: { type: String, default: null },
  tags: [{ type: String, trim: true }],
  author: { type: String, default: 'BrainForge Team' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

blogPostSchema.index({ isPublished: 1, createdAt: -1 });
blogPostSchema.index({ title: 'text', content: 'text' });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
