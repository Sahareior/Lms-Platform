import { api } from './baseApi';

// ─── Response Types ─────────────────────────────────────────
export interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
  name?: string;
  mimeType?: string;
}

// Signed upload params issued by the backend. The browser uses these to POST
// the file directly to api.cloudinary.com (bypassing the API server entirely
// for the large file transfer).
export interface UploadSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
}

// ─── Injected Endpoints ─────────────────────────────────────
// Media uploads: the frontend sends the raw file, the backend streams
// it to Cloudinary and returns the secure URL.
const uploadApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/upload/image', method: 'POST', body: formData };
      },
    }),

    uploadVideo: build.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/upload/video', method: 'POST', body: formData };
      },
    }),

    uploadFile: build.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/upload/file', method: 'POST', body: formData };
      },
    }),

    getUploadSignature: build.mutation<UploadSignature, { folder?: string }>({
      query: (body) => ({
        url: '/upload/sign',
        method: 'POST',
        body: body ?? {},
      }),
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useUploadImageMutation,
  useUploadVideoMutation,
  useUploadFileMutation,
  useGetUploadSignatureMutation,
} = uploadApi;
