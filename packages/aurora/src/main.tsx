import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getAurora } from './lib/supabase'
import './styles/aurora.css'

const root = createRoot(document.getElementById('root')!)

// Fail loudly and readably when the environment is not configured, instead of a blank page.
try {
  getAurora()
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  root.render(
    <p className="page-note error" role="alert">
      {e instanceof Error ? e.message : String(e)}
    </p>,
  )
}
