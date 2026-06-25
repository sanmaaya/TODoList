import React, { useState, useEffect } from 'react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch todos with filters
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
      setError('Could not connect to backend server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial todos and refresh on filter change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTodos();
    }, 300); // 300ms debounce for search input

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, category, sortBy]);

  // Add Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // Create Todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority: taskPriority,
          category: taskCategory,
          dueDate: dueDate || null,
          tags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setTaskPriority('Medium');
      setTaskCategory('Personal');
      setDueDate('');
      setTags([]);
      
      // Reload list
      fetchTodos();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  // Toggle Completion
  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Local state update for immediate feedback
      setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Local state update
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Unique Categories from list for category filter option
  const categoriesList = ['Personal', 'Work', 'Shopping', 'Health', 'General', 'Design'];

  // Stats calculation
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="app-container">
      {/* Dashboard Header */}
      <header>
        <div className="brand-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">PriorityFlow</h1>
            <p className="brand-subtitle">Streamlined multi-page task scheduling</p>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{totalCount - completedCount}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="glass-card error-card animate-fade-in" style={{marginBottom: '30px'}}>
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchTodos}>Try Reconnecting</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Create Task Card */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Create Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                className="input-control"
                placeholder="e.g. Code database routes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="input-control"
                placeholder="Details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="input-control"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="input-control"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                className="input-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (Press Enter/Comma to add)</label>
              <div className="tags-input-container">
                {tags.map((tag, idx) => (
                  <span key={idx} className="tag-pill">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(idx)}>&times;</button>
                  </span>
                ))}
                <input
                  id="tags"
                  type="text"
                  placeholder={tags.length === 0 ? "e.g. dev, express" : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Add Task
            </button>
          </form>
        </div>

        {/* Right Side: Task Listing Dashboard */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                className="input-control search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${status === 'all' ? 'active' : ''}`}
                onClick={() => setStatus('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${status === 'active' ? 'active' : ''}`}
                onClick={() => setStatus('active')}
              >
                Active
              </button>
              <button
                className={`filter-tab ${status === 'completed' ? 'active' : ''}`}
                onClick={() => setStatus('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="filter-dropdowns">
              <select
                className="input-control dropdown-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              <select
                className="input-control dropdown-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: var(--text-muted), fontWeight: 600 }}>SORT BY</label>
              <select
                className="input-control dropdown-select"
                style={{ minWidth: '140px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* List Area */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading tasks...
            </div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24">
                <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
              </svg>
              <h3>No Tasks Found</h3>
              <p>Try refining your filters or create a new task to get started.</p>
            </div>
          ) : (
            <div className="todo-list">
              {todos.map((todo) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) && !todo.completed;
                return (
                  <div
                    key={todo.id}
                    className={`todo-card priority-${todo.priority} ${todo.completed ? 'completed' : ''} animate-fade-in`}
                  >
                    {/* Custom Checkbox */}
                    <div className="todo-checkbox-wrapper">
                      <div
                        className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleComplete(todo)}
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => {}} // Handled by div wrapper
                        />
                        <svg viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                    </div>

                    {/* Todo Content details */}
                    <div className="todo-content">
                      <div className="todo-title-row">
                        <h3 className="todo-title">{todo.title}</h3>
                      </div>
                      
                      {todo.description && (
                        <p className="todo-desc">{todo.description}</p>
                      )}

                      <div className="todo-meta">
                        <span className={`badge badge-priority-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        
                        <span className="badge badge-category">
                          {todo.category}
                        </span>

                        {todo.dueDate && (
                          <span className={`todo-date ${isOverdue ? 'overdue' : ''}`}>
                            <svg viewBox="0 0 24 24">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-5-8h-5v5h5v-5z" />
                            </svg>
                            {isOverdue ? 'Overdue: ' : ''}
                            {new Date(todo.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          </span>
                        )}

                        {todo.tags && todo.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginLeft: '5px' }}>
                            {todo.tags.map((tag, i) => (
                              <span key={i} style={{fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '50px'}}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Todo Action Buttons */}
                    <div className="todo-actions">
                      <a
                        href={`/todo.html?id=${todo.id}`}
                        className="action-btn view-btn"
                        title="View Details & Edit"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      </a>
                      
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="action-btn delete-btn"
                        title="Delete Task"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
