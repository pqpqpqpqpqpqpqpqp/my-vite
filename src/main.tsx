import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { APIProvider } from '@vis.gl/react-google-maps'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <AuthProvider>
          <App />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </APIProvider>
    </BrowserRouter>
  </StrictMode>
)
