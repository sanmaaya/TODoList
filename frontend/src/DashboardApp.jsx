import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function DashboardApp() {
  const [theme, toggleTheme] = useTheme();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Notion Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Inline row adder states
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Workspace metadata (mock Notion page variables)
  const [workspaceTitle, setWorkspaceTitle] = useState('PriorityFlow Task Dashboard');
  const [emoji, setEmoji] = useState('📝');

  // Fetch todos from Express backend API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (priority !== 'all') params.append('priority', priority);
      if (category !== 'all') params.append('category', category);
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/todos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Backend connection error. Make sure the API server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTodos();
    }, 250); // Debounce search changes

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, category, sortBy]);

  // Handle Inline Add Todo (Press Enter)
  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: 'Medium',
          category: category !== 'all' ? category : 'General',
          tags: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to insert todo');
      }

      setNewTitle('');
      setIsAdding(false);
      fetchTodos();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Toggle Completed
  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle completion');
      }

      // Update state locally for instant feedback
      setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Helper: check priority styling class
  const getPriorityPill = (prio) => {
    if (prio === 'High') return 'notion-pill-red';
    if (prio === 'Medium') return 'notion-pill-yellow';
    return 'notion-pill-green';
  };

  // Available categories list
  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'General', 'Design'];

  return (
    <div className="workspace-wrapper">
      {/* Sidebar navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>PriorityFlow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button 
              className="sidebar-toggle-btn" 
              onClick={toggleTheme} 
              title="Toggle theme mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar">
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="menu-section-label">Workspace</div>
          <div className={`menu-item ${status === 'all' && category === 'all' && priority === 'all' ? 'active' : ''}`} onClick={() => { setStatus('all'); setCategory('all'); setPriority('all'); }}>
            <div className="menu-item-left">
              <span className="menu-item-icon">🏠</span>
              <span>Workspace Home</span>
            </div>
          </div>
          <div className={`menu-item ${status === 'active' ? 'active' : ''}`} onClick={() => { setStatus('active'); }}>
            <div className="menu-item-left">
              <span className="menu-item-icon">🎯</span>
              <span>Active Tasks</span>
            </div>
            <span className="menu-item-badge">{todos.filter(t => !t.completed).length}</span>
          </div>
          <div className={`menu-item ${status === 'completed' ? 'active' : ''}`} onClick={() => { setStatus('completed'); }}>
            <div className="menu-item-left">
              <span className="menu-item-icon">🗄️</span>
              <span>Completed Archive</span>
            </div>
          </div>

          <div className="menu-section-label">Categories</div>
          {categories.map((cat, idx) => {
            const emojis = { Personal: '👤', Work: '💼', Shopping: '🛒', Health: '❤️', General: '⭐', Design: '🎨' };
            return (
              <div
                key={cat}
                className={`menu-item ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(category === cat ? 'all' : cat)}
              >
                <div className="menu-item-left">
                  <span className="menu-item-icon">{emojis[cat] || '📁'}</span>
                  <span>{cat}</span>
                </div>
              </div>
            );
          })}

          <div className="menu-section-label">External</div>
          <a href="/" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">🌐</span>
              <span>Landing Page</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Main workspace section */}
      <main className={`workspace-content ${sidebarCollapsed ? 'full-width' : ''}`}>
        {/* Cover Photo */}
        <div className="workspace-cover cover-accent-1"></div>

        {/* Collapsed sidebar trigger indicator */}
        {sidebarCollapsed && (
          <button className="menu-trigger-btn" onClick={() => setSidebarCollapsed(false)} title="Expand sidebar">
            <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
            Sidebar
          </button>
        )}

        {/* Canvas area */}
        <div className="workspace-canvas">
          {/* Emoji Floating wrapper */}
          <div className="workspace-icon-wrapper">
            <span
              className="workspace-emoji"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const emojis = ['📝', '🎯', '💼', '🚀', '⭐', '🍀', '🍎', '🧩'];
                const nextIdx = (emojis.indexOf(emoji) + 1) % emojis.length;
                setEmoji(emojis[nextIdx]);
              }}
              title="Click to switch Emoji"
            >
              {emoji}
            </span>
          </div>

          {/* Editable Document title */}
          <input
            className="workspace-title-input"
            value={workspaceTitle}
            onChange={(e) => setWorkspaceTitle(e.target.value)}
            placeholder="Untitled Workspace"
          />

          {/* Connection error */}
          {error && (
            <div style={{ color: '#ff7369', padding: '10px 15px', border: '1px solid #ff7369', borderRadius: '4px', background: 'rgba(255, 115, 105, 0.1)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Database layout views */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📋</span> Table List View
              </span>
            </div>

            <div className="db-filters-wrapper">
              <input
                type="text"
                placeholder="Search database..."
                className="notion-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Todo List Area */}
          {loading && todos.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>Loading database contents...</div>
          ) : (
            <div className="notion-db-list">
              {todos.map((todo) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) && !todo.completed;
                return (
                  <div
                    key={todo.id}
                    className={`notion-row ${todo.completed ? 'completed' : ''}`}
                  >
                    {/* Drag Mock */}
                    <div className="drag-handle-mock">
                      <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>

                    {/* Square Checkbox */}
                    <div
                      className={`notion-check-box ${todo.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleComplete(todo)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>

                    {/* Title */}
                    <div className="notion-row-title-container">
                      <a href={`/todo.html?id=${todo.id}`} className="notion-row-title-link">
                        {todo.title || 'Untitled page'}
                      </a>
                    </div>

                    {/* Metadata property tags */}
                    <div className="notion-row-properties">
                      <span className={`notion-pill ${getPriorityPill(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      
                      <span className="notion-pill notion-pill-grey">
                        {todo.category}
                      </span>

                      {todo.dueDate && (
                        <span className={`notion-row-date ${isOverdue ? 'overdue' : ''}`}>
                          📅 {new Date(todo.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      )}
                    </div>

                    {/* Quick Row Deletion */}
                    <div className="notion-row-actions">
                      <button
                        className="notion-row-btn"
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="Delete block row"
                      >
                        <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Inline task adder row */}
              <div className="notion-row-adder">
                {!isAdding ? (
                  <button className="notion-row-adder-btn" onClick={() => setIsAdding(true)}>
                    ＋ Add a new page / task row
                  </button>
                ) : (
                  <form className="notion-adder-form" onSubmit={handleInlineSubmit}>
                    <input
                      className="notion-adder-input"
                      placeholder="Title of the task... (Press Enter to save)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                      onBlur={() => {
                        // Delay collapsing form slightly to allow submit click triggers
                        setTimeout(() => {
                          if (newTitle.trim() === '') setIsAdding(false);
                        }, 200);
                      }}
                    />
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
