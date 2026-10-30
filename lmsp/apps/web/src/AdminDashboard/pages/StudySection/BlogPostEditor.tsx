import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Button, Form, Input, Tag, message, Space, Spin, Switch, Checkbox, Alert, Typography, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, FileImageOutlined, TagsOutlined,
} from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import dayjs from 'dayjs';
import MediaUpload from '../../../reusable/MediaUpload';
import {
  useGetBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  type BlogPost,
} from '@my-monorepo/store';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Toolbar: headings, bold/italic/underline/strike, colors, lists, quote,
// code-block, links, images (base64) and clean formatting. Bengali text
// works out of the box since Quill is unicode-native.
const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet',
  'blockquote', 'code-block', 'link', 'image',
];

const BlogPostEditor: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(postId);

  // Reuse the list endpoint to fetch the single post (cached by RTK Query).
  const { data: existing, isFetching } = useGetBlogPostsQuery(
    isEdit ? { includeUnpublished: true } : undefined,
    { skip: !isEdit }
  );
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();

  const [form] = Form.useForm();
  const [content, setContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const post: BlogPost | undefined = useMemo(
    () => existing?.posts.find((p) => p._id === postId),
    [existing, postId]
  );

  // Populate the form once the post arrives (edit mode).
  useEffect(() => {
    if (post && isEdit) {
      form.setFieldsValue({
        title: post.title,
        excerpt: post.excerpt,
        tags: (post.tags ?? []).join(', '),
        isPublished: post.isPublished,
      });
      setContent(post.content || '');
      setCoverImage(post.coverImage ?? null);
    }
  }, [post, isEdit, form]);

  const saving = isCreating || isUpdating;

  const handleSubmit = async (values: any) => {
    if (!content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      message.error('Please write the post content');
      return;
    }
    const payload = {
      title: values.title,
      content,
      excerpt: values.excerpt || content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200),
      tags: values.tags
        ? String(values.tags).split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
      coverImage: coverImage ?? null,
      isPublished: values.isPublished ?? true,
    };
    try {
      if (isEdit && postId) {
        await updatePost({ id: postId, data: payload }).unwrap();
        message.success('Post updated!');
      } else {
        await createPost(payload).unwrap();
        message.success('Post published!');
      }
      navigate('/admin/study-section/blog');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to save post');
    }
  };

  const isSaving = saving;
  if (isEdit && isFetching && !post) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isEdit && !isFetching && !post) {
    return (
      <div className="p-4">
        <Alert
          type="error"
          message="Post not found"
          description="The post you are trying to edit does not exist."
          action={
            <Button size="small" onClick={() => navigate('/admin/study-section/blog')}>
              Back to list
            </Button>
          }
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/study-section/blog')}
          >
            Back
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </Title>
          {isEdit && post && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last updated {dayjs(post.updatedAt).format('DD MMM YYYY, hh:mm A')}
            </Text>
          )}
        </Space>
        <Space>
          <Form.Item name="isPublished" noStyle>
            <span>
              <Switch
                checkedChildren="Published"
                unCheckedChildren="Draft"
                checked={form.getFieldValue('isPublished') ?? true}
                onChange={(checked) => form.setFieldValue('isPublished', checked)}
              />
            </span>
          </Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={() => form.submit()}
          >
            {isEdit ? 'Save Changes' : 'Publish Post'}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isPublished: true }}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* ── Main column: title + editor ─────────────────── */}
          <div className="lg:col-span-2">
            <Card>
              <Form.Item
                name="title"
                label="Post Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input
                  placeholder="e.g. ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার প্রস্তুতি কৌশল"
                  size="large"
                  style={{ fontSize: 18, fontWeight: 600 }}
                />
              </Form.Item>

              <Form.Item label="Content" required>
                <div className="quill-admin-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={TOOLBAR_MODULES}
                    formats={FORMATS}
                    placeholder="Write your post here… বাংলা লেখা সমর্থিত ✓"
                    style={{ background: '#ffffff', borderRadius: 8 }}
                  />
                </div>
              </Form.Item>
            </Card>
          </div>

          {/* ── Side column: cover, excerpt, tags, publish ──── */}
          <div>
            <Card title={<Space><FileImageOutlined /> Cover Image</Space>} style={{ marginBottom: 16 }}>
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  style={{ width: '100%', borderRadius: 8, marginBottom: 12, objectFit: 'cover', maxHeight: 160 }}
                />
              )}
              <MediaUpload
                type="image"
                label={coverImage ? 'Replace Cover' : 'Upload Cover'}
                showPreview={false}
                onChange={(url) => setCoverImage(url)}
              />
              {coverImage && (
                <Button
                  type="text"
                  danger
                  size="small"
                  style={{ marginTop: 8 }}
                  onClick={() => setCoverImage(null)}
                >
                  Remove cover
                </Button>
              )}
            </Card>

            <Card title={<Space><TagsOutlined /> Meta</Space>}>
              <Form.Item
                name="excerpt"
                label="Excerpt"
                tooltip="Short summary shown in the list — auto-generated from content if left empty"
              >
                <TextArea rows={3} placeholder="Short summary of the post" />
              </Form.Item>

              <Form.Item name="tags" label="Tags" tooltip="Comma separated">
                <Input placeholder="e.g. ভর্তি পরীক্ষা, টিপস" />
              </Form.Item>

              <Divider style={{ margin: '8px 0 16px' }} />

              <Form.Item name="isPublished" label="Status" valuePropName="checked">
                <Checkbox>Visible to students</Checkbox>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>

      {/* Quill dark-theme tweaks: the admin panel is dark by default, Quill
          ships a white editor — invert it so the writing surface stays dark. */}
      <style>{`
        .quill-admin-wrapper .ql-toolbar {
          border-radius: 8px 8px 0 0;
        }
        .quill-admin-wrapper .ql-container {
          border-radius: 0 0 8px 8px;
          min-height: 420px;
          font-size: 15px;
        }
      `}</style>
    </div>
  );
};

export default BlogPostEditor;
