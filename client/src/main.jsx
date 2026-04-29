import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ThemeProvider as CoreThemeProvider } from './theme/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CoreThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CoreThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
