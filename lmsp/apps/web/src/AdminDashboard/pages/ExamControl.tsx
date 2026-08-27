import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Space,
  Spin,
  Alert,
  Tag,
  Popconfirm,
  Statistic,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetScheduleExamsQuery,
  useCreateScheduleExamMutation,
  useUpdateScheduleExamMutation,
  useDeleteScheduleExamMutation,
  type ScheduleExam,
  type CreateScheduleExamRequest,
  type UpdateScheduleExamRequest,
  BANGLADESH_BOARDS,
  type BangladeshBoard,
} from '@my-monorepo/store';

const { TextArea } = Input;
const { Option } = Select;

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  upcoming: { color: 'blue', icon: <SyncOutlined spin={false} />, label: 'Upcoming' },
  active: { color: 'green', icon: <CheckCircleOutlined />, label: 'Active' },
  completed: { color: 'default', icon: <FileTextOutlined />, label: 'Completed' },
  cancelled: { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelled' },
};

const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
};

const ExamControl: React.FC = () => {
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const {
    data: scheduleExams,
    isLoading,
    error,
    refetch,
  } = useGetScheduleExamsQuery();
  const [createExam, { isLoading: isCreating }] = useCreateScheduleExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateScheduleExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteScheduleExamMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingExam, setViewingExam] = useState<ScheduleExam | null>(null);
  const [editingExam, setEditingExam] = useState<ScheduleExam | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Watch exam selection to load versions
  const selectedExamId = Form.useWatch('exam', form);
  const editSelectedExamId = Form.useWatch('exam', editForm);

  const filteredVersions = examVersions?.filter((v) => v.exam === selectedExamId) ?? [];
  const editFilteredVersions = examVersions?.filter((v) => v.exam === editSelectedExamId) ?? [];

  // ── Summary stats ──
  const stats = useMemo(() => {
    if (!scheduleExams) return { total: 0, upcoming: 0, active: 0, completed: 0, cancelled: 0 };
    return {
      total: scheduleExams.length,
      upcoming: scheduleExams.filter((e) => e.status === 'upcoming').length,
      active: scheduleExams.filter((e) => e.status === 'active').length,
      completed: scheduleExams.filter((e) => e.status === 'completed').length,
      cancelled: scheduleExams.filter((e) => e.status === 'cancelled').length,
    };
  }, [scheduleExams]);

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    if (!scheduleExams) return [];
    let data = [...scheduleExams];

    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          (typeof e.exam === 'object' && e.exam?.name?.toLowerCase().includes(lower)) ||
          (typeof e.examVersion === 'object' && e.examVersion?.examVersion?.toLowerCase().includes(lower)) ||
          ((e as any).board && (e as any).board.toLowerCase().includes(lower)),
      );
    }

    if (statusFilter) {
      data = data.filter((e) => e.status === statusFilter);
    }

    return data;
  }, [scheduleExams, searchText, statusFilter]);

  const handleCreate = async (values: any) => {
    try {
      const payload: CreateScheduleExamRequest = {
        exam: values.exam,
        examVersion: values.examVersion,
        board: values.board || undefined,
        title: values.title,
        description: values.description,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        duration: values.duration || 120,
        totalQuestions: values.totalQuestions || 0,
      };
      await createExam(payload).unwrap();
      message.success(`Scheduled exam "${values.title}" created!`);
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create scheduled exam');
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingExam) return;
    try {
      const payload: UpdateScheduleExamRequest = {
        exam: values.exam,
        examVersion: values.examVersion,
        board: values.board || undefined,
        title: values.title,
        description: values.description,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        duration: values.duration,
        totalQuestions: values.totalQuestions,
        status: values.status,
      };
      await updateExam({ examId: editingExam._id, data: payload }).unwrap();
      message.success('Scheduled exam updated!');
      setEditModalOpen(false);
      setEditingExam(null);
      editForm.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update scheduled exam');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      message.success('Scheduled exam deleted!');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete scheduled exam');
    }
  };

  const openEditModal = (exam: ScheduleExam) => {
    setEditingExam(exam);
    const examVal = typeof exam.exam === 'object' ? exam.exam._id : exam.exam;
    const versionVal = typeof exam.examVersion === 'object' ? exam.examVersion._id : exam.examVersion;
    editForm.setFieldsValue({
      exam: examVal,
      examVersion: versionVal,
      board: (exam as any).board || undefined,
      title: exam.title,
      description: exam.description,
      startDate: dayjs(exam.startDate),
      endDate: dayjs(exam.endDate),
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      status: exam.status,
    });
    setEditModalOpen(true);
  };

  const openViewModal = (exam: ScheduleExam) => {
    setViewingExam(exam);
    setViewModalOpen(true);
  };

  const columns: ColumnsType<ScheduleExam> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ScheduleExam) => (
        <div>
          <div className="font-medium" style={{ color: '#E8F5EC' }}>
            {title}
          </div>
          {record.description && (
            <div className="text-xs text-[#5F6B64] truncate max-w-[220px] mt-0.5">
              {record.description}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Exam',
      key: 'exam',
      render: (_: unknown, record: ScheduleExam) => {
        const name = typeof record.exam === 'object' ? record.exam.name : record.exam;
        return <span className="text-sm">{name || '—'}</span>;
      },
    },
    {
      title: 'Version',
      key: 'version',
      render: (_: unknown, record: ScheduleExam) => {
        const v = typeof record.examVersion === 'object' ? record.examVersion.examVersion : record.examVersion;
        return <Tag color="purple">{v || '—'}</Tag>;
      },
    },
    {
      title: 'Board',
      key: 'board',
      render: (_: unknown, record: ScheduleExam) => {
        const b = (record as any).board;
        return b ? (
          <Tag color="orange" className="font-medium">{b}</Tag>
        ) : (
          <span className="text-sm text-[#5F6B64]">—</span>
        );
      },
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_: unknown, record: ScheduleExam) => (
        <div className="text-xs text-[#9BA8A0]">
          <div className="flex items-center gap-1.5">
            <CalendarOutlined className="text-[#5F6B64]" />
            <span>{dayjs(record.startDate).format('DD MMM YYYY, hh:mm A')}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[#5F6B64]">→</span>
            <span>{dayjs(record.endDate).format('DD MMM YYYY, hh:mm A')}</span>
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (mins: number) => (
        <Space size={4}>
          <ClockCircleOutlined className="text-[#5F6B64]" />
          <span className="text-sm">{formatDuration(mins)}</span>
        </Space>
      ),
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      render: (val: number) => <Tag color="cyan">{val || 0}</Tag>,
      sorter: (a, b) => a.totalQuestions - b.totalQuestions,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const cfg = statusConfig[status] || statusConfig.upcoming;
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label?.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Upcoming', value: 'upcoming' },
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: ScheduleExam) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this scheduled exam?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} loading={isDeleting}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for stats */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={{ flex: 1, borderRadius: 12 }} loading />
          ))}
        </div>
        {/* Skeleton for table */}
        <Card style={{ borderRadius: 12 }} loading>
          <div style={{ height: 400 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Scheduled Exams"
        description="There was an error loading the scheduled exam list. Please try again."
        type="error"
        showIcon
        icon={<InfoCircleOutlined />}
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>
            Exam Control
          </h2>
          <p className="text-sm text-[#9BA8A0] mt-1 mb-0">
            Schedule, manage, and track all your mock exams in one place.
          </p>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Schedule Exam
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Total Exams',
            value: stats.total,
            icon: <FileTextOutlined />,
            color: '#22C55E',
            bg: 'rgba(34, 197, 94, 0.1)',
          },
          {
            title: 'Upcoming',
            value: stats.upcoming,
            icon: <SyncOutlined />,
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
          {
            title: 'Active',
            value: stats.active,
            icon: <CheckCircleOutlined />,
            color: '#22C55E',
            bg: 'rgba(34, 197, 94, 0.1)',
          },
          {
            title: 'Completed',
            value: stats.completed,
            icon: <FileTextOutlined />,
            color: '#9BA8A0',
            bg: 'rgba(155, 168, 160, 0.1)',
          },
          {
            title: 'Cancelled',
            value: stats.cancelled,
            icon: <CloseCircleOutlined />,
            color: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
          },
        ].map((stat) => (
          <Card
            key={stat.title}
            style={{
              borderRadius: 12,
              background: '#0B0B0B',
              border: '1px solid #171717',
            }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#5F6B64] uppercase tracking-wider mb-1">{stat.title}</div>
                <div className="text-2xl font-bold" style={{ color: '#E8F5EC' }}>
                  {stat.value}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  fontSize: 18,
                }}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: '12px 16px' }}>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by title, exam, version, or board..."
            prefix={<SearchOutlined className="text-[#5F6B64]" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ flex: 1, minWidth: 260 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 180 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="upcoming">
              <Tag color="blue" style={{ margin: 0 }}>Upcoming</Tag>
            </Option>
            <Option value="active">
              <Tag color="green" style={{ margin: 0 }}>Active</Tag>
            </Option>
            <Option value="completed">
              <Tag style={{ margin: 0 }}>Completed</Tag>
            </Option>
            <Option value="cancelled">
              <Tag color="red" style={{ margin: 0 }}>Cancelled</Tag>
            </Option>
          </Select>
          {(searchText || statusFilter) && (
            <Button
              type="text"
              size="small"
              onClick={() => {
                setSearchText('');
                setStatusFilter(null);
              }}
            >
              Clear filters
            </Button>
          )}
          <div className="text-xs text-[#5F6B64] ml-auto">
            {filteredData.length} of {scheduleExams?.length || 0} exams
          </div>
        </div>
      </Card>

      {/* ── Table ── */}
      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scheduled exams`,
            size: 'default',
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <div className="py-12">
                <FileTextOutlined style={{ fontSize: 48, color: '#232323', marginBottom: 16 }} />
                <div className="text-lg font-medium" style={{ color: '#5F6B64' }}>
                  No scheduled exams found
                </div>
                <div className="text-sm text-[#5F6B64] mt-1">
                  {searchText || statusFilter
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Click "Schedule Exam" to create your first exam.'}
                </div>
                {!searchText && !statusFilter && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                    className="mt-4"
                  >
                    Schedule Exam
                  </Button>
                )}
              </div>
            ),
          }}
        />
      </Card>

      {/* ── View Details Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined />
            <span>Exam Details</span>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => { setViewModalOpen(false); setViewingExam(null); }}
        footer={[
          <Button key="close" onClick={() => { setViewModalOpen(false); setViewingExam(null); }}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (viewingExam) {
                setViewModalOpen(false);
                openEditModal(viewingExam);
              }
            }}
          >
            Edit Exam
          </Button>,
        ]}
        width={600}
      >
        {viewingExam && (
          <div className="mt-4">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Title">
                <span className="font-medium" style={{ color: '#E8F5EC' }}>
                  {viewingExam.title}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Parent Exam">
                {typeof viewingExam.exam === 'object' ? viewingExam.exam.name : viewingExam.exam || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                <Tag color="purple">
                  {typeof viewingExam.examVersion === 'object'
                    ? viewingExam.examVersion.examVersion
                    : viewingExam.examVersion || '—'}
                </Tag>
              </Descriptions.Item>
              {(viewingExam as any).board && (
                <Descriptions.Item label="Board">
                  <Tag color="orange">{(viewingExam as any).board}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Description">
                {viewingExam.description || <span className="text-[#5F6B64]">No description</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                <Space>
                  <CalendarOutlined className="text-[#5F6B64]" />
                  {dayjs(viewingExam.startDate).format('DD MMM YYYY, hh:mm A')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                <Space>
                  <CalendarOutlined className="text-[#5F6B64]" />
                  {dayjs(viewingExam.endDate).format('DD MMM YYYY, hh:mm A')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                <Space>
                  <ClockCircleOutlined className="text-[#5F6B64]" />
                  {formatDuration(viewingExam.duration)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total Questions">
                <Tag color="cyan">{viewingExam.totalQuestions || 0}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {(() => {
                  const cfg = statusConfig[viewingExam.status] || statusConfig.upcoming;
                  return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label?.toUpperCase()}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(viewingExam.createdAt).format('DD MMM YYYY, hh:mm A')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ── Create Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined />
            <span>Schedule New Exam</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <div className="text-xs uppercase tracking-wider text-[#5F6B64] font-medium mb-3 flex items-center gap-1.5">
            <FileTextOutlined /> Basic Information
          </div>

          <Form.Item
            name="title"
            label="Exam Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g. BCS 47th Full Mock Test" />
          </Form.Item>

          <Form.Item name="exam" label="Parent Exam" rules={[{ required: true, message: 'Please select an exam' }]}>
            <Select
              showSearch
              placeholder="Select exam category"
              optionFilterProp="label"
              options={exams?.map((e) => ({ label: e.name, value: e._id }))}
            />
          </Form.Item>

          <Form.Item name="examVersion" label="Exam Version" rules={[{ required: true, message: 'Please select a version' }]}>
            <Select
              showSearch
              placeholder={!selectedExamId ? 'Select a parent exam first' : 'Select version'}
              disabled={!selectedExamId}
              optionFilterProp="label"
              options={filteredVersions.map((v) => ({ label: v.examVersion, value: v._id }))}
            />
          </Form.Item>

          <Form.Item name="board" label="Board">
            <Select
              showSearch
              placeholder="Select a board (optional)"
              optionFilterProp="label"
              allowClear
              options={BANGLADESH_BOARDS.map((b) => ({ label: b, value: b }))}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of the exam..." />
          </Form.Item>

          <div className="text-xs uppercase tracking-wider text-[#5F6B64] font-medium mb-3 mt-6 flex items-center gap-1.5">
            <CalendarOutlined /> Schedule & Settings
          </div>

          <div className="text-xs text-[#9BA8A0] mb-3 flex items-center gap-1.5 bg-[#0F0F0F] rounded-lg px-3 py-2">
            <InfoCircleOutlined className="text-[#22C55E]" />
            Status will auto-calculate based on dates: <strong>Upcoming</strong> → <strong>Active</strong> → <strong>Completed</strong>
          </div>

          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]} style={{ flex: 1 }}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true, message: 'Please select end date' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('startDate');
                    if (!value || !start || value.isAfter(start)) return Promise.resolve();
                    return Promise.reject(new Error('End date must be after start date'));
                  },
                }),
              ]}
              style={{ flex: 1 }}
              dependencies={['startDate']}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="duration" label="Duration (min)" initialValue={120} style={{ width: 160 }}>
              <InputNumber min={1} max={600} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="totalQuestions" label="Total Questions" initialValue={0} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item className="mb-0 flex justify-end mt-4">
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>Schedule Exam</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined />
            <span>Edit Scheduled Exam</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingExam(null); editForm.resetFields(); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="mt-4">
          <div className="text-xs uppercase tracking-wider text-[#5F6B64] font-medium mb-3 flex items-center gap-1.5">
            <FileTextOutlined /> Basic Information
          </div>

          <Form.Item name="title" label="Exam Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="exam" label="Parent Exam" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={exams?.map((e) => ({ label: e.name, value: e._id }))}
            />
          </Form.Item>

          <Form.Item name="examVersion" label="Exam Version" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder={!editSelectedExamId ? 'Select a parent exam first' : 'Select version'}
              disabled={!editSelectedExamId}
              optionFilterProp="label"
              options={editFilteredVersions.map((v) => ({ label: v.examVersion, value: v._id }))}
            />
          </Form.Item>

          <Form.Item name="board" label="Board">
            <Select
              showSearch
              placeholder="Select a board (optional)"
              optionFilterProp="label"
              allowClear
              options={BANGLADESH_BOARDS.map((b) => ({ label: b, value: b }))}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} />
          </Form.Item>

          <div className="text-xs uppercase tracking-wider text-[#5F6B64] font-medium mb-3 mt-6 flex items-center gap-1.5">
            <CalendarOutlined /> Schedule & Settings
          </div>

          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('startDate');
                    if (!value || !start || value.isAfter(start)) return Promise.resolve();
                    return Promise.reject(new Error('End date must be after start date'));
                  },
                }),
              ]}
              style={{ flex: 1 }}
              dependencies={['startDate']}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="duration" label="Duration (min)" style={{ width: 160 }}>
              <InputNumber min={1} max={600} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="totalQuestions" label="Total Questions" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <div className="text-xs uppercase tracking-wider text-[#5F6B64] font-medium mb-3 mt-6 flex items-center gap-1.5">
            <SyncOutlined /> Status Override
          </div>

          <Form.Item
            name="status"
            label="Status (manual override)"
            style={{ width: '100%' }}
            tooltip="Leave empty to auto-calculate from dates. Override only if needed."
          >
            <Select
              options={[
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              allowClear
              placeholder="Auto-calculated from dates"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end mt-4">
            <Space>
              <Button onClick={() => { setEditModalOpen(false); setEditingExam(null); editForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>Update Exam</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamControl;
