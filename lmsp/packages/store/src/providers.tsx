import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from './contexts/ThemeContext';

interface SharedProvidersProps {
  children: React.ReactNode;
}

/**
 * SharedProviders composes all global state providers so each app
 * (web and mobile) only needs a single wrapper.
 *
 * Order matters: ReduxProvider should be outermost since it's the
 * most foundational layer of state.
 */
export function SharedProviders({ children }: SharedProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  );
}
