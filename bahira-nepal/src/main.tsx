import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: no third-party request, no layout shift waiting on Google Fonts.
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/figtree/wght.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
