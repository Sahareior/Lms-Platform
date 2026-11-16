import { configureApi, configureAiApi, type Theme } from '@my-monorepo/store';

/**
 * API endpoints shared with the web app.
 * Override locally with EXPO_PUBLIC_API_URL / EXPO_PUBLIC_AI_API_URL.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://lms-platform-fjwv.onrender.com/';

export const AI_API_BASE_URL =
  process.env.EXPO_PUBLIC_AI_API_URL || 'https://llm-backend-hfna.onrender.com/';

let configured = false;

export function configureClients() {
  if (configured) return;
  configureApi({ baseUrl: API_BASE_URL });
  configureAiApi({ baseUrl: AI_API_BASE_URL });
  configured = true;
}

export const EXAM_CATEGORIES: { value: 'academic' | 'job_preparation'; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'job_preparation', label: 'Job Preparation' },
];

export type { Theme };
