import React, { useState, useEffect, useRef } from 'react';

export default function TodoDetailApp() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notion document properties states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Status message for auto-saving
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Error'
  const autoSaveTimerRef = useRef(null);

  // Parse Todo ID from query
  const getTodoId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  };
  const todoId = getTodoId();

  // Fetch task properties
  const fetchTodo = async () => {
    if (!todoId) {
      setError('Task ID parameter is missing. Navigate to the dashboard to select a task.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${todoId}`);
      if (response.status === 404) {
        throw new Error('This page does not exist in the database.');
      } else if (!response.ok) {
        throw new Error('Failed to retrieve workspace properties.');
      }

      const data = await response.json();
      setTodo(data);
      
      // Seed fields
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority);
      setCategory(data.category);
      setDueDate(data.dueDate || '');
      setCompleted(data.completed);
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

  // Trigger Save Updates to Backend
  const saveUpdates = async (updatedFields = {}) => {
    if (!todoId) return;
    setSaveStatus('Saving...');
    
    // Combine current state with any immediate field overrides passed
    const requestBody = {
      title: updatedFields.title !== undefined ? updatedFields.title : title,
      description: updatedFields.description !== undefined ? updatedFields.description : description,
      priority: updatedFields.priority !== undefined ? updatedFields.priority : priority,
      category: updatedFields.category !== undefined ? updatedFields.category : category,
      dueDate: (updatedFields.dueDate !== undefined ? updatedFields.dueDate : dueDate) || null,
      completed: updatedFields.completed !== undefined ? updatedFields.completed : completed,
      tags: updatedFields.tags !== undefined ? updatedFields.tags : tags
    };

    if (requestBody.title.trim() === '') {
      setSaveStatus('Error');
      return;
    }

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to sync changes');
      }

      const data = await response.json();
      setTodo(data);
      setSaveStatus('Saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('Error');
    }
  };

  // Debounced auto-save handler for textareas/inputs
  const triggerAutoSaveDebounced = (fieldsUpdate) => {
    setSaveStatus('Saving...');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveUpdates(fieldsUpdate);
    }, 800); // 800ms debounce
  };

  // Immediate save on select dropdown/checkbox toggles
  const handlePropertyChange = (fieldName, value) => {
    if (fieldName === 'title') {
      setTitle(value);
      triggerAutoSaveDebounced({ title: value });
    } else if (fieldName === 'description') {
      setDescription(value);
      triggerAutoSaveDebounced({ description: value });
    } else if (fieldName === 'priority') {
      setPriority(value);
      saveUpdates({ priority: value });
    } else if (fieldName === 'category') {
      setCategory(value);
      triggerAutoSaveDebounced({ category: value });
    } else if (fieldName === 'dueDate') {
      setDueDate(value);
      saveUpdates({ dueDate: value });
    } else if (fieldName === 'completed') {
      setCompleted(value);
      saveUpdates({ completed: value });
    }
  };

  // Tag list helpers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        const nextTags = [...tags, val];
        setTags(nextTags);
        saveUpdates({ tags: nextTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx) => {
    const nextTags = tags.filter((_, i) => i !== idx);
    setTags(nextTags);
    saveUpdates({ tags: nextTags });
  };

  // Row Deletion
  const handleDelete = async () => {
    if (!window.confirm('Delete this database page permanently?')) return;

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      window.location.href = '/dashboard.html';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="workspace-wrapper" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      {/* Cover Image banner */}
      <div className="workspace-cover cover-accent-1">
        {/* Save indicator float */}
        <div style={{ position: 'absolute', top: '15px', right: '20px', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc', border: '1px solid rgba(255,255,255,0.08)' }}>
          {saveStatus === 'Saving...' && '🌀 Saving changes...'}
          {saveStatus === 'Saved' && '☁️ Saved to database'}
          {saveStatus === 'Error' && '⚠️ Save failed'}
        </div>
      </div>

      <div className="workspace-canvas" style={{ maxWidth: '780px', padding: '0 30px 60px 30px' }}>
        
        {/* Back Link */}
        <a href="/dashboard.html" className="back-link" style={{ marginTop: '20px' }}>
          <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Workspace
        </a>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px 0' }}>Loading page block...</div>
        ) : error ? (
          <div className="glass-card error-card animate-fade-in" style={{ marginTop: '30px', background: 'transparent', borderColor: 'var(--border)' }}>
            <svg viewBox="0 0 24 24" style={{ fill: '#ff7369' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <h2>Page Block Missing</h2>
            <p>{error}</p>
            <a href="/dashboard.html" className="btn btn-secondary">Return to Workspace</a>
          </div>
        ) : (
          <div>
            {/* Float page Emoji */}
            <div className="workspace-icon-wrapper">
              <span className="workspace-emoji">📄</span>
            </div>

            {/* Editable Title */}
            <input
              className="workspace-title-input"
              value={title}
              onChange={(e) => handlePropertyChange('title', e.target.value)}
              placeholder="Untitled Document"
            />

            {/* Notion Database Properties Table */}
            <div className="notion-properties-table">
              {/* Completed Status Property */}
              <div className="properties-table-row">
                <div className="property-label-cell">
                  <span>✅</span> Completed
                </div>
                <div className="property-value-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      className={`notion-check-box ${completed ? 'checked' : ''}`}
                      onClick={() => handlePropertyChange('completed', !completed)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: completed ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                      {completed ? 'Archived / Done' : 'Active / Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Select Property */}
              <div className="properties-table-row">
                <div className="property-label-cell">
                  <span>🔺</span> Priority
                </div>
                <div className="property-value-cell">
                  <select
                    className="property-select-input"
                    value={priority}
                    onChange={(e) => handlePropertyChange('priority', e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Category Property */}
              <div className="properties-table-row">
                <div className="property-label-cell">
                  <span>👤</span> Category
                </div>
                <div className="property-value-cell">
                  <input
                    type="text"
                    className="property-text-input"
                    placeholder="e.g. Work, Personal"
                    value={category}
                    onChange={(e) => handlePropertyChange('category', e.target.value)}
                  />
                </div>
              </div>

              {/* Due Date Property */}
              <div className="properties-table-row">
                <div className="property-label-cell">
                  <span>📅</span> Due Date
                </div>
                <div className="property-value-cell">
                  <input
                    type="date"
                    className="property-text-input"
                    value={dueDate}
                    onChange={(e) => handlePropertyChange('dueDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Tags Multi-select Property */}
              <div className="properties-table-row">
                <div className="property-label-cell">
                  <span>🏷️</span> Tags
                </div>
                <div className="property-value-cell">
                  <div className="tags-input-container" style={{ background: 'transparent', padding: '2px', border: 'none' }}>
                    {tags.map((tag, idx) => (
                      <span key={idx} className="tag-pill" style={{ background: 'rgba(82,156,202,0.15)', color: 'var(--primary)', borderColor: 'rgba(82,156,202,0.3)' }}>
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(idx)} style={{ color: 'var(--primary)' }}>&times;</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "＋ Add tag..." : ""}
                      style={{ fontSize: '0.9rem', width: '120px', padding: '4px' }}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editor block divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', margin: '20px 0' }}></div>

            {/* Notes/Page Description editor */}
            <textarea
              className="notion-editor-textarea"
              placeholder="Press enter to start typing page details / notes block..."
              value={description}
              onChange={(e) => handlePropertyChange('description', e.target.value)}
            />

            {/* Page Delete actions */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-danger"
                style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleDelete}
              >
                <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Delete Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
