import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Button, Modal, Form, Input, Space,
  Spin, Alert, message, Typography, Divider, Select,
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, EditOutlined,
  ReloadOutlined, LinkOutlined,
  SearchOutlined, FilterOutlined, ClockCircleOutlined,
  BookOutlined, CheckCircleOutlined, PlayCircleOutlined,
  FolderOpenOutlined, FolderAddOutlined, HolderOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  useGetCourseLessonsQuery, useGetAdminCourseByIdQuery,
  useCreateAdminLessonMutation, useUpdateAdminLessonMutation,
  useDeleteAdminLessonMutation,
  useGetCourseModulesQuery, useCreateAdminModuleMutation,
  useUpdateAdminModuleMutation, useDeleteAdminModuleMutation,
  type AdminLesson, type AdminModule, type AdminModuleWithLessons
} from '@my-monorepo/store';
import LessonFormFields from './_components/LessonFormFields';
import ResourceModal from './_components/ResourceModal';
import ManageModulesModal from './_components/ManageModulesModal';
import LessonTable, { type DragInfo } from './_components/LessonTable';
import {
  secondsToMinutes, parseMaterial, detectResourceType,
  getLessonModuleId,
} from './_components/lessonUtils';
import type { StatusFilter, LessonResource, LessonFormMode } from './_components/lessonUtils';

const { Text, Title } = Typography;

const LessonManagement: React.FC = () => {
  const { courseId: rawCourseId } = useParams<{ courseId?: string }>();
  const courseId = rawCourseId && rawCourseId !== 'undefined' ? rawCourseId : undefined;
  const navigate = useNavigate();
  const { data: course, isLoading: courseLoading } = useGetAdminCourseByIdQuery(courseId ?? skipToken);
  const { data: lessonsData, isLoading: lessonsLoading, error, refetch } = useGetCourseLessonsQuery(courseId ? { courseId } : skipToken);
  const { data: modulesData, isLoading: modulesLoading, refetch: refetchModules } =
    useGetCourseModulesQuery(courseId ? { courseId } : skipToken);

  const [createLesson, { isLoading: isCreating }] = useCreateAdminLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateAdminLessonMutation();
  const [deleteLesson] = useDeleteAdminLessonMutation();
  const [createModule, { isLoading: isCreatingModule }] = useCreateAdminModuleMutation();
  const [updateModule, { isLoading: isUpdatingModule }] = useUpdateAdminModuleMutation();
  const [deleteModule] = useDeleteAdminModuleMutation();

  // Upload loading states
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Resources state
  const [createResources, setCreateResources] = useState<LessonResource[]>([]);
  const [editResources, setEditResources] = useState<LessonResource[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceEditMode, setResourceEditMode] = useState<LessonFormMode>('create');
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resourceForm] = Form.useForm();
  const resourceUrl = Form.useWatch('url', resourceForm);

  // Search & filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Module management state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  const modules: AdminModule[] = modulesData?.modules ?? [];
  const lessons = lessonsData?.lessons ?? [];

  // ── Drag & drop reordering (native HTML5 DnD, no extra deps) ──
  // Local copies of the module structure so drag reorders render
  // immediately, then we persist the new order to the backend.
  const [localModules, setLocalModules] = useState<AdminModuleWithLessons[] | null>(null);
  const [localUncategorized, setLocalUncategorized] = useState<AdminLesson[] | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  useEffect(() => {
    if (modulesData) {
      setLocalModules(modulesData.modules);
      setLocalUncategorized(modulesData.uncategorized);
    }
  }, [modulesData]);

  const commitModuleOrder = async (next: AdminModuleWithLessons[]) => {
    const changed = next
      .map((m, i) => ({ moduleId: m._id, order: i + 1, prev: m.order }))
      .filter(x => x.order !== x.prev);
    if (changed.length === 0) return;
    try {
      await Promise.all(changed.map(c => updateModule({ moduleId: c.moduleId, data: { order: c.order } }).unwrap()));
      message.success('Module order saved');
    } catch {
      message.error('Failed to save module order');
      refetchModules();
    }
  };

  const commitLessonOrder = async (modules: AdminModuleWithLessons[], uncategorized: AdminLesson[]) => {
    // Renumber every lesson by its position across the whole course so the
    // ordering stays consistent between modules and lessons.
    const flat = [...modules.flatMap(m => m.lessons || []), ...uncategorized];
    const changed = flat
      .map((l, i) => ({ lessonId: l._id, order: i + 1, prev: l.order }))
      .filter(x => x.order !== x.prev);
    if (changed.length === 0) return;
    try {
      await Promise.all(changed.map(c => updateLesson({ lessonId: c.lessonId, data: { order: c.order } }).unwrap()));
      message.success('Lesson order saved');
      refetchModules(); // nested lessons are sourced from the modules query
    } catch {
      message.error('Failed to save lesson order');
      refetch();
      refetchModules();
    }
  };

  const handleDrop = (record: any) => {
    if (!dragInfo || dragInfo.key === record.key) return;

    if (dragInfo.rowType === 'module' && record.rowType === 'module') {
      const current = localModules ?? [];
      const from = current.findIndex(m => `module-${m._id}` === dragInfo.key);
      const to = current.findIndex(m => `module-${m._id}` === record.key);
      if (from < 0 || to < 0) return;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setLocalModules(next);
      void commitModuleOrder(next);
    } else if (
      dragInfo.rowType === 'lesson' && record.rowType === 'lesson' &&
      dragInfo.groupId === record.groupId
    ) {
      if (dragInfo.groupId) {
        const current = localModules ?? [];
        const modIdx = current.findIndex(m => m._id === dragInfo.groupId);
        if (modIdx < 0) return;
        const list = [...(current[modIdx].lessons || [])];
        const from = list.findIndex(l => l._id === dragInfo.key);
        const to = list.findIndex(l => l._id === record.key);
        if (from < 0 || to < 0) return;
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        const next = current.map((m, i) => i === modIdx ? { ...m, lessons: list } : m);
        setLocalModules(next);
        void commitLessonOrder(next, localUncategorized ?? []);
      } else {
        const current = localUncategorized ?? [];
        const from = current.findIndex(l => l._id === dragInfo.key);
        const to = current.findIndex(l => l._id === record.key);
        if (from < 0 || to < 0) return;
        const next = [...current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setLocalUncategorized(next);
        void commitLessonOrder(localModules ?? [], next);
      }
    }
    setDragInfo(null);
    setDragOverKey(null);
  };

  const rowDragProps = (record: any) => {
    if (record.rowType !== 'module' && record.rowType !== 'lesson') return {};
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragInfo({ key: record.key, groupId: record.groupId ?? null, rowType: record.rowType });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', record.key);
      },
      onDragOver: (e: React.DragEvent) => {
        if (!dragInfo || dragInfo.key === record.key) return;
        if (dragInfo.rowType !== record.rowType) return;
        if (dragInfo.rowType === 'lesson' && dragInfo.groupId !== record.groupId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverKey !== record.key) setDragOverKey(record.key);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        handleDrop(record);
      },
      onDragEnd: () => {
        setDragInfo(null);
        setDragOverKey(null);
      },
      style: { cursor: 'grab' },
    };
  };

  // ── Video upload handler ─────
  const handleVideoUpload = (form: any) => (url: string, meta?: { duration?: number }) => {
    form.setFieldValue('videoUri', url);
    if (meta?.duration) {
      form.setFieldValue('duration', secondsToMinutes(meta.duration));
    }
  };

  // ── Resource helpers ────────────────────────────
  const openAddResource = (mode: LessonFormMode, index?: number) => {
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

  const handleRemoveResource = (mode: LessonFormMode, index: number) => {
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
        module: values.module && values.module !== '__none__' ? values.module : null,
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
        module: values.module && values.module !== '__none__' ? values.module : null,
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

  // ── Module CRUD handlers ────────────────────────────
  const handleCreateModule = async () => {
    const title = newModuleTitle.trim();
    if (!title) return;
    if (!courseId) return;
    try {
      await createModule({ title, course: courseId }).unwrap();
      message.success('Module created!');
      setNewModuleTitle('');
      refetchModules();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create module');
    }
  };

  const startEditModule = (module: AdminModule) => {
    setEditingModuleId(module._id);
    setEditingModuleTitle(module.title);
  };

  const handleSaveModule = async () => {
    const title = editingModuleTitle.trim();
    if (!editingModuleId || !title) return;
    try {
      await updateModule({ moduleId: editingModuleId, data: { title } }).unwrap();
      message.success('Module updated!');
      setEditingModuleId(null);
      refetchModules();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      setDeletingModuleId(moduleId);
      await deleteModule(moduleId).unwrap();
      message.success('Module deleted. Its lessons moved to Uncategorized.');
      refetchModules();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete module');
    } finally {
      setDeletingModuleId(null);
    }
  };

  const openEditModal = (lesson: AdminLesson) => {
    setEditingLesson(lesson);
    setEditResources(lesson.resources || []);
    const moduleId = getLessonModuleId(lesson);
    editForm.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      videoUri: lesson.videoUri,
      module: moduleId || '__none__',
      order: lesson.order,
      duration: lesson.duration,
      isPreview: lesson.isPreview,
      isPublished: lesson.isPublished,
      material: lesson.material?.join(', '),
    });
    setEditModalOpen(true);
  };

  // Rename a module straight from the table row action.
  const handleRenameModule = (record: any) => {
    startEditModule({
      _id: record.moduleId,
      title: record.title,
      course: courseId as string,
      order: record.order ?? 0,
    });
    setModuleModalOpen(true);
  };

  const openCreateModal = () => setCreateModalOpen(true);
  const openModuleManager = () => {
    setEditingModuleId(null);
    setModuleModalOpen(true);
  };

  // ── Statistics ──────────────────────────────────
  const stats = useMemo(() => {
    const total = lessons.length;
    const published = lessons.filter(l => l.isPublished).length;
    const draft = total - published;
    const totalResources = lessons.reduce((acc, l) => acc + (l.resources?.length || 0) + (l.material?.length || 0), 0);
    return { total, published, draft, totalResources, modules: modules.length };
  }, [lessons, modules]);

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

  // ── Grouped rows: each module is a collapsible row with its lessons ──
  type LessonRow = AdminLesson & { key: string; rowType: 'lesson'; groupId: string | null };
  type ModuleRow = {
    key: string;
    rowType: 'module';
    moduleId: string;
    title: string;
    order?: number;
    children?: LessonRow[];
  };

  const isFiltering = !!searchText || statusFilter !== 'all';
  const groupedData = useMemo(() => {
    const rows: ModuleRow[] = [];
    const sourceModules = localModules ?? [];
    const sourceUncategorized = localUncategorized ?? [];

    const filterLesson = (l: AdminLesson) => {
      const matchSearch = !searchText || l.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && l.isPublished) ||
        (statusFilter === 'draft' && !l.isPublished);
      return matchSearch && matchStatus;
    };

    for (const module of sourceModules) {
      const children = (module.lessons || [])
        .filter(filterLesson)
        .map(l => ({ ...l, key: l._id, rowType: 'lesson' as const, groupId: module._id }));
      // When filtering, drop empty modules to reduce noise.
      if (isFiltering && children.length === 0) continue;
      rows.push({
        key: `module-${module._id}`,
        rowType: 'module',
        moduleId: module._id,
        title: module.title,
        order: module.order,
        children,
      });
    }

    // Lessons created before modules existed (or assigned to none).
    const uncategorized = sourceUncategorized
      .filter(filterLesson)
      .map(l => ({ ...l, key: l._id, rowType: 'lesson' as const, groupId: null }));
    if (uncategorized.length > 0) {
      rows.push({
        key: 'module-uncategorized',
        rowType: 'module',
        moduleId: '',
        title: 'Uncategorized',
        children: uncategorized,
      });
    }
    return rows;
  }, [localModules, localUncategorized, searchText, statusFilter, isFiltering]);

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

  const sharedFormFieldsProps = {
    modules,
    modulesLoading,
    isVideoUploading,
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
              onClick={() => { refetch(); refetchModules(); }}
              className="!rounded-lg !border-emerald-500/30 !text-emerald-400 hover:!border-emerald-500/60 hover:!text-emerald-300"
            >
              Refresh
            </Button>
            <Button
              icon={<FolderAddOutlined />}
              onClick={openModuleManager}
              className="!rounded-lg !border-amber-500/40 !text-amber-400 hover:!border-amber-500/70 hover:!text-amber-300"
            >
              Manage Modules
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600 !shadow-md !shadow-emerald-900/50"
            >
              Add Lesson
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <Divider dashed className="!my-5 !border-emerald-500/20" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="stat-icon bg-amber-500/15 text-amber-400">
              <FolderOpenOutlined />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8F5EC] tracking-tight">{stats.modules}</div>
              <div className="text-xs text-[#7A8A80] font-medium">Modules</div>
            </div>
          </div>
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
          <div className="ml-auto flex items-center gap-4">
            <Text className="text-[#7A8A80] text-xs hidden lg:inline">
              <HolderOutlined className="mr-1.5 text-[#4A564E]" />
              Drag rows to reorder
            </Text>
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
        <LessonTable
          data={groupedData}
          dragInfo={dragInfo}
          dragOverKey={dragOverKey}
          rowDragProps={rowDragProps}
          onRenameModule={handleRenameModule}
          onDeleteModule={handleDeleteModule}
          onEditLesson={openEditModal}
          onDeleteLesson={handleDeleteLesson}
          onManageModules={openModuleManager}
          onCreateLesson={openCreateModal}
        />
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
          <LessonFormFields
            form={createForm}
            mode="create"
            defaultOrder={lessons.length + 1}
            resources={createResources}
            onVideoUpload={handleVideoUpload(createForm)}
            onVideoUploadingChange={setIsVideoUploading}
            onAddResource={openAddResource}
            onRemoveResource={handleRemoveResource}
            {...sharedFormFieldsProps}
          />
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
          <LessonFormFields
            form={editForm}
            mode="edit"
            resources={editResources}
            onVideoUpload={handleVideoUpload(editForm)}
            onVideoUploadingChange={setIsVideoUploading}
            onAddResource={openAddResource}
            onRemoveResource={handleRemoveResource}
            {...sharedFormFieldsProps}
          />
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

      {/* Manage Modules Modal */}
      <ManageModulesModal
        open={moduleModalOpen}
        modules={modules}
        lessons={lessons}
        newModuleTitle={newModuleTitle}
        editingModuleId={editingModuleId}
        editingModuleTitle={editingModuleTitle}
        deletingModuleId={deletingModuleId}
        isCreatingModule={isCreatingModule}
        isUpdatingModule={isUpdatingModule}
        onNewModuleTitleChange={setNewModuleTitle}
        onCreateModule={handleCreateModule}
        onStartEditModule={startEditModule}
        onEditingModuleTitleChange={setEditingModuleTitle}
        onSaveModule={handleSaveModule}
        onCancelEditModule={() => setEditingModuleId(null)}
        onDeleteModule={handleDeleteModule}
        onCancel={() => {
          setModuleModalOpen(false);
          setEditingModuleId(null);
          setNewModuleTitle('');
        }}
      />

      {/* Resource Modal */}
      <ResourceModal
        open={resourceModalOpen}
        editingResourceIndex={editingResourceIndex}
        isFileUploading={isFileUploading}
        form={resourceForm}
        resourceUrl={resourceUrl}
        onCancel={() => {
          setResourceModalOpen(false);
          resourceForm.resetFields();
        }}
        onSave={handleSaveResource}
        onUpload={handleResourceUpload}
        onFileUploadingChange={setIsFileUploading}
      />

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
