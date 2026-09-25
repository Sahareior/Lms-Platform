import React, { useState } from 'react';
import {
  Table, Card, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm, Alert, Checkbox,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, FilePdfOutlined, EyeOutlined, EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MediaUpload from '../../../reusable/MediaUpload';
import {
  useGetStudyPdfsQuery,
  useCreateStudyPdfMutation,
  useUpdateStudyPdfMutation,
  useDeleteStudyPdfMutation,
  type StudyPdf,
} from '@my-monorepo/store';

const { TextArea } = Input;

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  academic: { label: 'Academic', color: 'blue' },
  job: { label: 'Job', color: 'orange' },
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

const PdfManagement: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const { data, isLoading, error, refetch } = useGetStudyPdfsQuery({ includeUnpublished: true });
  const [createPdf, { isLoading: isCreating }] = useCreateStudyPdfMutation();
  const [updatePdf, { isLoading: isUpdating }] = useUpdateStudyPdfMutation();
  const [deletePdf] = useDeleteStudyPdfMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<StudyPdf | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Keep track of uploaded file data between upload and submit
  const [newFileMeta, setNewFileMeta] = useState<{ url: string; name?: string; size?: number; mime?: string; publicId?: string } | null>(null);
  const [editFileMeta, setEditFileMeta] = useState<{ url: string; name?: string; size?: number; mime?: string; publicId?: string } | null>(null);

  const pdfs = (data?.pdfs ?? []).filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const openCreate = () => {
    setNewFileMeta(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleCreate = async (values: any) => {
    if (!newFileMeta?.url) {
      message.error('Please upload a PDF file first');
      return;
    }
    try {
      await createPdf({
        title: values.title,
        description: values.description,
        category: values.category,
        fileUrl: newFileMeta.url,
        publicId: newFileMeta.publicId,
        fileName: newFileMeta.name ?? null,
        fileSize: newFileMeta.size ?? 0,
        mimeType: newFileMeta.mime ?? 'application/pdf',
        isPublished: values.isPublished ?? true,
      }).unwrap();
      message.success('PDF uploaded successfully!');
      setModalOpen(false);
      form.resetFields();
      setNewFileMeta(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to upload PDF');
    }
  };

  const openEdit = (pdf: StudyPdf) => {
    setEditingPdf(pdf);
    setEditFileMeta(null);
    editForm.setFieldsValue({
      title: pdf.title,
      description: pdf.description,
      category: pdf.category,
      isPublished: pdf.isPublished,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values: any) => {
    if (!editingPdf) return;
    const payload: any = {
      title: values.title,
      description: values.description,
      category: values.category,
      isPublished: values.isPublished,
    };
    // Only touch file fields if a new file was uploaded
    if (editFileMeta?.url) {
      payload.fileUrl = editFileMeta.url;
      payload.publicId = editFileMeta.publicId;
      payload.fileName = editFileMeta.name ?? null;
      payload.fileSize = editFileMeta.size ?? 0;
      payload.mimeType = editFileMeta.mime ?? 'application/pdf';
    }
    try {
      await updatePdf({ id: editingPdf._id, data: payload }).unwrap();
      message.success('PDF updated!');
      setEditModalOpen(false);
      setEditingPdf(null);
      setEditFileMeta(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update PDF');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePdf(id).unwrap();
      message.success('PDF deleted!');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete PDF');
    }
  };

  const togglePublish = async (pdf: StudyPdf) => {
    try {
      await updatePdf({ id: pdf._id, data: { isPublished: !pdf.isPublished } }).unwrap();
      message.success(pdf.isPublished ? 'Unpublished' : 'Published');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update');
    }
  };

  const columns: ColumnsType<StudyPdf> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <Space>
          <FilePdfOutlined style={{ color: '#22C55E' }} />
          <div>
            <div className="font-medium" style={{ color: '#E8F5EC' }}>{title}</div>
            {record.description && (
              <div className="text-xs text-[#9BA8A0]" style={{ maxWidth: 360 }}>
                {record.description.length > 80 ? `${record.description.slice(0, 80)}…` : record.description}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: [
        { text: 'Academic', value: 'academic' },
        { text: 'Job', value: 'job' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (cat: string) => (
        <Tag color={CATEGORY_META[cat]?.color ?? 'default'}>{CATEGORY_META[cat]?.label ?? cat}</Tag>
      ),
    },
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 180,
      render: (name: string, record) => (
        <div className="text-xs text-[#9BA8A0]">
          <a
            href={record.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate block text-[#22C55E] hover:underline font-medium"
            style={{ maxWidth: 180 }}
            title="Click to view/download PDF"
          >
            {name || 'View PDF'}
          </a>
          <div className="text-[#5F6B64]">{formatSize(record.fileSize)}</div>
        </div>
      ),
    },
    {
      title: 'Downloads',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      render: (n: number) => <span className="text-[#9BA8A0]">{n ?? 0}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 110,
      render: (pub: boolean, record) => (
        <Button
          type="text"
          size="small"
          icon={pub ? <EyeOutlined style={{ color: '#22C55E' }} /> : <EyeInvisibleOutlined style={{ color: '#9BA8A0' }} />}
          onClick={() => togglePublish(record)}
        >
          {pub ? 'Published' : 'Draft'}
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this PDF?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'job', label: 'Job' },
  ];

  const formContent = (isEdit: boolean) => (
    <>
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="e.g. HSC Physics 1st Paper Board Questions" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={3} placeholder="Short description of the PDF" />
      </Form.Item>
      <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Select a category' }]}>
        <Select options={categoryOptions} placeholder="Academic or Job" />
      </Form.Item>
      <Form.Item
        label="PDF File"
        required={!isEdit}
        tooltip={isEdit ? 'Upload a new file only if you want to replace the existing one' : undefined}
      >
        {isEdit ? (
          <MediaUpload
            type="file"
            accept=".pdf"
            label="Replace PDF"
            showPreview={false}
            onChange={(url, meta) =>
              setEditFileMeta({ url, name: meta?.name, mime: meta?.mimeType, size: undefined, publicId: meta?.publicId })
            }
          />
        ) : (
          <MediaUpload
            type="file"
            accept=".pdf"
            label="Upload PDF"
            showPreview={false}
            onChange={(url, meta) =>
              setNewFileMeta({ url, name: meta?.name, mime: meta?.mimeType, size: undefined, publicId: meta?.publicId })
            }
          />
        )}
      </Form.Item>
      <Form.Item name="isPublished" label="Publish" initialValue={true} valuePropName="checked">
        <Checkbox>Visible to students</Checkbox>
      </Form.Item>
    </>
  );

  return (
    <div className="p-4">
      <Card
        title={
          <Space>
            <FilePdfOutlined />
            <span>Study PDFs</span>
          </Space>
        }
        extra={
          <Space>
            <Input.Search
              placeholder="Search PDFs…"
              allowClear
              onSearch={setSearchText}
              style={{ width: 200 }}
            />
            <Select
              placeholder="All categories"
              allowClear
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 160 }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Upload PDF
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert type="error" message="Failed to load PDFs" showIcon style={{ marginBottom: 16 }} />
        )}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={pdfs}
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} PDFs` }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create modal */}
      <Modal
        title="Upload Study PDF"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setNewFileMeta(null); }}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Upload"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          {formContent(false)}
        </Form>
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Edit PDF"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingPdf(null); setEditFileMeta(null); }}
        onOk={() => editForm.submit()}
        confirmLoading={isUpdating}
        okText="Save"
        width={640}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          {formContent(true)}
        </Form>
      </Modal>
    </div>
  );
};

export default PdfManagement;
