import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import type { AppDispatch, AppStore } from './store';

// Re-export the store type for use in components
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RootState = ReturnType<AppStore['getState']>;

// Typed dispatch and selector hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
