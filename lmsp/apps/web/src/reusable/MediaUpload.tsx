import React, { useState } from 'react';
import { Upload, Button, message, Typography } from 'antd';
import {
  LoadingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  VideoCameraAddOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useUploadImageMutation, useUploadVideoMutation } from '@my-monorepo/store';

const { Text } = Typography;

interface MediaUploadProps {
  type: 'image' | 'video';
  value?: string;
  onChange?: (url: string, meta?: { duration?: number }) => void;
  label?: string;
  accept?: string;
  showPreview?: boolean;
}

/**
 * Uploads a file through the backend /upload/* proxy to Cloudinary.
 * Emits the returned secure URL through `onChange`.
 */
const MediaUpload: React.FC<MediaUploadProps> = ({ type, value, onChange, label, accept, showPreview = true }) => {
  const [uploadImage, { isLoading: imageLoading }] = useUploadImageMutation();
  const [uploadVideo, { isLoading: videoLoading }] = useUploadVideoMutation();
  const [error, setError] = useState<string | null>(null);

  const isLoading = type === 'image' ? imageLoading : videoLoading;

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setError(null);
    try {
      const result =
        type === 'image'
          ? await uploadImage(file as File).unwrap()
          : await uploadVideo(file as File).unwrap();
      // Pass upload metadata (e.g. video duration in seconds) so callers can
      // auto-fill fields like the lesson duration without a second request.
      onChange?.(result.url, { duration: result.duration });
      message.success(type === 'image' ? 'Image uploaded successfully' : 'Video uploaded successfully');
      onSuccess?.(result);
    } catch (err: any) {
      const msg = err?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
      message.error(msg);
      onError?.(err as Error);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Upload
        accept={accept || (type === 'image' ? 'image/*' : 'video/*')}
        showUploadList={false}
        customRequest={customRequest}
      >
        <Button
          icon={
            isLoading ? (
              <LoadingOutlined spin />
            ) : type === 'image' ? (
              <PictureOutlined />
            ) : (
              <VideoCameraAddOutlined />
            )
          }
          loading={isLoading}
        >
          {isLoading
            ? 'Uploading…'
            : label || (type === 'image' ? 'Upload Image' : 'Upload Video')}
        </Button>
      </Upload>

      {value && !error && (
        <span className="inline-flex items-center gap-1.5">
          <CheckCircleFilled style={{ color: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {type === 'image' ? 'Image ready' : 'Video ready'}
          </Text>
        </span>
      )}
      {error && (
        <span className="inline-flex items-center gap-1.5">
          <CloseCircleFilled style={{ color: '#ff4d4f' }} />
          <Text type="danger" style={{ fontSize: 12 }}>
            {error}
          </Text>
        </span>
      )}

      {/* ── Preview after successful upload / when a value exists ── */}
      {showPreview && value && !error && (
        <div className="w-full mt-2">
          {type === 'video' ? (
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
          ) : (
            <img
              src={value}
              alt="Uploaded preview"
              style={{
                maxWidth: 200,
                maxHeight: 120,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
