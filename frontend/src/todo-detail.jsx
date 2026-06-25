import React from 'react'
import ReactDOM from 'react-dom/client'
import TodoDetailApp from './TodoDetailApp.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('todo-root')).render(
  <React.StrictMode>
    <TodoDetailApp />
  </React.StrictMode>,
)
