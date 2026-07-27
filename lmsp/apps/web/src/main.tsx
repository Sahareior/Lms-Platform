import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SharedProviders } from '@my-monorepo/store'
import router from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SharedProviders>
      <RouterProvider router={router} />
    </SharedProviders>
  </StrictMode>,
)
