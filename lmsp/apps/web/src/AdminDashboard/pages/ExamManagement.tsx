import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, message, Tag, Space, Spin, Alert, Popconfirm, Empty } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, BranchesOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetAdminExamsQuery,
  useCreateAdminExamMutation,
  useUpdateAdminExamMutation,
  useDeleteAdminExamMutation,
  useGetAdminExamVersionsQuery,
  useCreateAdminExamVersionMutation,
  useUpdateAdminExamVersionMutation,
  useDeleteAdminExamVersionMutation,
  type AdminExam,
  type AdminExamVersion,
  type CreateExamRequest,
  type CreateExamVersionRequest,
} from '@my-monorepo/store';

const { TextArea } = Input;

const ExamManagement: React.FC = () => {
  const { data: exams, isLoading, error, refetch } = useGetAdminExamsQuery();
  const [createExam, { isLoading: isCreating }] = useCreateAdminExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateAdminExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteAdminExamMutation();

  const {
    data: examVersions,
    isLoading: isVersionsLoading,
    refetch: refetchVersions,
  } = useGetAdminExamVersionsQuery();
  const [createExamVersion, { isLoading: isCreatingVersion }] = useCreateAdminExamVersionMutation();
  const [updateExamVersion, { isLoading: isUpdatingVersion }] = useUpdateAdminExamVersionMutation();
  const [deleteExamVersion, { isLoading: isDeletingVersion }] = useDeleteAdminExamVersionMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<AdminExam | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Exam Version State ──────────────────────────────────────
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [selectedExamForVersion, setSelectedExamForVersion] = useState<AdminExam | null>(null);
  const [versionForm] = Form.useForm();
  const [editVersionModalOpen, setEditVersionModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AdminExamVersion | null>(null);
  const [editVersionForm] = Form.useForm();

  const handleEditExam = async (values: any) => {
    if (!editingExam) return;
    try {
      await updateExam({ examId: editingExam._id, data: values }).unwrap();
      message.success('Exam updated successfully!');
      setEditModalOpen(false);
      setEditingExam(null);
      editForm.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update exam');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await deleteExam(examId).unwrap();
      message.success('Exam deleted successfully!');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete exam');
    }
  };

  const openEditModal = (exam: AdminExam) => {
    setEditingExam(exam);
    editForm.setFieldsValue({
      name: exam.name,
      description: exam.description,
      applicants: exam.applicants,
      image: exam.image,
    });
    setEditModalOpen(true);
  };

  const handleCreateExam = async (values: CreateExamRequest) => {
    try {
      await createExam(values).unwrap();
      message.success(`Exam "${values.name}" created successfully!`);
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create exam');
    }
  };

  // ── Exam Version Handlers ──────────────────────────────────
  const openVersionModal = (exam: AdminExam) => {
    setSelectedExamForVersion(exam);
    setVersionModalOpen(true);
  };

  const filteredVersions = examVersions?.filter(
    (v) => v.exam === selectedExamForVersion?._id
  ) ?? [];

  const handleCreateExamVersion = async (values: any) => {
    if (!selectedExamForVersion) return;
    try {
      const payload: CreateExamVersionRequest = {
        exam: selectedExamForVersion._id,
        examVersion: values.examVersion,
      };
      await createExamVersion(payload).unwrap();
      message.success(`Version "${values.examVersion}" created successfully!`);
      versionForm.resetFields();
      refetchVersions();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create exam version');
    }
  };

  const openEditVersionModal = (version: AdminExamVersion) => {
    setEditingVersion(version);
    editVersionForm.setFieldsValue({
      examVersion: version.examVersion,
    });
    setEditVersionModalOpen(true);
  };

  const handleEditVersion = async (values: any) => {
    if (!editingVersion) return;
    try {
      await updateExamVersion({
        versionId: editingVersion._id,
        data: { examVersion: values.examVersion },
      }).unwrap();
      message.success('Version updated successfully!');
      setEditVersionModalOpen(false);
      setEditingVersion(null);
      editVersionForm.resetFields();
      refetchVersions();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update version');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    try {
      await deleteExamVersion(versionId).unwrap();
      message.success('Version deleted successfully!');
      refetchVersions();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete version');
    }
  };

  // ── Version Table Columns ──────────────────────────────────
  const versionColumns: ColumnsType<AdminExamVersion> = [
    {
      title: 'Version Name',
      dataIndex: 'examVersion',
      key: 'examVersion',
      render: (val: string) => (
        <span className="font-medium" style={{ color: '#E8F5EC' }}>
          <BranchesOutlined style={{ marginRight: 6, color: '#22C55E' }} />
          {val}
        </span>
      ),
    },
    {
      title: 'Version ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{id.slice(-8)}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: AdminExamVersion) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditVersionModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this version?"
            description="This will permanently remove the exam version."
            onConfirm={() => handleDeleteVersion(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingVersion}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns: ColumnsType<AdminExam> = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium" style={{ color: '#E8F5EC' }}>{name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc ? (
        <span className="text-sm text-[#9BA8A0]">{desc.length > 60 ? desc.slice(0, 60) + '...' : desc}</span>
      ) : (
        <span className="text-[#5F6B64]">—</span>
      ),
    },
    {
      title: 'Applicants',
      dataIndex: 'applicants',
      key: 'applicants',
      render: (val: string) => <Tag color="blue">{val || '0'}</Tag>,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => img ? (
        <img src={img} alt="exam" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
      ) : (
        <span className="text-[#5F6B64]">—</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AdminExam) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<BranchesOutlined />}
            onClick={() => openVersionModal(record)}
          >
            Versions
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this exam?"
            description="This will permanently remove the exam."
            onConfirm={() => handleDeleteExam(record._id)}
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
        <Spin size="large" tip="Loading exams..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Exams"
        description="There was an error loading the exam list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>Exam Management</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create Exam
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={exams}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} exams`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create Exam Modal */}
      <Modal
        title="Create New Exam"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateExam}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Exam Name"
            rules={[{ required: true, message: 'Please enter the exam name' }]}
          >
            <Input placeholder="e.g. BCS 47th Preliminary" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Brief description of the exam..." />
          </Form.Item>

          <Form.Item name="applicants" label="Applicants Count">
            <Input placeholder="e.g. 10,000+" />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="https://example.com/exam-image.jpg" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Exam
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        title="Edit Exam"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingExam(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditExam}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Exam Name"
            rules={[{ required: true, message: 'Please enter the exam name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="applicants" label="Applicants Count">
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="https://example.com/exam-image.jpg" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setEditModalOpen(false); setEditingExam(null); editForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Exam
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Exam Versions Modal ─────────────────────────────────── */}
      <Modal
        title={
          <span>
            <BranchesOutlined style={{ marginRight: 8, color: '#22C55E' }} />
            Exam Versions — <strong>{selectedExamForVersion?.name}</strong>
          </span>
        }
        open={versionModalOpen}
        onCancel={() => {
          setVersionModalOpen(false);
          setSelectedExamForVersion(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-[#9BA8A0]">
            {filteredVersions.length} version{filteredVersions.length !== 1 ? 's' : ''} found
          </span>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetchVersions} size="small">
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => versionForm.resetFields()}
            >
              Add Version
            </Button>
          </Space>
        </div>

        {isVersionsLoading ? (
          <div className="flex justify-center py-12">
            <Spin tip="Loading versions..." />
          </div>
        ) : filteredVersions.length === 0 ? (
          <Empty
            description={
              <span className="text-[#5F6B64]">
                No versions yet for this exam.
                <br />
                Use the form below to add one.
              </span>
            }
          />
        ) : (
          <Table
            columns={versionColumns}
            dataSource={filteredVersions}
            rowKey="_id"
            pagination={false}
            size="small"
            style={{ marginBottom: 24 }}
          />
        )}

        <div
          style={{
            borderTop: '1px solid #1A1A1A',
            paddingTop: 20,
            marginTop: filteredVersions.length === 0 ? 0 : 8,
          }}
        >
          <h4 className="font-medium mb-3" style={{ color: '#E8F5EC' }}>
            <PlusOutlined style={{ marginRight: 6, fontSize: 12 }} />
            Add New Version
          </h4>
          <Form
            form={versionForm}
            layout="inline"
            onFinish={handleCreateExamVersion}
          >
            <Form.Item
              name="examVersion"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please enter a version name' }]}
            >
              <Input placeholder="e.g. 2024 Prelim, 2024 Written..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isCreatingVersion}>
                Create Version
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* ── Edit Version Modal ─────────────────────────────────── */}
      <Modal
        title="Edit Exam Version"
        open={editVersionModalOpen}
        onCancel={() => {
          setEditVersionModalOpen(false);
          setEditingVersion(null);
          editVersionForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editVersionForm}
          layout="vertical"
          onFinish={handleEditVersion}
          className="mt-4"
        >
          <Form.Item
            name="examVersion"
            label="Version Name"
            rules={[{ required: true, message: 'Please enter the version name' }]}
          >
            <Input placeholder="e.g. 2024 Prelim" />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setEditVersionModalOpen(false);
                  setEditingVersion(null);
                  editVersionForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isUpdatingVersion}>
                Update Version
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement;
