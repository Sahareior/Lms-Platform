import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Space, Spin, Alert, Tag, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

const statusColors: Record<string, string> = {
  upcoming: 'blue',
  active: 'green',
  completed: 'default',
  cancelled: 'red',
};

const ExamControl: React.FC = () => {
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: scheduleExams, isLoading, error, refetch } = useGetScheduleExamsQuery();
  const [createExam, { isLoading: isCreating }] = useCreateScheduleExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateScheduleExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteScheduleExamMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ScheduleExam | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Watch exam selection to load versions
  const selectedExamId = Form.useWatch('exam', form);
  const editSelectedExamId = Form.useWatch('exam', editForm);

  const filteredVersions = examVersions?.filter((v) => v.exam === selectedExamId) ?? [];
  const editFilteredVersions = examVersions?.filter((v) => v.exam === editSelectedExamId) ?? [];

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

  const columns: ColumnsType<ScheduleExam> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span className="font-medium" style={{ color: '#E8F5EC' }}>{title}</span>,
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
        return b ? <Tag color="orange" className="font-medium">{b}</Tag> : <span className="text-sm text-[#5F6B64]">—</span>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined className="text-[#5F6B64]" />
          <span className="text-sm">{dayjs(date).format('DD MMM YYYY, hh:mm A')}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined className="text-[#5F6B64]" />
          <span className="text-sm">{dayjs(date).format('DD MMM YYYY, hh:mm A')}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (mins: number) => (
        <Space>
          <ClockCircleOutlined className="text-[#5F6B64]" />
          <span className="text-sm">{mins} min</span>
        </Space>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      render: (val: number) => <Tag color="cyan">{val || 0}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: ScheduleExam) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this scheduled exam?"
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
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading scheduled exams..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Scheduled Exams"
        description="There was an error loading the scheduled exam list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>Exam Control</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Schedule Exam
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={scheduleExams}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scheduled exams`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* ── Create Modal ── */}
      <Modal
        title="Schedule New Exam"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="title" label="Exam Title" rules={[{ required: true, message: 'Please enter a title' }]}>
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
            <TextArea rows={2} placeholder="Brief description..." />
          </Form.Item>

          <div className="text-xs text-[#5F6B64] mb-2 flex items-center gap-1.5">
            <CalendarOutlined />
            Status will auto-calculate: <strong>Upcoming</strong> → <strong>Active</strong> → <strong>Completed</strong> based on dates
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

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>Schedule Exam</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        title="Edit Scheduled Exam"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingExam(null); editForm.resetFields(); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="mt-4">
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

          <Form.Item name="status" label="Status (manual override)" style={{ width: '100%' }}>
            <Select
              options={[
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              allowClear
              placeholder="Auto-calculated from dates (override if needed)"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
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
