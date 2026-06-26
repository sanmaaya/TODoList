import React from 'react'
import ReactDOM from 'react-dom/client'
import ExamsApp from './ExamsApp.jsx'
import './styles.css'
import { initTheme } from './theme.js'

initTheme();

ReactDOM.createRoot(document.getElementById('exams-root')).render(
  <React.StrictMode>
    <ExamsApp />
  </React.StrictMode>,
)
