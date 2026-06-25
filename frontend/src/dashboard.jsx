import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardApp from './DashboardApp.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('dashboard-root')).render(
  <React.StrictMode>
    <DashboardApp />
  </React.StrictMode>,
)
