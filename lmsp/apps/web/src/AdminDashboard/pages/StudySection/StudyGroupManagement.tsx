import React, { useState } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Space, Popconfirm, Alert, Switch, Checkbox,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, LinkOutlined,
  FacebookOutlined, InstagramOutlined, YoutubeOutlined, PhoneOutlined, SendOutlined, GlobalOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetStudyGroupLinksQuery,
  useCreateStudyGroupLinkMutation,
  useUpdateStudyGroupLinkMutation,
  useDeleteStudyGroupLinkMutation,
  type StudyGroupLink,
  type StudyGroupPlatform,
} from '@my-monorepo/store';

const PLATFORM_META: Record<StudyGroupPlatform, { label: string; color: string; icon: React.ReactNode }> = {
  facebook: { label: 'Facebook', color: '#1877F2', icon: <FacebookOutlined /> },
  instagram: { label: 'Instagram', color: '#E1306C', icon: <InstagramOutlined /> },
  youtube: { label: 'YouTube', color: '#FF0000', icon: <YoutubeOutlined /> },
  whatsapp: { label: 'WhatsApp', color: '#25D366', icon: <PhoneOutlined /> },
  telegram: { label: 'Telegram', color: '#229ED9', icon: <SendOutlined /> },
  other: { label: 'Other', color: '#9BA8A0', icon: <GlobalOutlined /> },
};

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'other', label: 'Other' },
];

const StudyGroupManagement: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetStudyGroupLinksQuery({ includeInactive: true });
  const [createLink, { isLoading: isCreating }] = useCreateStudyGroupLinkMutation();
  const [updateLink, { isLoading: isUpdating }] = useUpdateStudyGroupLinkMutation();
  const [deleteLink] = useDeleteStudyGroupLinkMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<StudyGroupLink | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const links = data?.links ?? [];

  const handleCreate = async (values: any) => {
    try {
      await createLink(values).unwrap();
      message.success('Link added!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to add link');
    }
  };

  const openEdit = (link: StudyGroupLink) => {
    setEditingLink(link);
    editForm.setFieldsValue({
      title: link.title,
      url: link.url,
      platform: link.platform,
      description: link.description,
      order: link.order ?? 0,
      isActive: link.isActive,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values: any) => {
    if (!editingLink) return;
    try {
      await updateLink({ id: editingLink._id, data: values }).unwrap();
      message.success('Link updated!');
      setEditModalOpen(false);
      setEditingLink(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update link');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id).unwrap();
      message.success('Link deleted!');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete link');
    }
  };

  const handleToggleActive = async (link: StudyGroupLink, checked: boolean) => {
    try {
      await updateLink({ id: link._id, data: { isActive: checked } }).unwrap();
      message.success(checked ? 'Link activated' : 'Link hidden');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update link');
    }
  };

  const columns: ColumnsType<StudyGroupLink> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => {
        const meta = PLATFORM_META[record.platform];
        return (
          <Space>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `${meta?.color}22`, color: meta?.color }}
            >
              {meta?.icon ?? <LinkOutlined />}
            </span>
            <div>
              <div className="font-medium" style={{ color: '#E8F5EC' }}>{title}</div>
              <div className="text-xs text-[#9BA8A0] truncate" style={{ maxWidth: 260 }}>{record.url}</div>
              {record.description && (
                <div className="text-xs text-[#5F6B64] truncate" style={{ maxWidth: 260 }}>{record.description}</div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: StudyGroupPlatform) => (
        <Tag color={PLATFORM_META[platform]?.color}>{PLATFORM_META[platform]?.label ?? platform}</Tag>
      ),
      filters: PLATFORM_OPTIONS.map((p) => ({ text: p.label, value: p.value })),
      onFilter: (value, record) => record.platform === value,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (n: number) => <span className="text-[#9BA8A0]">{n ?? 0}</span>,
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (active: boolean, record) => (
        <Switch size="small" checked={active} onChange={(checked) => handleToggleActive(record, checked)} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this link?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
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
            <LinkOutlined />
            <span>Study Group Links</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
              Add Link
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert type="error" message="Failed to load links" showIcon style={{ marginBottom: 16 }} />
        )}
        <Alert
          type="info"
          message="How it shows up for students"
          description="Students see active links (in order) as cards on the Study Group page of the Study Section, with platform icons linking out to Facebook, Instagram, YouTube etc."
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={links}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Create modal */}
      <Modal
        title="Add Study Group Link"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Add"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input placeholder="e.g. Our Facebook Page" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter the URL' }, { type: 'url', message: 'Enter a valid URL' }]}
          >
            <Input placeholder="https://facebook.com/yourpage" />
          </Form.Item>
          <Form.Item name="platform" label="Platform" initialValue="other">
            <Select options={PLATFORM_OPTIONS} placeholder="Pick a platform" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional short description" />
          </Form.Item>
          <Form.Item name="order" label="Display order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" initialValue={true} valuePropName="checked">
            <Checkbox>Visible to students</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Edit Link"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingLink(null); }}
        onOk={() => editForm.submit()}
        confirmLoading={isUpdating}
        okText="Save"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: 'Please enter the URL' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="platform" label="Platform">
            <Select options={PLATFORM_OPTIONS} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="order" label="Display order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Checkbox>Visible to students</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudyGroupManagement;
