import type { AdminLesson } from '@my-monorepo/store';

export const RESOURCE_TYPES = ['PDF', 'DOC', 'PPT', 'VIDEO', 'AUDIO', 'OTHER'] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface LessonResource {
  name: string;
  url: string;
  type: ResourceType;
}

export type LessonFormMode = 'create' | 'edit';

export type StatusFilter = 'all' | 'published' | 'draft';

// Helpers
export const secondsToMinutes = (s: number) => Math.max(0.1, Math.round((s / 60) * 10) / 10);

export const parseMaterial = (val: string | string[] | undefined): string[] | undefined => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim()).filter(Boolean);
};

// Map an uploaded file's mime type / extension to a resource type.
export const detectResourceType = (mime?: string, fileName?: string): ResourceType => {
  const m = (mime || '').toLowerCase();
  const ext = (fileName || '').toLowerCase().split('.').pop() || '';
  if (m.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'VIDEO';
  if (m.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) return 'AUDIO';
  if (m.includes('pdf') || ext === 'pdf') return 'PDF';
  if (m.includes('word') || m.includes('document') || ['doc', 'docx'].includes(ext)) return 'DOC';
  if (m.includes('presentation') || m.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return 'PPT';
  return 'OTHER';
};

// Resolve a lesson's module id whether the backend returned it as a
// string or as a populated object.
export const getLessonModuleId = (lesson: AdminLesson): string | null => {
  const ch = lesson.module as any;
  if (!ch) return null;
  return typeof ch === 'object' ? ch._id : ch;
};

export const isModuleRow = (record: any): boolean => record?.rowType === 'module';
