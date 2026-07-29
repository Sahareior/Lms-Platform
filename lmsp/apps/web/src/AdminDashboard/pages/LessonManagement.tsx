import React, { useState } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, InputNumber, Switch, Space,
  Spin, Alert, Tag, message, Popconfirm, Typography, Empty, Divider, Select
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, VideoCameraOutlined, EyeOutlined, LinkOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  useGetCourseLessonsQuery, useGetAdminCourseByIdQuery,
  useCreateAdminLessonMutation, useUpdateAdminLessonMutation,
  useDeleteAdminLessonMutation,
  type AdminLesson, type CreateLessonRequest, type UpdateLessonRequest
} from '@my-monorepo/store';

const { TextArea } = Input;
const { Text, Title } = Typography;

const LessonManagement: React.FC = () => {
  const { courseId: rawCourseId } = useParams<{ courseId?: string }>();
  const courseId = rawCourseId && rawCourseId !== 'undefined' ? rawCourseId : undefined;
  const navigate = useNavigate();

  console.log(courseId, 'tj');

  const { data: course, isLoading: courseLoading } = useGetAdminCourseByIdQuery(courseId ?? skipToken);
  const { data: lessonsData, isLoading: lessonsLoading, error, refetch } = useGetCourseLessonsQuery({courseId});
  const [createLesson, { isLoading: isCreating }] = useCreateAdminLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateAdminLessonMutation();
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteAdminLessonMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Resource management state
  const [createResources, setCreateResources] = useState<{ name: string; url: string; type: 'PDF' | 'DOC' | 'PPT' | 'VIDEO' | 'AUDIO' | 'OTHER' }[]>([]);
  const [editResources, setEditResources] = useState<{ name: string; url: string; type: 'PDF' | 'DOC' | 'PPT' | 'VIDEO' | 'AUDIO' | 'OTHER' }[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceEditMode, setResourceEditMode] = useState<'create' | 'edit'>('create');
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resourceForm] = Form.useForm();

  const lessons = lessonsData?.lessons ?? [];

  const RESOURCE_TYPES = ['PDF', 'DOC', 'PPT', 'VIDEO', 'AUDIO', 'OTHER'] as const;

  // Transform comma-separated material string into array
  const parseMaterial = (val: string | string[] | undefined): string[] | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  };

  // ── Resource dialog handlers ────────────────────────────────
  const openAddResource = (mode: 'create' | 'edit', index?: number) => {
    setResourceEditMode(mode);
    if (mode === 'edit' && index !== undefined) {
      setEditingResourceIndex(index);
      const res = mode === 'create' ? createResources[index!] : editResources[index!];
      resourceForm.setFieldsValue(res);
    } else {
      setEditingResourceIndex(null);
      resourceForm.resetFields();
    }
    setResourceModalOpen(true);
  };

  const handleSaveResource = () => {
    resourceForm.validateFields().then((values) => {
      if (resourceEditMode === 'create') {
        setCreateResources((prev) => [...prev, values]);
      } else if (editingResourceIndex !== null) {
        setEditResources((prev) => {
          const next = [...prev];
          next[editingResourceIndex] = values;
          return next;
        });
      }
      setResourceModalOpen(false);
      resourceForm.resetFields();
    });
  };

  const handleRemoveResource = (mode: 'create' | 'edit', index: number) => {
    if (mode === 'create') {
      setCreateResources((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditResources((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCreateLesson = async (values: any) => {
    if (!courseId) return;
    try {
      const payload = {
        ...values,
        course: courseId,
        material: parseMaterial(values.material),
        resources: createResources.length > 0 ? createResources : undefined,
      };
      await createLesson(payload).unwrap();
      message.success('Lesson created successfully!');
      setCreateModalOpen(false);
      setCreateResources([]);
      createForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create lesson');
    }
  };

  const handleEditLesson = async (values: any) => {
    if (!editingLesson) return;
    try {
      const payload = {
        ...values,
        material: parseMaterial(values.material),
        resources: editResources.length > 0 ? editResources : undefined,
      };
      await updateLesson({ lessonId: editingLesson._id, data: payload }).unwrap();
      message.success('Lesson updated successfully!');
      setEditModalOpen(false);
      setEditingLesson(null);
      setEditResources([]);
      editForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId).unwrap();
      message.success('Lesson deleted successfully!');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete lesson');
    }
  };

  const openEditModal = (lesson: AdminLesson) => {
    setEditingLesson(lesson);
    setEditResources(lesson.resources || []);
    editForm.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      videoUri: lesson.videoUri,
      order: lesson.order,
      duration: lesson.duration,
      isPreview: lesson.isPreview,
      isPublished: lesson.isPublished,
      material: lesson.material?.join(', '),
    });
    setEditModalOpen(true);
  };

  const columns: ColumnsType<AdminLesson> = [
    {
      title: '#',
      key: 'order',
      width: 60,
      render: (_: unknown, __: AdminLesson, index: number) => (
        <span className="text-gray-400 font-mono">{index + 1}</span>
      ),
    },
    {
      title: 'Lesson Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: AdminLesson) => (
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: record.isPublished ? '#f6ffed' : '#fff7e6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: record.isPublished ? '#52c41a' : '#fa8c16',
            }}
          >
            <VideoCameraOutlined />
          </div>
          <div>
            <Text strong style={{ color: '#142347' }}>{title}</Text>
            <p className="text-xs text-gray-400 m-0">
              {record.duration ? `${record.duration} min` : 'No duration set'}
              {record.isPreview ? ' · Preview available' : ''}
            </p>
          </div>
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (mins: number) => mins ? (
        <Tag color="blue">{mins} min</Tag>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_: unknown, record: AdminLesson) => (
        <Space>
          <Tag color={record.isPublished ? 'green' : 'orange'}>
            {record.isPublished ? 'Published' : 'Draft'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Preview',
      dataIndex: 'isPreview',
      key: 'isPreview',
      width: 100,
      render: (val: boolean) => val ? (
        <Tag color="purple" icon={<EyeOutlined />}>Free</Tag>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
    {
      title: 'Resources',
      key: 'resources',
      width: 100,
      render: (_: unknown, record: AdminLesson) => {
        const count = (record.resources?.length || 0) + (record.material?.length || 0);
        return count > 0 ? (
          <Tag color="blue" icon={<LinkOutlined />}>{count} items</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (order: number) => (
        <Tag color="default" className="font-mono">{order ?? 0}</Tag>
      ),
      sorter: (a, b) => (a.order ?? 0) - (b.order ?? 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: AdminLesson) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this lesson?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteLesson(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const isLoading = courseLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading lessons..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Lessons"
        description="There was an error loading the lessons for this course."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div>
      {/* Header with course context */}
      <div className="mb-6">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          className="mb-2 p-0"
          style={{ color: '#667eea' }}
        >
          Back to Courses
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} style={{ color: '#142347', margin: 0 }}>
              Lessons: {course?.title || 'Unknown Course'}
            </Title>
            <Text type="secondary">
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} · Course ID: {courseId}
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Add Lesson
            </Button>
          </Space>
        </div>
      </div>

      <Divider style={{ margin: '12px 0 24px' }} />

      {/* Lessons Table */}
      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        {lessons.length === 0 ? (
          <Empty
            description="No lessons yet"
            className="py-12"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create First Lesson
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={lessons}
            rowKey="_id"
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} lessons`,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Create Lesson Modal */}
      <Modal
        title="Create New Lesson"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        width={640}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateLesson}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true, message: 'Please enter the lesson title' }]}
          >
            <Input placeholder="e.g. Introduction to BCS Syllabus" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={3} placeholder="Lesson description..." />
          </Form.Item>

          <Form.Item
            name="videoUri"
            label="Video URL"
            rules={[{ required: true, message: 'Please enter the video URL' }]}
          >
            <Input placeholder="https://example.com/lesson-video.mp4" />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="order" label="Order" initialValue={lessons.length + 1} className="flex-1">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="duration" label="Duration (minutes)" className="flex-1">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="flex gap-6">
            <Form.Item name="isPreview" label="Free Preview" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="isPublished" label="Publish" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          {/* ── Resources Section ── */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Resources (structured)</span>
              <Button size="small" icon={<PlusOutlined />} onClick={() => openAddResource('create')}>
                Add Resource
              </Button>
            </div>
            {createResources.length > 0 ? (
              <div className="space-y-1.5 mb-3">
                {createResources.map((res, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <FileTextOutlined className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 flex-1 truncate">{res.name}</span>
                    <Tag className="text-[10px]">{res.type}</Tag>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openAddResource('create', idx)} />
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveResource('create', idx)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">No resources added yet.</p>
            )}
          </div>

          <Form.Item name="material" label="Material URLs (comma separated)">
            <Input placeholder="https://example.com/material1.pdf, https://..." />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setCreateModalOpen(false); createForm.resetFields(); }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Lesson
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        title="Edit Lesson"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingLesson(null); editForm.resetFields(); }}
        footer={null}
        width={640}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditLesson}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true, message: 'Please enter the lesson title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="videoUri"
            label="Video URL"
            rules={[{ required: true, message: 'Please enter the video URL' }]}
          >
            <Input />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="order" label="Order" className="flex-1">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="duration" label="Duration (minutes)" className="flex-1">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="flex gap-6">
            <Form.Item name="isPreview" label="Free Preview" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="isPublished" label="Publish" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          {/* ── Resources Section (Edit) ── */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Resources (structured)</span>
              <Button size="small" icon={<PlusOutlined />} onClick={() => openAddResource('edit')}>
                Add Resource
              </Button>
            </div>
            {editResources.length > 0 ? (
              <div className="space-y-1.5 mb-3">
                {editResources.map((res, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <FileTextOutlined className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 flex-1 truncate">{res.name}</span>
                    <Tag className="text-[10px]">{res.type}</Tag>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openAddResource('edit', idx)} />
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveResource('edit', idx)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">No resources added yet.</p>
            )}
          </div>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setEditModalOpen(false); setEditingLesson(null); editForm.resetFields(); }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Lesson
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Resource Add/Edit Dialog ── */}
      <Modal
        title={editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
        open={resourceModalOpen}
        onCancel={() => { setResourceModalOpen(false); resourceForm.resetFields(); }}
        onOk={handleSaveResource}
        okText={editingResourceIndex !== null ? 'Update' : 'Add'}
        width={500}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Resource Name"
            rules={[{ required: true, message: 'Please enter the resource name' }]}
          >
            <Input placeholder="e.g. Lesson Slides PDF" />
          </Form.Item>
          <Form.Item
            name="url"
            label="Resource URL"
            rules={[
              { required: true, message: 'Please enter the resource URL' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
          >
            <Input placeholder="https://storage.googleapis.com/..." />
          </Form.Item>
          <Form.Item
            name="type"
            label="Resource Type"
            rules={[{ required: true, message: 'Please select the resource type' }]}
          >
            <Select placeholder="Select type">
              {RESOURCE_TYPES.map((t) => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonManagement;
