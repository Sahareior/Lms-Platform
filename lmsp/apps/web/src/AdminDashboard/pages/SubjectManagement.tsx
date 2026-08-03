import React, { useState } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, Select, message, Tag, Space, Spin, Alert, Popconfirm,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, BookOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetAdminSubjectsQuery,
  useCreateAdminSubjectMutation,
  useUpdateAdminSubjectMutation,
  useDeleteAdminSubjectMutation,
  useGetAdminExamsQuery,
  type AdminSubject,
  type AdminExam,
  type CreateSubjectRequest,
} from '@my-monorepo/store';

const SubjectManagement: React.FC = () => {
  const { data: subjects, isLoading, error, refetch } = useGetAdminSubjectsQuery();
  const { data: exams } = useGetAdminExamsQuery();
  const [createSubject, { isLoading: isCreating }] = useCreateAdminSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateAdminSubjectMutation();
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteAdminSubjectMutation();

  // Filter / search state
  const [filterExamId, setFilterExamId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Derived Data ─────────────────────────────────────────
  const examMap = new Map<string, AdminExam>();
  exams?.forEach((e) => examMap.set(e._id, e));

  const filteredSubjects = (subjects ?? []).filter((s) => {
    const examId = typeof s.exam === 'string' ? s.exam : s.exam?._id;
    if (filterExamId && examId !== filterExamId) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesCode = s.code?.toLowerCase().includes(q);
      const examName = typeof s.exam === 'object' ? s.exam?.name?.toLowerCase() : '';
      return matchesName || matchesCode || examName.includes(q);
    }
    return true;
  });

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = async (values: CreateSubjectRequest) => {
    try {
      await createSubject(values).unwrap();
      message.success(`Subject "${values.name}" created!`);
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create subject');
    }
  };

  const openEdit = (subject: AdminSubject) => {
    setEditingSubject(subject);
    const examId = typeof subject.exam === 'string' ? subject.exam : subject.exam?._id;
    editForm.setFieldsValue({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      exam: examId,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values: any) => {
    if (!editingSubject) return;
    try {
      await updateSubject({ subjectId: editingSubject._id, data: values }).unwrap();
      message.success('Subject updated!');
      setEditModalOpen(false);
      setEditingSubject(null);
      editForm.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update subject');
    }
  };

  const handleDelete = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId).unwrap();
      message.success('Subject deleted!');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete subject');
    }
  };

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<AdminSubject> = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium" style={{ color: '#E8F5EC' }}>
          <BookOutlined style={{ marginRight: 6, color: '#22C55E' }} />
          {name}
        </span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => code ? <Tag>{code}</Tag> : <span className="text-[#5F6B64]">—</span>,
    },
    {
      title: 'Exam',
      dataIndex: 'exam',
      key: 'exam',
      width: 200,
      render: (exam: { _id: string; name: string } | string) => {
        const name = typeof exam === 'object' ? exam?.name : examMap.get(exam)?.name;
        return name ? <Tag color="blue">{name}</Tag> : <span className="text-[#5F6B64]">—</span>;
      },
      filters: exams?.map((e) => ({ text: e.name, value: e._id })),
      onFilter: (value, record) => {
        const examId = typeof record.exam === 'string' ? record.exam : record.exam?._id;
        return examId === value;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc ? (
        <span className="text-sm text-[#9BA8A0]">{desc.length > 70 ? desc.slice(0, 70) + '...' : desc}</span>
      ) : (
        <span className="text-[#5F6B64]">—</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: AdminSubject) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this subject?"
            description="This will permanently remove the subject."
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

  // ── Render ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading subjects..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Subjects"
        description="There was an error loading the subject list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>Subject Management</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create Subject
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 8, padding: '12px 16px' }}>
        <Space wrap>
          <Select
            allowClear
            showSearch
            placeholder="Filter by exam"
            style={{ width: 240 }}
            value={filterExamId}
            onChange={(val) => setFilterExamId(val)}
            optionFilterProp="label"
            options={exams?.map((e) => ({ label: e.name, value: e._id })) ?? []}
          />
          <Input
            placeholder="Search subjects..."
            allowClear
            style={{ width: 240 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredSubjects}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} subjects`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* ── Create Modal ─────────────────────────────────────── */}
      <Modal
        title="Create New Subject"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item
            name="exam"
            label="Exam"
            rules={[{ required: true, message: 'Please select an exam' }]}
          >
            <Select
              showSearch
              placeholder="Select an exam"
              optionFilterProp="label"
              options={exams?.map((e) => ({ label: e.name, value: e._id })) ?? []}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter the subject name' }]}
          >
            <Input placeholder="e.g. Physics, Bangla, Mathematics..." />
          </Form.Item>

          <Form.Item name="code" label="Subject Code (optional)">
            <Input placeholder="e.g. PHY-101, BAN-201" />
          </Form.Item>

          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={3} placeholder="Brief description of the subject..." />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Subject
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <Modal
        title="Edit Subject"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingSubject(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          className="mt-4"
        >
          <Form.Item
            name="exam"
            label="Exam"
            rules={[{ required: true, message: 'Please select an exam' }]}
          >
            <Select
              showSearch
              placeholder="Select an exam"
              optionFilterProp="label"
              disabled // exam shouldn't change after creation
              options={exams?.map((e) => ({ label: e.name, value: e._id })) ?? []}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: 'Please enter the subject name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="code" label="Subject Code (optional)">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingSubject(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Subject
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectManagement;
