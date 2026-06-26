import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function GoalsApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Database States
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing States
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Short Term');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDueDate, setEditDueDate] = useState('');

  // Creation States
  const [addingType, setAddingType] = useState(null); // 'Short Term' or 'Long Term' or null
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/_/backend/api/goals');
      if (!response.ok) throw new Error('Failed to load goals');
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve goals data. Make sure backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGoal = async (e, termType) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch('/_/backend/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          type: termType,
          priority: newPriority,
          dueDate: newDueDate || ''
        })
      });

      if (!response.ok) throw new Error('Failed to save goal card');

      setNewTitle('');
      setNewPriority('Medium');
      setNewDueDate('');
      setAddingType(null);
      fetchData();
    } catch (err) {
      alert('Error creating goal: ' + err.message);
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      const response = await fetch(`/_/backend/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !goal.completed })
      });
      if (!response.ok) throw new Error('Failed to toggle completion status');
      fetchData();
    } catch (err) {
      alert('Error toggling goal: ' + err.message);
    }
  };

  const handleStartEdit = (goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditType(goal.type);
    setEditPriority(goal.priority);
    setEditDueDate(goal.dueDate || '');
  };

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/_/backend/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          type: editType,
          priority: editPriority,
          dueDate: editDueDate
        })
      });

      if (!response.ok) throw new Error('Failed to save goal changes');

      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Error saving goal changes: ' + err.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal permanently?')) return;

    try {
      const response = await fetch(`/_/backend/api/goals/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete goal');
      fetchData();
    } catch (err) {
      alert('Error deleting goal: ' + err.message);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'notion-pill-red';
      case 'Medium': return 'notion-pill-yellow';
      default: return 'notion-pill-green';
    }
  };

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    return priorityFilter === 'all' || goal.priority === priorityFilter;
  });

  const shortTermGoals = filteredGoals.filter(g => g.type === 'Short Term');
  const longTermGoals = filteredGoals.filter(g => g.type === 'Long Term');

  return (
    <div className="workspace-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <defs>
                <linearGradient id="logo-grad-goals" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-goals)" />
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
          <a href="/subjects.html" className="menu-item">
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
          <a href="/goals.html" className="menu-item active">
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

      {/* Main Panel Content */}
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

        <div className="workspace-canvas" style={{ maxWidth: '1000px' }}>
          <div className="workspace-icon-wrapper">
            <span className="workspace-emoji">🎯</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>Target Goals</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.6 }}>
            Organize academic milestones. Balance short-term objectives (e.g. assignments, schedules) and long-term career aspirations.
          </p>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Core metrics badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px' }}>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Milestones</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{goals.length}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--warning-text)', fontWeight: 600 }}>In Progress</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--warning-text)' }}>
                {goals.filter(g => !g.completed).length}
              </div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: 600 }}>Achieved / Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--success-text)' }}>
                {goals.filter(g => g.completed).length} ({goals.length > 0 ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 0}%)
              </div>
            </div>
          </div>

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📋</span> Kanban Columns Board
              </span>
            </div>

            <div className="db-filters-wrapper">
              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Double Kanban Board Columns */}
          {loading && goals.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Syncing targets...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
              
              {/* Column 1: Short Term Goals */}
              <div style={{ background: 'var(--bg-sidebar)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> Short-Term Targets
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-active)', padding: '2px 8px', borderRadius: '50px', color: 'var(--text-secondary)' }}>
                    {shortTermGoals.length}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {shortTermGoals.map(goal => renderGoalCard(goal))}
                  
                  {addingType === 'Short Term' ? (
                    renderAdderForm('Short Term')
                  ) : (
                    <button 
                      onClick={() => setAddingType('Short Term')} 
                      style={{ border: '1px dashed var(--border)', background: 'transparent', width: '100%', padding: '10px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.target.style.borderColor = 'var(--border)'}
                    >
                      ＋ Add a short term target
                    </button>
                  )}
                </div>
              </div>

              {/* Column 2: Long Term Goals */}
              <div style={{ background: 'var(--bg-sidebar)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏔️</span> Long-Term Visions
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-active)', padding: '2px 8px', borderRadius: '50px', color: 'var(--text-secondary)' }}>
                    {longTermGoals.length}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {longTermGoals.map(goal => renderGoalCard(goal))}

                  {addingType === 'Long Term' ? (
                    renderAdderForm('Long Term')
                  ) : (
                    <button 
                      onClick={() => setAddingType('Long Term')} 
                      style={{ border: '1px dashed var(--border)', background: 'transparent', width: '100%', padding: '10px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.target.style.borderColor = 'var(--border)'}
                    >
                      ＋ Add a long term target
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );

  // Render individual Goal Card
  function renderGoalCard(goal) {
    const isEditing = editingId === goal.id;
    return (
      <div 
        key={goal.id} 
        style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'relative'
        }}
      >
        {isEditing ? (
          /* Editing Goal Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="property-text-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', borderBottom: '1px solid var(--primary)', fontSize: '0.88rem' }}
              required
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="property-select-input"
                style={{ fontSize: '0.78rem', border: '1px solid var(--border)', padding: '2px 4px' }}
              >
                <option value="Short Term">Short Term</option>
                <option value="Long Term">Long Term</option>
              </select>

              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="property-select-input"
                style={{ fontSize: '0.78rem', border: '1px solid var(--border)', padding: '2px 4px' }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="property-text-input"
                style={{ fontSize: '0.78rem', border: '1px solid var(--border)', padding: '2px 4px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '5px' }}>
              <button 
                onClick={() => handleSaveEdit(goal.id)} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--success-text)' }}
              >
                Save
              </button>
              <button 
                onClick={() => setEditingId(null)} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger-text)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Normal Goal Card display */
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {/* Completed checkbox */}
              <div
                className={`notion-check-box ${goal.completed ? 'checked' : ''}`}
                onClick={() => handleToggleComplete(goal)}
                style={{ marginTop: '2px' }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <span 
                  onClick={() => handleStartEdit(goal)}
                  style={{ 
                    fontSize: '0.88rem', 
                    fontWeight: 500, 
                    cursor: 'pointer',
                    color: goal.completed ? 'var(--text-secondary)' : 'var(--text-main)',
                    textDecoration: goal.completed ? 'line-through' : 'none'
                  }}
                  title="Click to edit goal properties"
                >
                  {goal.title}
                </span>
              </div>
            </div>

            {/* Properties row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className={`notion-pill ${getPriorityClass(goal.priority)}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  {goal.priority}
                </span>
                
                {goal.dueDate && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    📅 {new Date(goal.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleStartEdit(goal)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem' }}
                  title="Edit details"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}
                  title="Delete target"
                  onMouseEnter={(e) => e.target.style.color = '#ff7369'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  🗑️
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Render Inline creation card
  function renderAdderForm(termType) {
    return (
      <form 
        onSubmit={(e) => handleAddGoal(e, termType)}
        style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <input
          type="text"
          className="property-text-input"
          placeholder="Goal description/milestone..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ width: '100%', fontSize: '0.85rem' }}
          required
          autoFocus
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="property-select-input"
            style={{ fontSize: '0.78rem', border: '1px solid var(--border)', padding: '2px 4px' }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="property-text-input"
            style={{ fontSize: '0.78rem', border: '1px solid var(--border)', padding: '2px 4px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '5px' }}>
          <button type="submit" className="notion-filter-pill active" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
            Add Target
          </button>
          <button 
            type="button" 
            onClick={() => setAddingType(null)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }
}
