import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material/styles"

import App from './App.jsx'

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#315c45" },
    secondary: { main: "#b76b4b" },
    background: {
      default: "#f5f3ec",
      paper: "#fffefa",
    },
    text: {
      primary: "#24352b",
      secondary: "#68766d",
    },
  },
  shape: {
    borderRadius: 14,
  },
});

createRoot(document.getElementById('root')).render(
  <ThemeProvider  theme={theme} >
    <StrictMode>
      <CssBaseline />
      <App />
    </StrictMode>
  </ThemeProvider>,
)
