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
import { useGetUploadSignatureMutation, type UploadResponse } from '@my-monorepo/store';

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

// Cloudinary resource type per upload kind. `raw` keeps PDFs/docs/audio intact
// instead of Cloudinary's `auto` detection (which can treat PDFs as images).
const RESOURCE_TYPE: Record<MediaUploadProps['type'], string> = {
  image: 'image',
  video: 'video',
  file: 'raw',
};

/**
 * Uploads a file DIRECTLY from the browser to Cloudinary.
 *
 * Flow:
 *  1. Ask the backend for a one-time signed upload (POST /upload/sign).
 *  2. Stream the file straight to https://api.cloudinary.com/... with those
 *     signed params — the API server never touches the file bytes.
 *
 * Routing the transfer through Express was the source of "Request Timeout"
 * errors: large files buffered in server memory, plus a second server →
 * Cloudinary hop that stalled whenever another upload (e.g. a video) was in
 * flight. Direct uploads remove the server from the transfer entirely, so
 * concurrent uploads and large files work reliably.
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
  const [getSignature, { isLoading: signing }] = useGetUploadSignatureMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = signing || isUploading;

  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setError(null);
    setIsUploading(true);
    onLoadingChange?.(true);
    // Guard against a stalled upload: abort the request so the UI can fail
    // gracefully instead of showing "Uploading…" forever. Videos get a longer
    // allowance than images/files.
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      type === 'video' ? 15 * 60 * 1000 : 5 * 60 * 1000
    );
    try {
      // 1) Get a short-lived signed upload from the backend.
      const { cloud_name, api_key, timestamp, folder, signature } = await getSignature({}).unwrap();

      // 2) Upload the file straight to Cloudinary.
      const resourceType = RESOURCE_TYPE[type];
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`;
      const formData = new FormData();
      formData.append('file', file as File);
      formData.append('api_key', api_key);
      formData.append('timestamp', String(timestamp));
      formData.append('folder', folder);
      formData.append('signature', signature);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      // Parse defensively: a non-JSON body (proxy/network error page) would
      // otherwise surface as a raw "Unexpected token…" SyntaxError.
      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        /* keep {} */
      }
      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || data?.message || 'Upload failed');
      }

      // 3) Normalize Cloudinary's response into the app's UploadResponse shape.
      const result: UploadResponse = {
        message: 'Uploaded successfully',
        url: data.secure_url || data.url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        duration: data.duration,
        name: (file as File).name,
        mimeType: (file as File).type,
      };

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
      const msg = err?.data?.message || err?.message || 'Upload failed. Please try again.';
      setError(msg);
      message.error(msg);
      onError?.(err as Error);
    } finally {
      clearTimeout(timeoutId);
      setIsUploading(false);
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
          // We emit the uploaded URL via onChange only in customRequest after the upload resolves.
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
