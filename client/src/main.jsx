import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import './index.css'
import App from './App.jsx'

let theme = createTheme({
  typography: {
    fontFamily: "'Segoe Ui', Arial, sans-serif",
    h3: {
      fontWeight: "bold",
    },
  },
});
theme = responsiveFontSizes(theme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
        <App />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
