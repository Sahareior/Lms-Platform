import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@my-monorepo/store';
import LandingPage from '../LandingPage/LandingPage';

/**
 * Home route guard: the landing page is public, but a user who already has a
 * session is bounced straight into the app at /dashboard.
 *
 * The user slice starts with `isLoading: true` while AuthInitializer restores
 * the session from localStorage, so we show a spinner until that settles to
 * avoid flashing the landing page at signed-in users (or redirecting guests
 * before auth has finished resolving).
 */
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  // Session still restoring – hold on a spinner.
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#0B0D12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2F80ED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged in → straight into the app.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Guest → public landing page.
  return <LandingPage />;
};

export default HomeRedirect;
