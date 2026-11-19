import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from "@mui/material/styles"
import { theme } from './theme.js'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme} >
    <StrictMode>
      <CssBaseline />
      <App />
    </StrictMode>
  </ThemeProvider>,
)
