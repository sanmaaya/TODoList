import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './theme.js';

export default function DashboardApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Database States
  const [todos, setTodos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Searches
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [subjectIdFilter, setSubjectIdFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Inline row adder
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');

  // ----------------------------------------------------
  // Sticky Notes State (Persisted in localStorage)
  // ----------------------------------------------------
  const [stickyNotes, setStickyNotes] = useState(() => {
    const saved = localStorage.getItem('study_sticky_notes');
    return saved ? JSON.parse(saved) : "📌 Welcome to your Study Dashboard!\n- Start Pomodoro for intense revision\n- Double check exam schedules in Exam Prep\n- Track your mood and study hours daily";
  });

  useEffect(() => {
    localStorage.setItem('study_sticky_notes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  // ----------------------------------------------------
  // Pomodoro Timer Widget States
  // ----------------------------------------------------
  const [pomoMode, setPomoMode] = useState('Work'); // 'Work' (25m) or 'Break' (5m)
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoActive, setPomoActive] = useState(false);
  const pomoTimerRef = useRef(null);

  useEffect(() => {
    if (pomoActive) {
      pomoTimerRef.current = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          clearInterval(pomoTimerRef.current);
          setPomoActive(false);
          const nextMode = pomoMode === 'Work' ? 'Break' : 'Work';
          setPomoMode(nextMode);
          setPomoMinutes(nextMode === 'Work' ? 25 : 5);
          setPomoSeconds(0);
          alert(`⏰ Pomodoro Alert: ${pomoMode} session completed!`);
        }
      }, 1000);
    } else {
      clearInterval(pomoTimerRef.current);
    }
    return () => clearInterval(pomoTimerRef.current);
  }, [pomoActive, pomoMinutes, pomoSeconds, pomoMode]);

  const handlePomoReset = () => {
    setPomoActive(false);
    setPomoMinutes(pomoMode === 'Work' ? 25 : 5);
    setPomoSeconds(0);
  };

  const handlePomoModeChange = (mode) => {
    setPomoActive(false);
    setPomoMode(mode);
    setPomoMinutes(mode === 'Work' ? 25 : 5);
    setPomoSeconds(0);
  };

  // ----------------------------------------------------
  // Stopwatch Widget States
  // ----------------------------------------------------
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const stopwatchTimerRef = useRef(null);

  useEffect(() => {
    if (stopwatchActive) {
      const startOffset = Date.now() - stopwatchTime;
      stopwatchTimerRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startOffset);
      }, 50);
    } else {
      clearInterval(stopwatchTimerRef.current);
    }
    return () => clearInterval(stopwatchTimerRef.current);
  }, [stopwatchActive]);

  const formatStopwatch = (timeMs) => {
    const totalSecs = Math.floor(timeMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------
  // Database API Requests
  // ----------------------------------------------------
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch subjects for relation mapping
      const subjectsResponse = await fetch('/_/backend/api/subjects');
      if (!subjectsResponse.ok) throw new Error('Failed to load subjects');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      // Fetch filtered todos
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (priority !== 'all') params.append('priority', priority);
      if (subjectIdFilter !== 'all') params.append('subjectId', subjectIdFilter);
      params.append('sortBy', sortBy);

      const todosResponse = await fetch(`/_/backend/api/todos?${params.toString()}`);
      if (!todosResponse.ok) throw new Error('Failed to load tasks database');
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
    const delayDebounceFn = setTimeout(() => {
      fetchDashboardData();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, subjectIdFilter, sortBy]);

  // Quick Todo Adder (Press Enter)
  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch('/_/backend/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: 'Medium',
          category: 'Study',
          subjectId: newSubjectId || null
        })
      });

      if (!response.ok) throw new Error('Failed to write task');
      
      setNewTitle('');
      setNewSubjectId('');
      setIsAdding(false);
      fetchDashboardData();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  // Toggle Done Checkbox
  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/_/backend/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) throw new Error('Failed to update checkbox');
      
      // Update state locally for immediate response
      setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      alert('Error toggling checkmark: ' + err.message);
    }
  };

  // Delete task row
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task block?')) return;

    try {
      const response = await fetch(`/_/backend/api/todos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete row');
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
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
                <linearGradient id="logo-grad-dash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-dash)" />
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
          <a href="/dashboard.html" className="menu-item active">
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

      {/* Main Panel Content */}
      <main className={`workspace-content ${sidebarCollapsed ? 'full-width' : ''}`}>
        {/* Cover Photo banner */}
        <div className="workspace-cover cover-accent-1"></div>

        {/* Collapsed sidebar trigger */}
        {sidebarCollapsed && (
          <button className="menu-trigger-btn" onClick={() => setSidebarCollapsed(false)} title="Expand sidebar">
            <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
            Sidebar
          </button>
        )}

        <div className="workspace-canvas">
          {/* Page Emoji */}
          <div className="workspace-icon-wrapper">
            <span className="workspace-emoji">🎓</span>
          </div>

          {/* Title Header */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-main)' }}>STUDY PLANNER</h1>

          {/* Welcome Message */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>Welcome back, John 👋</span>
            <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>"Go the extra mile. It's never crowded."</span>
          </div>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* 3-Column Widgets Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
            
            {/* Widget 1: Quick Links Navigation */}
            <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-sidebar)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>📖 Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/subjects.html" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>📁 Open Subjects Dashboard</a>
                <a href="/notes.html" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>📝 Open Lecture Notes Gallery</a>
                <a href="/exams.html" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>📅 Open Exam Schedule Tracker</a>
                <a href="/tracker.html" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>📈 Open Progress Hour Logger</a>
                <a href="/goals.html" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>🎯 Open Short & Long-term Goals</a>
              </div>
            </div>

            {/* Widget 2: Sticky Notes Notepad */}
            <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>📌 Sticky Board</h3>
              <textarea
                style={{ flex: 1, width: '100%', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, resize: 'none', minHeight: '100px' }}
                value={stickyNotes}
                onChange={(e) => setStickyNotes(e.target.value)}
                placeholder="Write quick draft ideas or reminders..."
              />
            </div>

            {/* Widget 3: Pomodoro & Stopwatch Toggles */}
            <div style={{ 
              border: '1px solid var(--border)', 
              padding: '20px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'var(--bg-sidebar)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              gap: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
              
              {/* Pomodoro Timer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏰ Pomodoro ({pomoMode})</h3>
                  <div style={{ display: 'flex', background: 'rgba(223, 177, 91, 0.04)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => handlePomoModeChange('Work')} 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '3px 8px', 
                        borderRadius: '2px', 
                        background: pomoMode === 'Work' ? 'var(--primary)' : 'transparent', 
                        color: pomoMode === 'Work' ? '#000' : 'var(--text-secondary)', 
                        fontWeight: pomoMode === 'Work' ? 600 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      Work
                    </button>
                    <button 
                      onClick={() => handlePomoModeChange('Break')} 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '3px 8px', 
                        borderRadius: '2px', 
                        background: pomoMode === 'Break' ? 'var(--primary)' : 'transparent', 
                        color: pomoMode === 'Break' ? '#000' : 'var(--text-secondary)', 
                        fontWeight: pomoMode === 'Break' ? 600 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      Break
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ 
                    fontSize: '1.8rem', 
                    fontFamily: 'monospace', 
                    fontWeight: 700, 
                    color: 'var(--primary)',
                    letterSpacing: '0.05em',
                    textShadow: '0 0 10px rgba(223, 177, 91, 0.2)'
                  }}>
                    {pomoMinutes.toString().padStart(2, '0')}:{pomoSeconds.toString().padStart(2, '0')}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setPomoActive(!pomoActive)} 
                      style={{ 
                        fontSize: '0.78rem', 
                        background: 'var(--primary)', 
                        color: '#000',
                        fontWeight: 600,
                        border: 'none',
                        padding: '4px 12px', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer',
                        boxShadow: pomoActive ? 'none' : '0 2px 8px rgba(223, 177, 91, 0.25)',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      {pomoActive ? 'Pause' : 'Start'}
                    </button>
                    <button 
                      onClick={handlePomoReset} 
                      style={{ 
                        fontSize: '0.78rem', 
                        background: 'transparent', 
                        border: '1px solid var(--border)', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer', 
                        color: 'var(--text-secondary)',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Stopwatch Timer */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏱️ Lap Stopwatch</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ 
                    fontSize: '1.7rem', 
                    fontFamily: 'monospace', 
                    fontWeight: 700, 
                    color: 'var(--primary)',
                    letterSpacing: '0.02em',
                    textShadow: '0 0 10px rgba(223, 177, 91, 0.2)'
                  }}>
                    {formatStopwatch(stopwatchTime)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setStopwatchActive(!stopwatchActive)} 
                      style={{ 
                        fontSize: '0.78rem', 
                        background: 'var(--primary)', 
                        color: '#000',
                        fontWeight: 600,
                        border: 'none',
                        padding: '4px 12px', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer',
                        boxShadow: stopwatchActive ? 'none' : '0 2px 8px rgba(223, 177, 91, 0.25)',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      {stopwatchActive ? 'Stop' : 'Start'}
                    </button>
                    <button 
                      onClick={() => { setStopwatchActive(false); setStopwatchTime(0); }} 
                      style={{ 
                        fontSize: '0.78rem', 
                        background: 'transparent', 
                        border: '1px solid var(--border)', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer', 
                        color: 'var(--text-secondary)',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📋</span> To-Do List Table
              </span>
            </div>

            <div className="db-filters-wrapper">
              <input
                type="text"
                placeholder="Search tasks..."
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
                value={subjectIdFilter}
                onChange={(e) => setSubjectIdFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
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

          {/* Tasks table listing */}
          {loading && todos.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Syncing planner database...</div>
          ) : (
            <div className="notion-db-list">
              {todos.map((todo) => {
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date(new Date().setHours(0,0,0,0)) && !todo.completed;
                const relatedSubject = subjects.find(s => s.id === todo.subjectId);
                return (
                  <div
                    key={todo.id}
                    className={`notion-row ${todo.completed ? 'completed' : ''}`}
                  >
                    <div className="drag-handle-mock">
                      <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`notion-check-box ${todo.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleComplete(todo)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>

                    {/* Title Name */}
                    <div className="notion-row-title-container">
                      <a href={`/todo.html?id=${todo.id}`} className="notion-row-title-link">
                        {todo.title || 'Untitled page'}
                      </a>
                    </div>

                    {/* Properties */}
                    <div className="notion-row-properties">
                      {relatedSubject && (
                        <span className="notion-pill notion-pill-blue">
                          🎓 {relatedSubject.name}
                        </span>
                      )}

                      <span className={`notion-pill ${todo.priority === 'High' ? 'notion-pill-red' : todo.priority === 'Medium' ? 'notion-pill-yellow' : 'notion-pill-green'}`}>
                        {todo.priority}
                      </span>

                      {todo.dueDate && (
                        <span className={`notion-row-date ${isOverdue ? 'overdue' : ''}`}>
                          📅 {new Date(todo.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </span>
                      )}
                    </div>

                    {/* Row delete action */}
                    <div className="notion-row-actions">
                      <button
                        className="notion-row-btn"
                        onClick={() => handleDeleteTodo(todo.id)}
                        title="Delete task block"
                      >
                        <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Inline database rows creator */}
              <div className="notion-row-adder">
                {!isAdding ? (
                  <button className="notion-row-adder-btn" onClick={() => setIsAdding(true)}>
                    ＋ Add a new page / task row
                  </button>
                ) : (
                  <form className="notion-adder-form" onSubmit={handleInlineSubmit}>
                    <input
                      className="notion-adder-input"
                      placeholder="Name of task... (Press Enter to save)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                    />
                    
                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                    >
                      <option value="">No Subject</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>

                    <button type="submit" style={{ display: 'none' }}></button>
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
