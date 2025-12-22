import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import './index.css'
import App from './App.jsx'

let theme = createTheme({
  typography: {
    fontFamily: [
      "'Segoe Ui'",
      "Arial",
      "sans-serif",
    ].join(","),
    h2: {
      fontWeight: "bold",
    },
    h3: {
      fontWeight: "bold",
    },
    h4: {
      fontWeight: "bold",
    },
    h5: {
      fontWeight: "bold",
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: "none",
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          zIndex: 0,
        }
      },
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
