import { getAuthToken } from '@my-monorepo/store';

// Must match the base URL configured in main.tsx.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

/**
 * Downloads a CSV endpoint as a file. Sends the JWT so admin-only
 * export routes authenticate correctly.
 */
export async function downloadCsv(path: string, filename: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.text();
    let message = 'Export failed';
    try {
      message = JSON.parse(body)?.message || message;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
