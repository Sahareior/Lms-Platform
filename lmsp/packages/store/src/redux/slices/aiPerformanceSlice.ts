import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AiPerformanceResponse } from '../api/aiApi';
import type { AiHistoryItem, AiReportSnapshot } from '../api/userPerformanceApi';

// ─── State ──────────────────────────────────────────────────
export interface AiPerformanceState {
  /** Latest (today's) AI report */
  report: AiPerformanceResponse | null;
  /** Previous saved report – used to show ▲/▼ progress deltas */
  previous: AiReportSnapshot | null;
  /** true when the report came from the daily cache (no fresh AI call) */
  isCached: boolean;
  /** ISO timestamp of when the current report was generated */
  generatedAt: string | null;
  /** All saved reports – used for the progress-over-time chart */
  history: AiHistoryItem[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AiPerformanceState = {
  report: null,
  previous: null,
  isCached: false,
  generatedAt: null,
  history: null,
  isLoading: false,
  error: null,
};

// ─── Payload types ──────────────────────────────────────────
export interface SetAiReportPayload {
  report: AiPerformanceResponse;
  previous: AiReportSnapshot | null;
  isCached: boolean;
  generatedAt: string | null;
}

// ─── Slice ──────────────────────────────────────────────────
const aiPerformanceSlice = createSlice({
  name: 'aiPerformance',
  initialState,
  reducers: {
    setAiReport(state, action: PayloadAction<SetAiReportPayload>) {
      state.report = action.payload.report;
      state.previous = action.payload.previous;
      state.isCached = action.payload.isCached;
      state.generatedAt = action.payload.generatedAt;
      state.isLoading = false;
      state.error = null;
    },
    setAiReportLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAiReportError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAiReportHistory(state, action: PayloadAction<AiHistoryItem[] | null>) {
      state.history = action.payload;
    },
    clearAiReport(state) {
      state.report = null;
      state.previous = null;
      state.isCached = false;
      state.generatedAt = null;
      state.history = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  setAiReportHistory,
  clearAiReport,
} = aiPerformanceSlice.actions;
export default aiPerformanceSlice.reducer;
