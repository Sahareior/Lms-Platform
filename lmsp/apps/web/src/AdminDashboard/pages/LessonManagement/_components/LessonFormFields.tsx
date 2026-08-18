import React from 'react';
import {
  Form, Input, InputNumber, Switch, Space, Spin, Tag, Empty, Divider, Select, Button, Badge,
} from 'antd';
import {
  PlusOutlined, LinkOutlined, DeleteOutlined, EditOutlined, FileTextOutlined,
  FolderOpenOutlined, PlayCircleOutlined, LoadingOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { FormInstance } from 'antd';
import MediaUpload from '../../../../reusable/MediaUpload';
import type { AdminModule } from '@my-monorepo/store';
import type { LessonResource, LessonFormMode } from './lessonUtils';

const { TextArea } = Input;

interface LessonFormFieldsProps {
  form: FormInstance;
  mode: LessonFormMode;
  modules: AdminModule[];
  modulesLoading: boolean;
  resources: LessonResource[];
  isVideoUploading: boolean;
  defaultOrder?: number;
  onVideoUpload: (url: string, meta?: { duration?: number }) => void;
  onVideoUploadingChange: (loading: boolean) => void;
  onAddResource: (mode: LessonFormMode, index?: number) => void;
  onRemoveResource: (mode: LessonFormMode, index: number) => void;
}

/**
 * Shared form body for the Create / Edit lesson modals.
 * Keeps the lesson-management page lean by holding all the form JSX
 * (module picker, video upload, toggles, resources) in one place.
 */
const LessonFormFields: React.FC<LessonFormFieldsProps> = ({
  form,
  mode,
  modules,
  modulesLoading,
  resources,
  isVideoUploading,
  defaultOrder,
  onVideoUpload,
  onVideoUploadingChange,
  onAddResource,
  onRemoveResource,
}) => {
  const rawVideoUri = Form.useWatch('videoUri', form);
  const videoUri = typeof rawVideoUri === 'string' ? rawVideoUri : undefined;
  const isRealVideoUrl = !!videoUri && (videoUri.startsWith('http://') || videoUri.startsWith('https://'));
  const duration = Form.useWatch('duration', form);

  return (
    <>
      <Form.Item
        name="module"
        label={<span className="text-[#C9DCCE] font-medium">Module</span>}
        extra={<span className="text-xs text-[#7A8A80]">Group this lesson under a module — click the folder icon next to it in the list to see it grouped.</span>}
      >
        <Select
          placeholder="Select a module (optional)"
          loading={modulesLoading}
          suffixIcon={<FolderOpenOutlined className="text-amber-400" />}
          options={[
            { value: '__none__', label: '— No module (Uncategorized) —' },
            ...modules.map(ch => ({ value: ch._id, label: ch.title })),
          ]}
          onChange={(val) => form.setFieldValue('module', val === '__none__' ? null : val)}
          className="!rounded-lg"
        />
      </Form.Item>

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
          initialValue={mode === 'create' ? defaultOrder : undefined}
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
                  onChange={onVideoUpload}
                  onLoadingChange={onVideoUploadingChange}
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
                  onClick={() => onAddResource(mode, idx)}
                  className="!text-emerald-400 hover:!bg-emerald-500/10"
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveResource(mode, idx)}
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
        onClick={() => onAddResource(mode)}
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

export default LessonFormFields;
