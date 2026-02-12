import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "katex/dist/katex.min.css";
import { applyThemeVariables } from './theme';
import App from './App.jsx'

applyThemeVariables();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
