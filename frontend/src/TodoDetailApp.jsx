import React, { useState, useEffect } from 'react';

export default function TodoDetailApp() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Get Todo ID from URL query parameters
  const getTodoId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  };

  const todoId = getTodoId();

  // Fetch Todo item details
  const fetchTodo = async () => {
    if (!todoId) {
      setError('Task ID parameter is missing. Please select a todo from the dashboard.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${todoId}`);
      
      if (response.status === 404) {
        throw new Error('Todo item not found in database');
      } else if (!response.ok) {
        throw new Error('Failed to retrieve task details');
      }

      const data = await response.json();
      setTodo(data);
      
      // Initialize edit fields
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority);
      setCategory(data.category);
      setDueDate(data.dueDate || '');
      setTags(data.tags || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, [todoId]);

  // Handle Quick Complete Toggle
  const handleToggleComplete = async () => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle completion status');
      }

      const updated = await response.json();
      setTodo(updated);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Save changes from Edit Form
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,
          dueDate: dueDate || null,
          tags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task details');
      }

      const updated = await response.json();
      setTodo(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  // Delete Todo
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Navigate back to list dashboard
      window.location.href = '/';
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Tag helper controls
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

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const categoriesList = ['Personal', 'Work', 'Shopping', 'Health', 'General', 'Design'];

  // Formatting dates helper
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <a href="/" className="back-link">
        <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px', fill: 'currentColor'}}>
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Dashboard
      </a>

      {/* Main Container */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Retrieving task details...
        </div>
      ) : error ? (
        <div className="glass-card error-card animate-fade-in">
          <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <h2>Task Error</h2>
          <p>{error}</p>
          <a href="/" className="btn btn-primary">Return to Dashboard</a>
        </div>
      ) : isEditing ? (
        /* Edit Mode Form View */
        <div className="glass-card edit-form-card animate-fade-in">
          <h2 style={{ marginBottom: '30px', fontSize: '1.6rem' }}>Edit Task</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                className="input-control"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="input-control"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
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
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            <div className="edit-actions-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Details View */
        <div className="glass-card animate-fade-in">
          {/* Header Row */}
          <div className="detail-header-row">
            <div>
              <h2 className="detail-title">{todo.title}</h2>
              <div className="detail-meta-list">
                <span className={`badge ${todo.completed ? 'badge-priority-Low' : 'badge-priority-High'}`} style={{ backgroundColor: todo.completed ? 'var(--success-glow)' : 'var(--danger-glow)', color: todo.completed ? 'var(--success)' : 'var(--danger)', borderColor: todo.completed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)' }}>
                  {todo.completed ? 'Completed' : 'Pending'}
                </span>
                
                <span className={`badge badge-priority-${todo.priority}`}>
                  {todo.priority} Priority
                </span>

                <span className="badge badge-category">
                  {todo.category}
                </span>

                {todo.tags && todo.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {todo.tags.map((tag, idx) => (
                      <span key={idx} style={{fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '50px'}}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Toggle Done button in Header */}
            <button
              onClick={handleToggleComplete}
              className={`btn ${todo.completed ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              {todo.completed ? 'Reopen Task' : 'Mark Completed'}
            </button>
          </div>

          {/* Description Section */}
          <div className="detail-description-section">
            <h3 className="description-title">Description</h3>
            {todo.description ? (
              <p className="description-text">{todo.description}</p>
            ) : (
              <p className="description-text" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                No description provided for this task.
              </p>
            )}
          </div>

          {/* Timeline Metadata */}
          <div className="detail-timeline" style={{ marginBottom: '35px' }}>
            <div className="timeline-row">
              <span>Due Date</span>
              <span className="timeline-val">
                {todo.dueDate ? (
                  <span style={{ color: !todo.completed && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? 'var(--danger)' : 'inherit' }}>
                    {new Date(todo.dueDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {!todo.completed && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? ' (Overdue)' : ''}
                  </span>
                ) : 'No due date set'}
              </span>
            </div>
            <div className="timeline-row">
              <span>Date Created</span>
              <span className="timeline-val">{formatDate(todo.createdAt)}</span>
            </div>
            <div className="timeline-row">
              <span>Last Modified</span>
              <span className="timeline-val">{formatDate(todo.updatedAt)}</span>
            </div>
          </div>

          {/* Main action triggers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Edit Task Details
            </button>

            <button className="btn btn-danger" onClick={handleDelete}>
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
