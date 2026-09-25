import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SharedProviders, configureApi } from '@my-monorepo/store'
import AuthInitializer from './auth/AuthInitializer'
import router from './router'
import './index.css'
// SmoothScroll (Lenis+GSAP) removed: the 60fps rAF loop was causing
// navigation delays on mobile. CSS scroll-behavior: smooth is used instead.
import GamificationToastHost from './gamification/GamificationToast'
import { ThemeProvider, useTheme } from './theme/ThemeContext'
import { NavigationProvider } from './navigation/NavigationContext'
import { Loader2 } from 'lucide-react'

// Point the API client at the backend. Falls back to localhost for local dev.
configureApi({ baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/' })

// Suspense boundary for the lazy-loaded route chunks.
function PageFallback() {
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
          {/* <p className="text-sm font-black font-serif text-[#1a1a1a]">{message}</p> */}
          <p className="text-[16px] text-[#333] font-serif italic">
            Preparing your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0B0D12] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-[#2F80ED]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#00E5B3]/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-[#23262D] bg-[#111318]/90 px-8 py-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="relative">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2F80ED] border-t-transparent" />
          <div className="absolute inset-0 rounded-full bg-[#2F80ED]/30 blur-xl" />
        </div>
        <p className="text-sm font-semibold text-[#F5F7FA]">Loading…</p>
        <p className="text-[11px] text-[#A1A8B3]">Preparing your workspace</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedProviders>
      <AuthInitializer>
        <ThemeProvider>
          <NavigationProvider>
            <Suspense fallback={<PageFallback />}>
              <RouterProvider router={router} />
              {/* App-wide XP / level-up notifications */}
              <GamificationToastHost />
            </Suspense>
          </NavigationProvider>
        </ThemeProvider>
      </AuthInitializer>
    </SharedProviders>
  </StrictMode>,
)
