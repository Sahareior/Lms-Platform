import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AiPerformanceResponse } from '../api/aiApi';
import type { AiHistoryItem, AiReportSnapshot } from '../api/userPerformanceApi';

// ─── State ──────────────────────────────────────────────────
// Reports are keyed by scope so different views never clobber each other:
//   'all'     → combined report across every exam the user studies
//   '<examId>' → per-exam report (drill-down on the Performance page)
// The Dashboard always reads scope 'all'; the Performance page reads the
// scope of whichever exam it has selected.
export interface AiReportEntry {
  /** Latest (today's) AI report for this scope */
  report: AiPerformanceResponse | null;
  /** Previous saved report – used to show ▲/▼ progress deltas */
  previous: AiReportSnapshot | null;
  /** true when the report came from the daily cache (no fresh AI call) */
  isCached: boolean;
  /** ISO timestamp of when the current report was generated */
  generatedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AiPerformanceState {
  reports: Record<string, AiReportEntry>;
  /** All saved reports – used for the progress-over-time chart */
  history: AiHistoryItem[] | null;
}

function emptyEntry(): AiReportEntry {
  return {
    report: null,
    previous: null,
    isCached: false,
    generatedAt: null,
    isLoading: false,
    error: null,
  };
}

const initialState: AiPerformanceState = {
  reports: {},
  history: null,
};

// ─── Payload types ──────────────────────────────────────────
export interface SetAiReportPayload {
  /** 'all' for the combined report, or an examId for a single exam */
  scope: string;
  report: AiPerformanceResponse;
  previous: AiReportSnapshot | null;
  isCached: boolean;
  generatedAt: string | null;
}

export interface SetAiReportLoadingPayload {
  scope: string;
  isLoading: boolean;
}

export interface SetAiReportErrorPayload {
  scope: string;
  error: string;
}

export interface ClearCurrentReportPayload {
  scope: string;
}

// ─── Slice ──────────────────────────────────────────────────
const aiPerformanceSlice = createSlice({
  name: 'aiPerformance',
  initialState,
  reducers: {
    setAiReport(state, action: PayloadAction<SetAiReportPayload>) {
      const { scope, ...entry } = action.payload;
      state.reports[scope] = {
        ...entry,
        isLoading: false,
        error: null,
      };
    },
    setAiReportLoading(state, action: PayloadAction<SetAiReportLoadingPayload>) {
      const { scope, isLoading } = action.payload;
      state.reports[scope] = {
        ...(state.reports[scope] ?? emptyEntry()),
        isLoading,
      };
    },
    setAiReportError(state, action: PayloadAction<SetAiReportErrorPayload>) {
      const { scope, error } = action.payload;
      state.reports[scope] = {
        ...(state.reports[scope] ?? emptyEntry()),
        error,
        isLoading: false,
      };
    },
    setAiReportHistory(state, action: PayloadAction<AiHistoryItem[] | null>) {
      state.history = action.payload;
    },
    clearAiReport(state) {
      state.reports = {};
      state.history = null;
    },
    /** Clears only one scope's report – keeps `history` so the Saved Reports
     *  viewer keeps showing past daily reports even when today's report is
     *  empty (e.g. no new quiz submissions yet today). */
    clearCurrentReport(state, action: PayloadAction<ClearCurrentReportPayload>) {
      state.reports[action.payload.scope] = emptyEntry();
    },
  },
});

export const {
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  setAiReportHistory,
  clearAiReport,
  clearCurrentReport,
} = aiPerformanceSlice.actions;
export default aiPerformanceSlice.reducer;
