import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function TrackerApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Database States
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing States
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editMood, setEditMood] = useState('Calm');
  const [editFocusLevel, setEditFocusLevel] = useState(3);
  const [editHours, setEditHours] = useState(0);

  // Inline Adder States
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newSummary, setNewSummary] = useState('');
  const [newMood, setNewMood] = useState('Calm');
  const [newFocusLevel, setNewFocusLevel] = useState(3);
  const [newHours, setNewHours] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/_/backend/api/tracker');
      if (!response.ok) throw new Error('Failed to load tracker logs database');
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not sync tracker data. Make sure backend service is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newDate) return;

    try {
      const response = await fetch('/_/backend/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          summary: newSummary.trim(),
          mood: newMood,
          focusLevel: Number(newFocusLevel),
          hoursStudied: Number(newHours)
        })
      });

      if (!response.ok) throw new Error('Failed to save study log');

      setNewDate(new Date().toISOString().substring(0, 10));
      setNewSummary('');
      setNewMood('Calm');
      setNewFocusLevel(3);
      setNewHours(0);
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('Error creating log: ' + err.message);
    }
  };

  const handleStartEdit = (log) => {
    setEditingId(log.id);
    setEditDate(log.date);
    setEditSummary(log.summary || '');
    setEditMood(log.mood || 'Calm');
    setEditFocusLevel(log.focusLevel || 3);
    setEditHours(log.hoursStudied || 0);
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`/_/backend/api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          summary: editSummary.trim(),
          mood: editMood,
          focusLevel: Number(editFocusLevel),
          hoursStudied: Number(editHours)
        })
      });

      if (!response.ok) throw new Error('Failed to update study log');

      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Error updating log: ' + err.message);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Delete this study log permanently?')) return;

    try {
      const response = await fetch(`/_/backend/api/tracker/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete log');
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Helper to color mood badges
  const getMoodPillClass = (mood) => {
    switch (mood) {
      case 'Confident':
      case 'Happy': return 'notion-pill-green';
      case 'Calm': return 'notion-pill-blue';
      case 'Stressed': return 'notion-pill-red';
      case 'Sad':
      case 'Tired': return 'notion-pill-grey';
      default: return 'notion-pill-yellow';
    }
  };

  // Aggregate computations
  const totalHours = logs.reduce((sum, item) => sum + (item.hoursStudied || 0), 0);
  const avgFocus = logs.length > 0 
    ? (logs.reduce((sum, item) => sum + (item.focusLevel || 0), 0) / logs.length).toFixed(1)
    : 0;

  return (
    <div className="workspace-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <defs>
                <linearGradient id="logo-grad-track" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-track)" />
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
          <a href="/tracker.html" className="menu-item active">
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
              <span>Back to Home Page</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Main Workspace content */}
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

        <div className="workspace-canvas" style={{ maxWidth: '960px' }}>
          <div className="workspace-icon-wrapper">
            <span className="workspace-emoji">📈</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>Study Logs & Progress Tracker</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.6 }}>
            Track your revision output. Monitor your daily study session hours, focus metrics, and psychological mood notes.
          </p>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Aggregates Dashboard widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px' }}>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Study Log Entries</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{logs.length} entries</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>Cumulative Hours Studied</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--primary)' }}>{totalHours} hrs</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: 600 }}>Average Focus Level</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--success-text)' }}>
                {avgFocus} / 5.0
              </div>
            </div>
          </div>

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📈</span> Progress Hour Logs Table
              </span>
            </div>
            <div className="db-filters-wrapper">
              <button 
                className="notion-filter-pill active" 
                onClick={() => setIsAdding(true)}
                style={{ fontSize: '0.85rem' }}
              >
                ＋ Log Revision Session
              </button>
            </div>
          </div>

          {/* Logs database list table */}
          {loading && logs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Syncing revision log data...</div>
          ) : (
            <div className="notion-db-list">
              {/* Header row */}
              <div className="notion-row" style={{ fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderTop: '1px solid var(--border)' }}>
                <div style={{ width: '30px' }}></div>
                <div style={{ flex: 1.2 }}>Date</div>
                <div style={{ flex: 2.2 }}>Session Summary Note</div>
                <div style={{ flex: 1 }}>Mood Status</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Focus Level</div>
                <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px' }}>Hours Studied</div>
                <div style={{ width: '60px' }}></div>
              </div>

              {/* Data list rows */}
              {logs.map((log) => (
                <div key={log.id} className="notion-row">
                  <div className="drag-handle-mock">
                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>

                  {editingId === log.id ? (
                    /* Editing row inputs */
                    <>
                      <div style={{ flex: 1.2 }}>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="property-text-input"
                          style={{ border: '1px solid var(--border)', fontSize: '0.85rem' }}
                          required
                        />
                      </div>
                      <div style={{ flex: 2.2 }}>
                        <input
                          type="text"
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="property-text-input"
                          style={{ width: '90%', borderBottom: '1px solid var(--primary)', fontSize: '0.85rem' }}
                          placeholder="What did you study?"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select
                          value={editMood}
                          onChange={(e) => setEditMood(e.target.value)}
                          className="property-select-input"
                          style={{ border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        >
                          <option value="Happy">Happy</option>
                          <option value="Calm">Calm</option>
                          <option value="Confident">Confident</option>
                          <option value="Sad">Sad</option>
                          <option value="Stressed">Stressed</option>
                          <option value="Tired">Tired</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <select
                          value={editFocusLevel}
                          onChange={(e) => setEditFocusLevel(Number(e.target.value))}
                          className="property-select-input"
                          style={{ border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        >
                          <option value="1">1 (Poor)</option>
                          <option value="2">2 (Distracted)</option>
                          <option value="3">3 (Fair)</option>
                          <option value="4">4 (Good)</option>
                          <option value="5">5 (Excellent)</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', paddingRight: '15px' }}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editHours}
                          onChange={(e) => setEditHours(Number(e.target.value))}
                          className="property-text-input"
                          style={{ width: '60px', borderBottom: '1px solid var(--primary)', textAlign: 'right', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="notion-row-actions" style={{ opacity: 1, display: 'flex', gap: '4px' }}>
                        <button
                          className="notion-row-btn"
                          onClick={() => handleSaveEdit(log.id)}
                          title="Save log details"
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
                    /* Display Mode */
                    <>
                      <div style={{ flex: 1.2, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(log.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                      </div>
                      <div style={{ flex: 2.2, fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => handleStartEdit(log)} title="Click to edit session details">
                          {log.summary || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No session notes</span>}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className={`notion-pill ${getMoodPillClass(log.mood)}`}>
                          {log.mood || 'Calm'}
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '0.88rem' }}>
                        {'⭐'.repeat(log.focusLevel || 3)}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', paddingRight: '20px', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--primary)' }}>{log.hoursStudied || 0} hrs</span>
                      </div>
                      <div className="notion-row-actions">
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="notion-row-btn"
                            onClick={() => handleStartEdit(log)}
                            title="Edit log"
                          >
                            ✏️
                          </button>
                          <button
                            className="notion-row-btn"
                            onClick={() => handleDeleteLog(log.id)}
                            title="Delete log entry"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Inline revision logger */}
              <div className="notion-row-adder">
                {!isAdding ? (
                  <button className="notion-row-adder-btn" onClick={() => setIsAdding(true)}>
                    ＋ Add a new session study log row
                  </button>
                ) : (
                  <form className="notion-adder-form" onSubmit={handleAddLog} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <input
                      type="date"
                      className="property-text-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px', border: '1px solid var(--border)' }}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />

                    <input
                      className="notion-adder-input"
                      placeholder="Outlined topics reviewed..."
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                      style={{ flex: '1 1 200px' }}
                      required
                    />

                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                    >
                      <option value="Happy">Happy</option>
                      <option value="Calm">Calm</option>
                      <option value="Confident">Confident</option>
                      <option value="Sad">Sad</option>
                      <option value="Stressed">Stressed</option>
                      <option value="Tired">Tired</option>
                    </select>

                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newFocusLevel}
                      onChange={(e) => setNewFocusLevel(Number(e.target.value))}
                    >
                      <option value="1">1 (Poor)</option>
                      <option value="2">2 (Distracted)</option>
                      <option value="3">3 (Fair)</option>
                      <option value="4">4 (Good)</option>
                      <option value="5">5 (Excellent)</option>
                    </select>

                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="property-text-input"
                      placeholder="Hours"
                      style={{ fontSize: '0.85rem', padding: '2px 8px', width: '80px', border: '1px solid var(--border)' }}
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                    />

                    <button type="submit" className="notion-filter-pill active" style={{ fontSize: '0.8rem', padding: '2px 10px' }}>Log</button>
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
