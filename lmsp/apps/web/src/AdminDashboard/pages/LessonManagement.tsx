import React, { useState, useMemo } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, InputNumber, Switch, Space,
  Spin, Alert, Tag, message, Popconfirm, Typography, Empty, Divider, Select,
  Tooltip, Badge
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, VideoCameraOutlined, EyeOutlined, LinkOutlined,
  FileTextOutlined, SearchOutlined, FilterOutlined, ClockCircleOutlined,
  BookOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import MediaUpload from '../../reusable/MediaUpload';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  useGetCourseLessonsQuery, useGetAdminCourseByIdQuery,
  useCreateAdminLessonMutation, useUpdateAdminLessonMutation,
  useDeleteAdminLessonMutation,
  type AdminLesson
} from '@my-monorepo/store';

const { TextArea } = Input;
const { Text, Title } = Typography;

const RESOURCE_TYPES = ['PDF', 'DOC', 'PPT', 'VIDEO', 'AUDIO', 'OTHER'] as const;

// Helpers
const secondsToMinutes = (s: number) => Math.max(0.1, Math.round((s / 60) * 10) / 10);

const parseMaterial = (val: string | string[] | undefined): string[] | undefined => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim()).filter(Boolean);
};

// Map an uploaded file's mime type / extension to a resource type.
const detectResourceType = (mime?: string, fileName?: string): typeof RESOURCE_TYPES[number] => {
  const m = (mime || '').toLowerCase();
  const ext = (fileName || '').toLowerCase().split('.').pop() || '';
  if (m.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'VIDEO';
  if (m.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) return 'AUDIO';
  if (m.includes('pdf') || ext === 'pdf') return 'PDF';
  if (m.includes('word') || m.includes('document') || ['doc', 'docx'].includes(ext)) return 'DOC';
  if (m.includes('presentation') || m.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return 'PPT';
  return 'OTHER';
};

const LessonManagement: React.FC = () => {
  const { courseId: rawCourseId } = useParams<{ courseId?: string }>();
  const courseId = rawCourseId && rawCourseId !== 'undefined' ? rawCourseId : undefined;
  const navigate = useNavigate();
  const { data: course, isLoading: courseLoading } = useGetAdminCourseByIdQuery(courseId ?? skipToken);
  const { data: lessonsData, isLoading: lessonsLoading, error, refetch } = useGetCourseLessonsQuery(courseId ? { courseId } : skipToken);

  const [createLesson, { isLoading: isCreating }] = useCreateAdminLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateAdminLessonMutation();
  const [deleteLesson] = useDeleteAdminLessonMutation();

  // Upload loading states
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const createVideoUri = Form.useWatch('videoUri', createForm);
  const editVideoUri = Form.useWatch('videoUri', editForm);
  const createDuration = Form.useWatch('duration', createForm);
  const editDuration = Form.useWatch('duration', editForm);

  // Resources state
  const [createResources, setCreateResources] = useState<{ name: string; url: string; type: typeof RESOURCE_TYPES[number] }[]>([]);
  const [editResources, setEditResources] = useState<{ name: string; url: string; type: typeof RESOURCE_TYPES[number] }[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceEditMode, setResourceEditMode] = useState<'create' | 'edit'>('create');
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resourceForm] = Form.useForm();
  const resourceUrl = Form.useWatch('url', resourceForm);

  // Search & filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const lessons = lessonsData?.lessons ?? [];

  // ── Video upload handler ─────
  const handleVideoUpload = (form: any) => (url: string, meta?: { duration?: number }) => {
    form.setFieldValue('videoUri', url);
    if (meta?.duration) {
      form.setFieldValue('duration', secondsToMinutes(meta.duration));
    }
  };

  // ── Resource helpers ────────────────────────────
  const openAddResource = (mode: 'create' | 'edit', index?: number) => {
    setResourceEditMode(mode);
    if (mode === 'edit' && index !== undefined) {
      setEditingResourceIndex(index);
      resourceForm.setFieldsValue(editResources[index]);
    } else {
      setEditingResourceIndex(null);
      resourceForm.resetFields();
    }
    setResourceModalOpen(true);
  };

  // Auto-fill url/name/type from the uploaded file's metadata.
  const handleResourceUpload = (url: string, meta?: { name?: string; mimeType?: string }) => {
    resourceForm.setFieldValue('url', url);
    if (meta?.name) {
      resourceForm.setFieldValue('name', meta.name.replace(/\.[^/.]+$/, ''));
    }
    resourceForm.setFieldValue('type', detectResourceType(meta?.mimeType, meta?.name));
  };

  const handleSaveResource = () => {
    resourceForm.validateFields().then((values) => {
      if (resourceEditMode === 'create') {
        setCreateResources(prev => [...prev, values]);
      } else if (editingResourceIndex !== null) {
        setEditResources(prev => {
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
      setCreateResources(prev => prev.filter((_, i) => i !== index));
    } else {
      setEditResources(prev => prev.filter((_, i) => i !== index));
    }
  };

  // ── CRUD handlers ───────────────────────────────
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
      message.success('Lesson updated!');
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
      message.success('Lesson deleted');
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

  // ── Statistics ──────────────────────────────────
  const stats = useMemo(() => {
    const total = lessons.length;
    const published = lessons.filter(l => l.isPublished).length;
    const draft = total - published;
    const totalResources = lessons.reduce((acc, l) => acc + (l.resources?.length || 0) + (l.material?.length || 0), 0);
    return { total, published, draft, totalResources };
  }, [lessons]);

  // ── Filtered lessons ────────────────────────────
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchSearch = !searchText || lesson.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && lesson.isPublished) ||
        (statusFilter === 'draft' && !lesson.isPublished);
      return matchSearch && matchStatus;
    });
  }, [lessons, searchText, statusFilter]);

  // ── Columns ─────────────────────────────────────
  const columns: ColumnsType<AdminLesson> = [
    {
      title: '#',
      key: 'index',
      width: 52,
      render: (_: any, __: AdminLesson, index: number) => (
        <span className="text-emerald-400/70 font-mono text-xs font-medium">{index + 1}</span>
      ),
    },
    {
      title: 'Lesson',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: AdminLesson) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${record.isPublished
            ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
            : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25'
            }`}>
            <VideoCameraOutlined className="text-base" />
          </div>
          <div>
            <Text strong className="block leading-tight text-[#E8F5EC]">{title}</Text>
            <span className="text-xs text-[#7A8A80]">
              {record.duration ? `${record.duration} min` : 'No duration'}
              {record.isPreview && (
                <span className="text-emerald-400 font-medium"> · Free preview</span>
              )}
            </span>
          </div>
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
      render: (mins: number) => mins ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25">
          <ClockCircleOutlined className="text-[10px]" />
          {mins} min
        </span>
      ) : (
        <span className="text-[#4A564E]">—</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_: any, record: AdminLesson) => (
        <Tag
          icon={record.isPublished ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          className={`!rounded-full !px-2.5 !py-0.5 !border-0 !font-medium ${record.isPublished
            ? '!bg-emerald-500/15 !text-emerald-300'
            : '!bg-amber-500/15 !text-amber-300'
            }`}
        >
          {record.isPublished ? 'Published' : 'Draft'}
        </Tag>
      ),
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
      ],
      onFilter: (value, record) => (value === 'published' ? record.isPublished : !record.isPublished),
    },
    {
      title: 'Preview',
      dataIndex: 'isPreview',
      key: 'isPreview',
      width: 90,
      render: (val: boolean) => val ? (
        <Tag icon={<EyeOutlined />} className="!rounded-full !bg-teal-500/15 !text-teal-300 !border-0 !font-medium">
          Free
        </Tag>
      ) : (
        <span className="text-[#4A564E]">—</span>
      ),
    },
    {
      title: 'Resources',
      key: 'resources',
      width: 100,
      render: (_: any, record: AdminLesson) => {
        const count = (record.resources?.length || 0) + (record.material?.length || 0);
        return count > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25">
            <LinkOutlined className="text-[10px]" />
            {count}
          </span>
        ) : (
          <span className="text-[#4A564E]">—</span>
        );
      },
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 70,
      render: (order: number) => (
        <span className="font-mono text-xs bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg ring-1 ring-emerald-500/25">
          {order ?? 0}
        </span>
      ),
      sorter: (a, b) => (a.order ?? 0) - (b.order ?? 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: AdminLesson) => (
        <Space size={4}>
          <Tooltip title="Edit lesson">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="!text-emerald-400 hover:!bg-emerald-500/10 hover:!text-emerald-300"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this lesson?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteLesson(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete lesson">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:!bg-red-500/10"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Loading / Error states ──────────────────────────────────
  if (courseLoading || lessonsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <Spin size="large" />
        <Text className="text-emerald-400/80">Loading lessons…</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Lessons"
        description="Could not load lessons for this course."
        type="error"
        showIcon
        action={
          <Button onClick={refetch} className="!border-emerald-500 !text-emerald-400">
            Retry
          </Button>
        }
        className="m-4 !rounded-xl"
      />
    );
  }

  // ── Shared form content ──
  const lessonFormContent = (form: any, mode: 'create' | 'edit') => {
    const rawVideoUri = form === createForm ? createVideoUri : editVideoUri;
    const videoUri = typeof rawVideoUri === 'string' ? rawVideoUri : undefined;
    const isRealVideoUrl = !!videoUri && (videoUri.startsWith('http://') || videoUri.startsWith('https://'));
    const duration = form === createForm ? createDuration : editDuration;
    const resources = mode === 'create' ? createResources : editResources;

    return (
      <>
        <Form.Item
          name="title"
          label={<span className="text-[#C9DCCE] font-medium">Title</span>}
          rules={[{ required: true }]}
        >
          <Input
            placeholder="e.g. Introduction to Algorithms"
            className="!rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-[#C9DCCE] font-medium">Description</span>}
          rules={[{ required: true }]}
        >
          <TextArea
            rows={3}
            placeholder="Brief description of the lesson..."
            className="!rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
          />
        </Form.Item>

        {/* Order & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="order"
            label={<span className="text-[#C9DCCE] font-medium">Order</span>}
            initialValue={mode === 'create' ? lessons.length + 1 : undefined}
          >
            <InputNumber min={0} className="w-full !rounded-lg" />
          </Form.Item>
          <Form.Item
            name="duration"
            label={<span className="text-[#C9DCCE] font-medium">Duration (min)</span>}
          >
            <InputNumber min={0} className="w-full !rounded-lg" />
          </Form.Item>
        </div>

        {/* Video Upload */}
        <Form.Item
          name="videoUri"
          label={<span className="text-[#C9DCCE] font-medium">Lesson Video</span>}
          rules={[{ required: true, message: 'Please upload or enter a video URL' }]}
        >
          {!isRealVideoUrl ? (
            <div className="border-2 border-dashed border-emerald-500/30 rounded-xl p-5 bg-gradient-to-br from-emerald-500/10 to-[#0B0B0B] hover:border-emerald-500/50 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-emerald-500/30">
                  <PlayCircleOutlined className="text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#E8F5EC] mb-1">Upload a video file</h4>
                  <p className="text-xs text-[#9BA8A0] mb-3">
                    MP4, WebM, or OGG. Duration will be auto-filled.
                  </p>
                  <MediaUpload
                    type="video"
                    value={videoUri}
                    onChange={handleVideoUpload(form)}
                    onLoadingChange={setIsVideoUploading}
                    label="Choose File"
                    showPreview={false}
                  />
                  {isVideoUploading && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 18, color: '#10B981' }} spin />} />
                      <span className="font-semibold animate-pulse">Uploading video to Cloudinary... Please wait.</span>
                    </div>
                  )}
                  <Divider plain className="!my-3 text-xs text-emerald-400/80">or paste a URL</Divider>
                  <Input
                    placeholder="https://..."
                    prefix={<LinkOutlined className="text-emerald-400" />}
                    onChange={(e) => form.setFieldValue('videoUri', e.target.value)}
                    className="!rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-emerald-500/20 rounded-xl p-4 bg-[#0B0B0B] shadow-sm ring-1 ring-emerald-500/10">
              <div className="flex gap-4">
                <div className="w-36 h-22 bg-black rounded-lg overflow-hidden flex-shrink-0 relative shadow-inner">
                  <video
                    src={videoUri}
                    controls
                    className="w-full h-full object-cover"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge
                      status="success"
                      text={<span className="text-xs font-semibold text-emerald-400">Video ready</span>}
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        form.setFieldValue('videoUri', undefined);
                        form.setFieldValue('duration', undefined);
                      }}
                      className="!text-xs hover:!bg-red-500/10"
                    />
                  </div>
                  <p className="text-xs text-[#9BA8A0] truncate mb-2 font-mono">{videoUri}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <ClockCircleOutlined className="text-emerald-400" />
                    {duration ? (
                      <span className="font-semibold text-emerald-300">{duration} min</span>
                    ) : (
                      <span className="text-[#7A8A80] italic">No duration extracted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form.Item>

        {/* Toggles */}
        <div className="flex gap-10 py-1">
          <Form.Item
            name="isPreview"
            label={<span className="text-[#C9DCCE] font-medium">Free Preview</span>}
            valuePropName="checked"
            className="!mb-0"
          >
            <Switch className="!bg-[#2A2A2A]" />
          </Form.Item>
          <Form.Item
            name="isPublished"
            label={<span className="text-[#C9DCCE] font-medium">Published</span>}
            valuePropName="checked"
            className="!mb-0"
          >
            <Switch className="!bg-[#2A2A2A]" />
          </Form.Item>
        </div>

        {/* Resources */}
        <Divider titlePlacement="start" plain className="!text-sm !font-semibold !text-emerald-400/90 !mb-3 !mt-5">
          <Space size={6}>
            <LinkOutlined />
            Resources
          </Space>
        </Divider>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 mb-3">
            {resources.map((res, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/15 hover:border-emerald-500/30 transition-colors"
              >
                <Space size={8}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <FileTextOutlined className="text-xs" />
                  </div>
                  <span className="text-sm font-medium text-[#C9DCCE]">{res.name}</span>
                  <Tag className="!rounded-md !bg-emerald-500/15 !text-emerald-300 !border-0 !text-xs !font-medium">
                    {res.type}
                  </Tag>
                </Space>
                <Space size={2}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openAddResource(mode, idx)}
                    className="!text-emerald-400 hover:!bg-emerald-500/10"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveResource(mode, idx)}
                    className="hover:!bg-red-500/10"
                  />
                </Space>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            description={<span className="text-[#7A8A80] text-sm">No resources yet</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="!py-3 !mb-2"
          />
        )}

        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => openAddResource(mode)}
          className="!mb-4 !rounded-lg !border-emerald-500/40 !text-emerald-400 hover:!border-emerald-500 hover:!text-emerald-300 hover:!bg-emerald-500/10"
        >
          Add Resource
        </Button>

        <Form.Item
          name="material"
          label={<span className="text-[#C9DCCE] font-medium">Material URLs (comma-separated)</span>}
        >
          <Input
            placeholder="https://... , https://..."
            className="!rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
          />
        </Form.Item>
      </>
    );
  };

  return (
    <div className="lesson-management min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 bg-[#0B0B0B] rounded-2xl p-6 shadow-sm border border-emerald-500/15">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
          className="!mb-3 !p-0 !text-emerald-400 hover:!text-emerald-300 !font-medium"
        >
          Back to Courses
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Title level={3} className="!mb-1 !text-[#E8F5EC] !font-semibold">
              <BookOutlined className="mr-2.5 text-emerald-400" />
              {course?.title || 'Lessons'}
            </Title>
            <Text className="text-[#7A8A80] text-sm">Course ID: {courseId}</Text>
          </div>
          <Space wrap size={10}>
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              className="!rounded-lg !border-emerald-500/30 !text-emerald-400 hover:!border-emerald-500/60 hover:!text-emerald-300"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600 !shadow-md !shadow-emerald-900/50"
            >
              Add Lesson
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <Divider dashed className="!my-5 !border-emerald-500/20" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-icon bg-emerald-500/15 text-emerald-400">
              <PlayCircleOutlined />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8F5EC] tracking-tight">{stats.total}</div>
              <div className="text-xs text-[#7A8A80] font-medium">Total Lessons</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-emerald-500/15 text-emerald-400">
              <CheckCircleOutlined />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8F5EC] tracking-tight">{stats.published}</div>
              <div className="text-xs text-[#7A8A80] font-medium">Published</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-amber-500/15 text-amber-400">
              <ClockCircleOutlined />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8F5EC] tracking-tight">{stats.draft}</div>
              <div className="text-xs text-[#7A8A80] font-medium">Drafts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-teal-500/15 text-teal-400">
              <LinkOutlined />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8F5EC] tracking-tight">{stats.totalResources}</div>
              <div className="text-xs text-[#7A8A80] font-medium">Resources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Card
        className="!mb-4 !rounded-2xl !shadow-sm !border-emerald-500/15"
        bodyStyle={{ padding: '16px 24px' }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Search lessons..."
            prefix={<SearchOutlined className="text-emerald-400" />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            className="w-full sm:w-72 !rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-44"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
            suffixIcon={<FilterOutlined className="text-emerald-400" />}
          />
          <div className="ml-auto">
            <Text className="text-[#7A8A80] text-sm">
              <span className="font-semibold text-emerald-400">{filteredLessons.length}</span>
              {' '}of {lessons.length} lessons
            </Text>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card
        className="!rounded-2xl !shadow-sm !border-emerald-500/15 overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        {filteredLessons.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-[#7A8A80]">No lessons match your criteria</span>}
            className="!py-16"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600"
            >
              Create First Lesson
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredLessons}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
              className: '!px-4 !py-3',
            }}
            scroll={{ x: 800 }}
            rowClassName="hover:!bg-emerald-500/5 transition-colors"
            className="emerald-table"
          />
        )}
      </Card>

      {/* Create Lesson Modal */}
      <Modal
        title={
          <Space className="text-emerald-400">
            <PlusOutlined />
            <span className="font-semibold">Create New Lesson</span>
          </Space>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
          setCreateResources([]);
        }}
        footer={null}
        width={720}
        destroyOnClose
        className="emerald-modal"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateLesson} className="mt-5">
          {lessonFormContent(createForm, 'create')}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-emerald-500/10">
            <Button
              onClick={() => {
                setCreateModalOpen(false);
                createForm.resetFields();
                setCreateResources([]);
              }}
              className="!rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating}
              className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600 !shadow-sm"
            >
              Create Lesson
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        title={
          <Space className="text-emerald-400">
            <EditOutlined />
            <span className="font-semibold">Edit Lesson</span>
          </Space>
        }
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingLesson(null);
          editForm.resetFields();
          setEditResources([]);
        }}
        footer={null}
        width={720}
        destroyOnClose
        className="emerald-modal"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditLesson} className="mt-5">
          {lessonFormContent(editForm, 'edit')}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-emerald-500/10">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                setEditingLesson(null);
                editForm.resetFields();
                setEditResources([]);
              }}
              className="!rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600 !shadow-sm"
            >
              Update Lesson
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Resource Modal */}
      <Modal
        title={
          <span className="font-semibold text-emerald-400">
            {editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
          </span>
        }
        open={resourceModalOpen}
        onCancel={() => {
          setResourceModalOpen(false);
          resourceForm.resetFields();
        }}
        onOk={handleSaveResource}
        okText={editingResourceIndex !== null ? 'Update' : 'Add'}
        okButtonProps={{
          className: '!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600',
        }}
        cancelButtonProps={{ className: '!rounded-lg' }}
        width={480}
        className="emerald-modal"
      >
        <Form form={resourceForm} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Lecture slides" className="!rounded-lg" />
          </Form.Item>
          <Form.Item
            name="url"
            label={<span className="text-[#C9DCCE] font-medium">File / URL</span>}
            rules={[{ required: true, type: 'url', message: 'Please upload a file or enter a valid URL' }]}
          >
            {!(typeof resourceUrl === 'string' && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://'))) ? (
              <div className="border-2 border-dashed border-emerald-500/30 rounded-xl p-5 bg-gradient-to-br from-emerald-500/10 to-[#0B0B0B] hover:border-emerald-500/50 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-emerald-500/30">
                    <FileTextOutlined className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[#E8F5EC] mb-1">Upload a resource file</h4>
                    <p className="text-xs text-[#9BA8A0] mb-3">
                      PDF, DOC, PPT, audio or video. Name & type are auto-detected.
                    </p>
                    <MediaUpload
                      type="file"
                      value={resourceUrl}
                      onChange={handleResourceUpload}
                      onLoadingChange={setIsFileUploading}
                      label="Choose File"
                      showPreview={false}
                    />
                    {isFileUploading && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 18, color: '#10B981' }} spin />} />
                        <span className="font-semibold animate-pulse">Uploading resource file... Please wait.</span>
                      </div>
                    )}
                    <Divider plain className="!my-3 text-xs text-emerald-400/80">or paste a URL</Divider>
                    <Input
                      placeholder="https://..."
                      prefix={<LinkOutlined className="text-emerald-400" />}
                      onChange={(e) => resourceForm.setFieldValue('url', e.target.value)}
                      className="!rounded-lg hover:!border-emerald-500/60 focus:!border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-emerald-500/20 rounded-xl p-4 bg-[#0B0B0B] shadow-sm ring-1 ring-emerald-500/10">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge
                    status="success"
                    text={<span className="text-xs font-semibold text-emerald-400">File ready</span>}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => resourceForm.setFieldValue('url', undefined)}
                    className="!text-xs hover:!bg-red-500/10"
                  />
                </div>
                <p className="text-xs text-[#9BA8A0] truncate font-mono">{resourceUrl}</p>
              </div>
            )}
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select type" className="!rounded-lg">
              {RESOURCE_TYPES.map(t => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Styles */}
      <style>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #0E1812 0%, #0B0B0B 100%);
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid #1E2B21;
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 4px 16px -4px rgba(34, 197, 94, 0.15);
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .emerald-table .ant-table-thead > tr > th {
          background: #0F0F0F !important;
          color: #4ADE80 !important;
          font-weight: 600;
          border-bottom: 1px solid #171717 !important;
        }
        .emerald-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #171717 !important;
        }
        .ant-table-cell {
          vertical-align: middle;
        }
        .emerald-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #1F2B22;
        }
        .emerald-modal .ant-modal-header {
          border-bottom: 1px solid #1E2B21;
          padding: 16px 24px;
        }
        .ant-switch-checked {
          background-color: #22C55E !important;
        }
        .ant-btn-primary {
          box-shadow: 0 2px 10px -2px rgba(34, 197, 94, 0.4);
        }
      `}</style>
    </div>
  );
};

export default LessonManagement;
