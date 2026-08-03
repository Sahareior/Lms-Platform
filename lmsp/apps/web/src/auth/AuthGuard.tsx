import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector, useGetMeQuery } from '@my-monorepo/store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  /** Optional custom redirect path. Defaults to '/login'. */
  redirectTo?: string;
  /** If true, also requires the user to be an admin. */
  requireAdmin?: boolean;
  /** Children or an Outlet-based layout. Falls back to <Outlet /> if omitted. */
  children?: React.ReactNode;
}

/**
 * AuthGuard protects routes from unauthenticated access.
 * - Checks `isAuthenticated` from the Redux user slice.
 * - Optionally requires the `admin` role.
 * - Shows a brief loading state while auth is being restored.
 * - Redirects to `/login` (or a custom path) when not authenticated.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  redirectTo = '/login',
  requireAdmin = false,
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.user);
  // Fresh user data (with populated selectedExams) used to decide first-time onboarding
  const { data: userData, isLoading: isUserLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Still determining auth state (e.g. restoring from localStorage)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
          <p className="text-sm font-medium text-[#A1A8B3]">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated – redirect
  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Admin check
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // First-time onboarding: students with no selected exams are sent to /onboarding.
  // Wait for the user document so we don't flash the dashboard before redirecting.
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#2F80ED]" />
          <p className="text-sm font-medium text-[#A1A8B3]">Loading your session...</p>
        </div>
      </div>
    );
  }

  const isStudent = userData?.role !== 'admin';
  const hasNoExams = !(userData?.selectedExams && userData.selectedExams.length > 0);
  // Only redirect when the user document actually loaded (don't bounce users on a failed /auth/me request)
  if (userData && isStudent && hasNoExams && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default AuthGuard;
