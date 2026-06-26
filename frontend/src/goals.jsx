import React from 'react'
import ReactDOM from 'react-dom/client'
import GoalsApp from './GoalsApp.jsx'
import './styles.css'
import { initTheme } from './theme.js'

initTheme();

ReactDOM.createRoot(document.getElementById('goals-root')).render(
  <React.StrictMode>
    <GoalsApp />
  </React.StrictMode>,
)
