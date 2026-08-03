import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SharedProviders, configureApi } from '@my-monorepo/store'
import AuthInitializer from './auth/AuthInitializer'
import router from './router'
import './index.css'

// Point the API client at the backend. Falls back to localhost for local dev.
configureApi({ baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedProviders>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </SharedProviders>
  </StrictMode>,
)
