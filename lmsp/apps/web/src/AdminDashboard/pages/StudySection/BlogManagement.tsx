import React, { useState } from 'react';
import {
  Table, Card, Button, Input, Tag, message, Space, Alert, Switch, Popconfirm,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ReadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useGetBlogPostsQuery,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  type BlogPost,
} from '@my-monorepo/store';

const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetBlogPostsQuery({ includeUnpublished: true });
  const [updatePost] = useUpdateBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();

  const [searchText, setSearchText] = useState('');

  const posts = (data?.posts ?? []).filter((p) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    // Strip HTML tags for search since content is now rich text.
    const plain = (p.excerpt ?? p.content.replace(/<[^>]+>/g, ' ')).toLowerCase();
    return p.title.toLowerCase().includes(q) || plain.includes(q);
  });

  const togglePublish = async (post: BlogPost) => {
    try {
      await updatePost({ id: post._id, data: { isPublished: !post.isPublished } }).unwrap();
      message.success(post.isPublished ? 'Unpublished' : 'Published');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id).unwrap();
      message.success('Post deleted!');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete post');
    }
  };

  const stripHtml = (html: string, len = 90) =>
    html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, len);

  const columns: ColumnsType<BlogPost> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <Space>
          {record.coverImage ? (
            <img src={record.coverImage} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded bg-[#14532D]">
              <ReadOutlined style={{ color: '#22C55E' }} />
            </span>
          )}
          <div style={{ maxWidth: 420 }}>
            <div className="font-medium" style={{ color: '#E8F5EC' }}>{title}</div>
            <div className="text-xs text-[#9BA8A0]">
              {stripHtml(record.excerpt || record.content) + ((record.excerpt || record.content).length > 90 ? '…' : '')}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) =>
        tags?.length ? tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>) : <span className="text-[#5F6B64]">—</span>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (d: string) => <span className="text-xs text-[#9BA8A0]">{dayjs(d).format('DD MMM YYYY')}</span>,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (pub: boolean, record) => (
        <Switch size="small" checked={pub} onChange={() => togglePublish(record)} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/study-section/blog/edit/${record._id}`)}
          />
          <Popconfirm title="Delete this post?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card
        title={
          <Space>
            <ReadOutlined />
            <span>Blog Posts (সাম্প্রতিক পোস্ট)</span>
          </Space>
        }
        extra={
          <Space>
            <Input.Search placeholder="Search posts…" allowClear onSearch={setSearchText} style={{ width: 200 }} />
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/study-section/blog/new')}>
              New Post
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert type="error" message="Failed to load posts" showIcon style={{ marginBottom: 16 }} />
        )}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={posts}
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} posts` }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default BlogManagement;
