import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SharedProviders, configureApi } from '@my-monorepo/store'
import AuthInitializer from './auth/AuthInitializer'
import router from './router'
import './index.css'

// Point the API client at the backend. Falls back to localhost for local dev.
configureApi({ baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/' })

// Suspense boundary for the lazy-loaded route chunks.
function PageFallback() {
  return (
    <div className="min-h-dvh bg-[#0B0D12] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2F80ED] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedProviders>
      <AuthInitializer>
        <Suspense fallback={<PageFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthInitializer>
    </SharedProviders>
  </StrictMode>,
)
