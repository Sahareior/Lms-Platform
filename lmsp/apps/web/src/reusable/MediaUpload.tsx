import React, { useState } from 'react';
import { Upload, Button, message, Typography, Spin } from 'antd';
import {
  LoadingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  VideoCameraAddOutlined,
  PictureOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useUploadImageMutation, useUploadVideoMutation, useUploadFileMutation, type UploadResponse } from '@my-monorepo/store';

const { Text } = Typography;

interface MediaUploadProps {
  type: 'image' | 'video' | 'file';
  value?: string;
  onChange?: (url: string, meta?: { duration?: number; name?: string; mimeType?: string }) => void;
  onLoadingChange?: (loading: boolean) => void;
  label?: string;
  accept?: string;
  showPreview?: boolean;
}

/**
 * Uploads a file through the backend /upload/* proxy to Cloudinary.
 * Emits the returned secure URL through `onChange`, along with optional
 * metadata (video duration, original file name + mime type) so callers
 * can auto-fill fields without a second request.
 */
const MediaUpload: React.FC<MediaUploadProps> = ({
  type,
  value,
  onChange,
  onLoadingChange,
  label,
  accept,
  showPreview = true,
}) => {
  const [uploadImage, { isLoading: imageLoading }] = useUploadImageMutation();
  const [uploadVideo, { isLoading: videoLoading }] = useUploadVideoMutation();
  const [uploadFile, { isLoading: fileLoading }] = useUploadFileMutation();
  const [error, setError] = useState<string | null>(null);

  const isLoading = type === 'image' ? imageLoading : type === 'video' ? videoLoading : fileLoading;

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setError(null);
    onLoadingChange?.(true);
    try {
      let result: UploadResponse;
      if (type === 'image') {
        result = await uploadImage(file as File).unwrap();
      } else if (type === 'video') {
        result = await uploadVideo(file as File).unwrap();
      } else {
        result = await uploadFile(file as File).unwrap();
      }
      // Pass upload metadata (duration, original name, mime type) so callers
      // can auto-fill fields like the lesson duration or resource type.
      onChange?.(result.url, {
        duration: result.duration,
        name: result.name,
        mimeType: result.mimeType,
      });
      message.success(
        type === 'image' ? 'Image uploaded successfully' :
        type === 'video' ? 'Video uploaded successfully' :
        'File uploaded successfully'
      );
      onSuccess?.(result);
    } catch (err: any) {
      const msg = err?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
      message.error(msg);
      onError?.(err as Error);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Upload
        accept={accept || (type === 'image' ? 'image/*' : type === 'video' ? 'video/*' :
          '.pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.mp3,.wav,.m4a,.aac,.ogg,.mp4,.webm,.mov,.mkv,.zip,.rar')}
        showUploadList={false}
        customRequest={customRequest}
        disabled={isLoading}
        onChange={() => {
          // Suppress Ant Design Upload's native onChange event on file select.
          // We emit the uploaded URL via onChange only in customRequest after server upload resolves.
        }}
      >
        <Button
          icon={
            isLoading ? (
              <LoadingOutlined spin />
            ) : type === 'image' ? (
              <PictureOutlined />
            ) : type === 'video' ? (
              <VideoCameraAddOutlined />
            ) : (
              <FileTextOutlined />
            )
          }
          loading={isLoading}
        >
          {isLoading
            ? 'Uploading…'
            : label || (type === 'image' ? 'Upload Image' : type === 'video' ? 'Upload Video' : 'Upload File')}
        </Button>
      </Upload>

      {isLoading && (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs shadow-sm">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 16, color: '#10B981' }} spin />} />
          <span className="font-medium">
            {type === 'video'
              ? 'Uploading video... Please wait'
              : type === 'image'
              ? 'Uploading image...'
              : 'Uploading file... Please wait'}
          </span>
        </span>
      )}

      {value && !isLoading && !error && (
        <span className="inline-flex items-center gap-1.5">
          <CheckCircleFilled style={{ color: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {type === 'image' ? 'Image ready' : type === 'video' ? 'Video ready' : 'File ready'}
          </Text>
        </span>
      )}
      {error && !isLoading && (
        <span className="inline-flex items-center gap-1.5">
          <CloseCircleFilled style={{ color: '#ff4d4f' }} />
          <Text type="danger" style={{ fontSize: 12 }}>
            {error}
          </Text>
        </span>
      )}

      {/* ── Preview after successful upload / when a value exists ── */}
      {showPreview && value && !error && type === 'file' && (
        <div className="w-full mt-2 inline-flex items-center gap-2 text-xs text-[#9BA8A0]">
          <FileTextOutlined style={{ color: '#52c41a' }} />
          <span className="truncate max-w-[280px] font-mono">{value}</span>
        </div>
      )}
      {showPreview && value && !error && type === 'video' && (
        <div className="w-full mt-2">
          <video
            src={value}
            controls
            preload="metadata"
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 8,
              background: '#000',
            }}
          />
        </div>
      )}
      {showPreview && value && !error && type === 'image' && (
        <div className="w-full mt-2">
          <img
            src={value}
            alt="Uploaded preview"
            style={{
              maxWidth: 200,
              maxHeight: 120,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #232323',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
