import React from 'react'
import ReactDOM from 'react-dom/client'
import SubjectsApp from './SubjectsApp.jsx'
import './styles.css'
import { initTheme } from './theme.js'

initTheme();

ReactDOM.createRoot(document.getElementById('subjects-root')).render(
  <React.StrictMode>
    <SubjectsApp />
  </React.StrictMode>,
)
