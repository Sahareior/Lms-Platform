import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector, useGetMeQuery } from '@my-monorepo/store';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';


interface AuthGuardProps {
  /** Optional custom redirect path. Defaults to '/login'. */
  redirectTo?: string;
  /** If true, also requires the user to be an admin. */
  requireAdmin?: boolean;
  /** Children or an Outlet-based layout. Falls back to <Outlet /> if omitted. */
  children?: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────
   Full-screen loading state
───────────────────────────────────────────────────────────── */
const SessionLoading = ({ message = 'Loading your session…' }: { message?: string }) => {
  const { isDark } = useTheme();

  if (!isDark) {
    return (
      <div
        className="min-h-screen bg-[#e8e4db] flex items-center justify-center p-6"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div
          className="flex flex-col items-center gap-3 px-8 py-6 rounded-lg bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a]"
        >
          <Loader2 size={28} className="animate-spin text-[#b91c1c]" />
          <p className="text-sm font-black font-serif text-[#1a1a1a]">{message}</p>
          <p className="text-[11px] text-[#333] font-serif italic">
            Just a moment while we restore your progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[#2F80ED]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#00E5B3]/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-[#111318]/90 border border-[#23262D] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="relative">
          <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
          <div className="absolute inset-0 blur-xl bg-[#2F80ED]/30 rounded-full" />
        </div>
        <p className="text-sm font-semibold text-[#F5F7FA]">{message}</p>
        <p className="text-[11px] text-[#A1A8B3]">
          Just a moment while we restore your progress
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   AuthGuard
───────────────────────────────────────────────────────────── */
const AuthGuard: React.FC<AuthGuardProps> = ({
  redirectTo = '/login',
  requireAdmin = false,
  children,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.user);

  // Fresh user data (with populated selectedExams) for onboarding check.
  const { data: userData, isLoading: isUserLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  /* ── 1. Initial auth restore ───────────────────────────── */
  if (isLoading) {
    return <SessionLoading message="Restoring your session…" />;
  }

  /* ── 2. Not authenticated → redirect ───────────────────── */
  if (!isAuthenticated) {
    // Preserve the attempted URL so we can bounce back after login.
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  /* ── 3. Admin-only routes ──────────────────────────────── */
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  /* ── 4. Wait for fresh /auth/me before onboarding check ── */
  if (isUserLoading) {
    return <SessionLoading message="Loading your profile…" />;
  }

  /* ── 5. First-time onboarding gate ─────────────────────── */
  const isStudent = userData?.role !== 'admin';
  const hasNoExams = !(
    userData?.selectedExams && userData.selectedExams.length > 0
  );

  // Only redirect when the user document actually loaded — this avoids
  // bouncing students to /onboarding on a failed /auth/me request.
  if (
    userData &&
    isStudent &&
    hasNoExams &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  /* ── 6. All good ───────────────────────────────────────── */
  return <>{children ?? <Outlet />}</>;
};

export default AuthGuard;