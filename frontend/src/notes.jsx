import React from 'react'
import ReactDOM from 'react-dom/client'
import NotesApp from './NotesApp.jsx'
import './styles.css'
import { initTheme } from './theme.js'

initTheme();

ReactDOM.createRoot(document.getElementById('notes-root')).render(
  <React.StrictMode>
    <NotesApp />
  </React.StrictMode>,
)
