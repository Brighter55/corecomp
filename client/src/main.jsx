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
    explanationTopic: {
      fontWeight: "bold",
      fontSize: "1rem",

      [createTheme().breakpoints.up("lg")]: {
        fontSize: "1.5rem",
      },
    },
    explanationText: { // here
      fontSize: ".8rem",
      lineHeight: "1.5rem",
      [createTheme().breakpoints.up("lg")]: {
        fontSize: "1rem",
      },
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
