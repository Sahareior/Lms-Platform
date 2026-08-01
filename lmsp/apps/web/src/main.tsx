import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SharedProviders } from '@my-monorepo/store'
import AuthInitializer from './auth/AuthInitializer'
import router from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedProviders>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </SharedProviders>
  </StrictMode>,
)
