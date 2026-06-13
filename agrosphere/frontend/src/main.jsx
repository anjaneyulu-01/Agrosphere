import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Instant jump to top before React paints — smooth-scroll class not yet added
document.documentElement.classList.remove('smooth-scroll')
document.documentElement.scrollTop = 0
document.body.scrollTop = 0
window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
