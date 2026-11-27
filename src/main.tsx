import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// A1: Add "js" class to <html> as the first statement so no-JS visitors see all content
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('js')
}

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
