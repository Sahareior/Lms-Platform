import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import courseReducer from './slices/courseSlice';
import uiReducer from './slices/uiSlice';
import { api } from './api/baseApi';
import { aiApi } from './api/aiApi';

/**
 * Creates the Redux store with all reducers and the RTK Query middleware.
 * Each app can safely call this multiple times (e.g. during SSR/HMR).
 */
export function createStore() {
  const store = configureStore({
    reducer: {
      user: userReducer,
      course: courseReducer,
      ui: uiReducer,
      [api.reducerPath]: api.reducer,
      [aiApi.reducerPath]: aiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, aiApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  return store;
}

// Singleton – lazily created on first import
export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
