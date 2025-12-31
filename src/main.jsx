import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
<<<<<<< HEAD
import { AuthProvider } from './pages/auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
=======
import { ThemeProvider } from './contexts/ThemeProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776
  </StrictMode>,
)


