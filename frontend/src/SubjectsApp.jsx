import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function SubjectsApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Database States
  const [subjects, setSubjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing states
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Inline adder states
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState('Not Started');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects
      const subjectsResponse = await fetch('/_/backend/api/subjects');
      if (!subjectsResponse.ok) throw new Error('Failed to load subjects database');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      // Fetch todos to show linked tasks metrics
      const todosResponse = await fetch('/_/backend/api/todos');
      if (!todosResponse.ok) throw new Error('Failed to load tasks data');
      const todosData = await todosResponse.json();
      setTodos(todosData);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not sync workspace. Make sure backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const response = await fetch('/_/backend/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          status: newStatus
        })
      });

      if (!response.ok) throw new Error('Failed to save subject');

      setNewName('');
      setNewStatus('Not Started');
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('Error creating subject: ' + err.message);
    }
  };

  const handleStartEdit = (sub) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditStatus(sub.status);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/_/backend/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update subject');

      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Error updating subject: ' + err.message);
    }
  };

  const handleUpdateStatusDirectly = async (sub, statusValue) => {
    try {
      const response = await fetch(`/_/backend/api/subjects/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sub.name,
          status: statusValue
        })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    // Check if there are linked tasks
    const hasTasks = todos.some(t => t.subjectId === id);
    let msg = 'Are you sure you want to delete this subject?';
    if (hasTasks) {
      msg = 'Warning: This subject contains linked tasks in the database. Deleting the subject will orphan those tasks. Proceed anyway?';
    }
    if (!window.confirm(msg)) return;

    try {
      const response = await fetch(`/_/backend/api/subjects/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete subject');
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Helper to color statuses
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'notion-pill-green';
      case 'In Progress': return 'notion-pill-blue';
      default: return 'notion-pill-grey';
    }
  };

  return (
    <div className="workspace-wrapper">
      {/* Collapsible Left Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <defs>
                <linearGradient id="logo-grad-sub" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-sub)" />
              <path d="M9.5 12l1.5 1.5 3.5-3.5" stroke="var(--bg-sidebar)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span>Study Planner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button className="sidebar-toggle-btn" onClick={toggleTheme} title="Toggle theme mode">
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
          <a href="/dashboard.html" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">🏠</span>
              <span>Home Dashboard</span>
            </div>
          </a>
          <a href="/subjects.html" className="menu-item active">
            <div className="menu-item-left">
              <span className="menu-item-icon">🎓</span>
              <span>Subjects</span>
            </div>
          </a>
          <a href="/notes.html" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">📝</span>
              <span>Notes</span>
            </div>
          </a>
          <a href="/exams.html" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">📅</span>
              <span>Exam Preparation</span>
            </div>
          </a>
          <a href="/tracker.html" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">📈</span>
              <span>Progress Tracker</span>
            </div>
          </a>
          <a href="/goals.html" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">🎯</span>
              <span>Goals</span>
            </div>
          </a>

          <div className="menu-section-label">External</div>
          <a href="/" className="menu-item">
            <div className="menu-item-left">
              <span className="menu-item-icon">🌐</span>
              <span>Landing Page</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className={`workspace-content ${sidebarCollapsed ? 'full-width' : ''}`}>
        <div className="workspace-cover"></div>

        {sidebarCollapsed && (
          <button className="menu-trigger-btn" onClick={() => setSidebarCollapsed(false)} title="Expand sidebar">
            <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
            Sidebar
          </button>
        )}

        <div className="workspace-canvas">
          <div className="workspace-icon-wrapper">
            <span className="workspace-emoji">🎓</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>Subjects Database</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.6 }}>
            Track learning statuses across academic modules and link notes or exam structures to individual subjects.
          </p>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Quick Metrics Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px' }}>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Subjects</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{subjects.length}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>In Progress</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--primary)' }}>
                {subjects.filter(s => s.status === 'In Progress').length}
              </div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: 600 }}>Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--success-text)' }}>
                {subjects.filter(s => s.status === 'Completed').length}
              </div>
            </div>
          </div>

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📂</span> List Database Table
              </span>
            </div>
            <div className="db-filters-wrapper">
              <button 
                className="notion-filter-pill active" 
                onClick={() => setIsAdding(true)}
                style={{ fontSize: '0.85rem' }}
              >
                ＋ Add Subject
              </button>
            </div>
          </div>

          {/* Database list table */}
          {loading && subjects.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Retrieving subjects workspace...</div>
          ) : (
            <div className="notion-db-list">
              {/* Header Titles Row */}
              <div className="notion-row" style={{ fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderTop: '1px solid var(--border)' }}>
                <div style={{ width: '30px' }}></div>
                <div style={{ flex: 2 }}>Subject Name</div>
                <div style={{ flex: 1 }}>Status Property</div>
                <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px' }}>Linked Tasks</div>
                <div style={{ width: '60px' }}></div>
              </div>

              {/* Rows */}
              {subjects.map((sub) => {
                const subTodos = todos.filter(t => t.subjectId === sub.id);
                const activeTodosCount = subTodos.filter(t => !t.completed).length;
                const completedTodosCount = subTodos.filter(t => t.completed).length;

                return (
                  <div key={sub.id} className="notion-row">
                    <div className="drag-handle-mock">
                      <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>

                    {editingId === sub.id ? (
                      /* Editing mode inputs */
                      <>
                        <div style={{ flex: 2 }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="property-text-input"
                            style={{ width: '90%', borderBottom: '1px solid var(--primary)', padding: '2px 4px' }}
                            placeholder="e.g. Science"
                            autoFocus
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="property-select-input"
                            style={{ padding: '2px 6px', border: '1px solid var(--border)' }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px', color: 'var(--text-muted)' }}>
                          -
                        </div>
                        <div className="notion-row-actions" style={{ opacity: 1, display: 'flex', gap: '4px' }}>
                          <button
                            className="notion-row-btn"
                            onClick={() => handleSaveEdit(sub.id)}
                            title="Save subject block"
                            style={{ color: 'var(--success-text)' }}
                          >
                            💾
                          </button>
                          <button
                            className="notion-row-btn"
                            onClick={() => setEditingId(null)}
                            title="Cancel edits"
                            style={{ color: 'var(--danger-text)' }}
                          >
                            ❌
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Standard row display */
                      <>
                        <div style={{ flex: 2, fontWeight: 500 }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => handleStartEdit(sub)} title="Click to rename subject">
                            {sub.name}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <select
                            value={sub.status}
                            onChange={(e) => handleUpdateStatusDirectly(sub, e.target.value)}
                            className={`notion-pill ${getStatusClass(sub.status)}`}
                            style={{ 
                              border: 'none', 
                              cursor: 'pointer', 
                              fontWeight: 500,
                              outline: 'none',
                              fontSize: '0.78rem'
                            }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {activeTodosCount > 0 ? (
                            <span style={{ color: 'var(--warning-text)' }}>{activeTodosCount} active</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>0 active</span>
                          )}
                          {completedTodosCount > 0 && (
                            <span style={{ color: 'var(--success-text)', marginLeft: '6px' }}>({completedTodosCount} done)</span>
                          )}
                        </div>
                        <div className="notion-row-actions">
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="notion-row-btn"
                              onClick={() => handleStartEdit(sub)}
                              title="Edit name"
                            >
                              ✏️
                            </button>
                            <button
                              className="notion-row-btn"
                              onClick={() => handleDeleteSubject(sub.id)}
                              title="Delete subject"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Inline creator */}
              <div className="notion-row-adder">
                {!isAdding ? (
                  <button className="notion-row-adder-btn" onClick={() => setIsAdding(true)}>
                    ＋ Add a new subject row
                  </button>
                ) : (
                  <form className="notion-adder-form" onSubmit={handleAddSubject}>
                    <input
                      className="notion-adder-input"
                      placeholder="Enter subject name... (Press Enter to save)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    
                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button type="submit" style={{ display: 'none' }}></button>
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
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
