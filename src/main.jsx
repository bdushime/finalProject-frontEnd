import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import 'leaflet/dist/leaflet.css'

import App from './App.jsx'
import { AuthProvider } from './pages/auth/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeProvider'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
