import React from 'react'
import ReactDOM from 'react-dom/client'
import TrackerApp from './TrackerApp.jsx'
import './styles.css'
import { initTheme } from './theme.js'

initTheme();

ReactDOM.createRoot(document.getElementById('tracker-root')).render(
  <React.StrictMode>
    <TrackerApp />
  </React.StrictMode>,
)
