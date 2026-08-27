import React from 'react';
import {
  Modal, Form, Input, Select, Button, Badge, Divider, Spin,
} from 'antd';
import {
  LinkOutlined, DeleteOutlined, FileTextOutlined, LoadingOutlined,
} from '@ant-design/icons';
import type { FormInstance } from 'antd';
import MediaUpload from '../../../../reusable/MediaUpload';
import { RESOURCE_TYPES } from './lessonUtils';

interface ResourceModalProps {
  open: boolean;
  editingResourceIndex: number | null;
  isFileUploading: boolean;
  form: FormInstance;
  resourceUrl?: string;
  onCancel: () => void;
  onSave: () => void;
  onUpload: (url: string, meta?: { name?: string; mimeType?: string }) => void;
  onFileUploadingChange: (loading: boolean) => void;
}

/**
 * Add / Edit a lesson resource (file upload or URL).
 */
const ResourceModal: React.FC<ResourceModalProps> = ({
  open,
  editingResourceIndex,
  isFileUploading,
  form,
  resourceUrl,
  onCancel,
  onSave,
  onUpload,
  onFileUploadingChange,
}) => {
  const isEditing = editingResourceIndex !== null;
  const isRealUrl = typeof resourceUrl === 'string' && (resourceUrl.startsWith('http://') || resourceUrl.startsWith('https://'));

  return (
    <Modal
      title={
        <span className="font-semibold text-emerald-400">
          {isEditing ? 'Edit Resource' : 'Add Resource'}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText={isEditing ? 'Update' : 'Add'}
      okButtonProps={{
        className: '!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600',
      }}
      cancelButtonProps={{ className: '!rounded-lg' }}
      width={480}
      className="emerald-modal"
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Lecture slides" className="!rounded-lg" />
        </Form.Item>
        <Form.Item
          name="url"
          label={<span className="text-[#C9DCCE] font-medium">File / URL</span>}
          rules={[{ required: true, type: 'url', message: 'Please upload a file or enter a valid URL' }]}
        >
          {!isRealUrl ? (
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
                    onChange={onUpload}
                    onLoadingChange={onFileUploadingChange}
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
                    onChange={(e) => form.setFieldValue('url', e.target.value)}
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
                  onClick={() => form.setFieldValue('url', undefined)}
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
  );
};

export default ResourceModal;
