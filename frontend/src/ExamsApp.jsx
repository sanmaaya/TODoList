import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function ExamsApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Database States
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing States
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editGrade, setEditGrade] = useState('');

  // Inline Adder States
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState('Not Started');
  const [newGrade, setNewGrade] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects for select mappings
      const subjectsResponse = await fetch('/_/backend/api/subjects');
      if (!subjectsResponse.ok) throw new Error('Failed to load subjects database');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      // Fetch exam schedules
      const examsResponse = await fetch('/_/backend/api/exams');
      if (!examsResponse.ok) throw new Error('Failed to load exams database');
      const examsData = await examsResponse.json();
      setExams(examsData);

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

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const response = await fetch('/_/backend/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          subjectId: newSubjectId || null,
          examDate: newDate || null,
          status: newStatus,
          grade: newGrade.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to save exam schedule');

      setNewName('');
      setNewSubjectId('');
      setNewDate('');
      setNewStatus('Not Started');
      setNewGrade('');
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('Error creating exam block: ' + err.message);
    }
  };

  const handleStartEdit = (exam) => {
    setEditingId(exam.id);
    setEditName(exam.name);
    setEditSubjectId(exam.subjectId || '');
    setEditDate(exam.examDate || '');
    setEditStatus(exam.status);
    setEditGrade(exam.grade || '');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/_/backend/api/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          subjectId: editSubjectId || null,
          examDate: editDate || null,
          status: editStatus,
          grade: editGrade.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to update exam block');

      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Error saving exam block: ' + err.message);
    }
  };

  const handleUpdateStatusDirectly = async (exam, statusValue) => {
    try {
      const response = await fetch(`/_/backend/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: exam.name,
          subjectId: exam.subjectId,
          examDate: exam.examDate,
          status: statusValue,
          grade: exam.grade
        })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam entry?')) return;

    try {
      const response = await fetch(`/_/backend/api/exams/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete exam scheduling');
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ready': return 'notion-pill-green';
      case 'Reviewing': return 'notion-pill-blue';
      default: return 'notion-pill-grey';
    }
  };

  // Filter schedules
  const filteredExams = exams.filter(exam => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || exam.subjectId === subjectFilter;
    return matchesStatus && matchesSubject;
  });

  return (
    <div className="workspace-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <defs>
                <linearGradient id="logo-grad-exams" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-exams)" />
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
          <a href="/exams.html" className="menu-item active">
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
            <span className="workspace-emoji">📅</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>Exam Preparation</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.6 }}>
            Plan reviews for midterms and final test panels, map due dates, and track grade records.
          </p>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Core metrics badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px' }}>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Exams Scheduled</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{exams.length}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--warning-text)', fontWeight: 600 }}>Active Reviews</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--warning-text)' }}>
                {exams.filter(e => e.status !== 'Ready' && !e.grade).length}
              </div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: 600 }}>Exam Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--success-text)' }}>
                {exams.filter(e => e.status === 'Ready' || e.grade).length}
              </div>
            </div>
          </div>

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>📋</span> Exams Planner Table
              </span>
            </div>

            <div className="db-filters-wrapper">
              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Ready">Ready</option>
              </select>

              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button 
                className="notion-filter-pill active" 
                onClick={() => setIsAdding(true)}
                style={{ fontSize: '0.85rem' }}
              >
                ＋ Schedule Exam
              </button>
            </div>
          </div>

          {/* Table display */}
          {loading && exams.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Syncing academic exams database...</div>
          ) : (
            <div className="notion-db-list">
              {/* Header Row */}
              <div className="notion-row" style={{ fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderTop: '1px solid var(--border)' }}>
                <div style={{ width: '30px' }}></div>
                <div style={{ flex: 2 }}>Exam Name</div>
                <div style={{ flex: 1.2 }}>Subject Link</div>
                <div style={{ flex: 1.2 }}>Date Schedule</div>
                <div style={{ flex: 1 }}>Status Tag</div>
                <div style={{ flex: 0.8, textAlign: 'right', paddingRight: '15px' }}>Grade Log</div>
                <div style={{ width: '60px' }}></div>
              </div>

              {/* Data rows */}
              {filteredExams.map((exam) => {
                const subject = subjects.find(s => s.id === exam.subjectId);

                return (
                  <div key={exam.id} className="notion-row">
                    <div className="drag-handle-mock">
                      <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>

                    {editingId === exam.id ? (
                      /* Editing mode */
                      <>
                        <div style={{ flex: 2 }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="property-text-input"
                            style={{ width: '90%', borderBottom: '1px solid var(--primary)' }}
                            required
                          />
                        </div>
                        <div style={{ flex: 1.2 }}>
                          <select
                            value={editSubjectId}
                            onChange={(e) => setEditSubjectId(e.target.value)}
                            className="property-select-input"
                            style={{ border: '1px solid var(--border)' }}
                          >
                            <option value="">No Subject</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1.2 }}>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="property-text-input"
                            style={{ border: '1px solid var(--border)' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="property-select-input"
                            style={{ border: '1px solid var(--border)' }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Ready">Ready</option>
                          </select>
                        </div>
                        <div style={{ flex: 0.8, textAlign: 'right', paddingRight: '15px' }}>
                          <input
                            type="text"
                            value={editGrade}
                            placeholder="Grade"
                            onChange={(e) => setEditGrade(e.target.value)}
                            className="property-text-input"
                            style={{ width: '60px', borderBottom: '1px solid var(--primary)', textAlign: 'right' }}
                          />
                        </div>
                        <div className="notion-row-actions" style={{ opacity: 1, display: 'flex', gap: '4px' }}>
                          <button
                            className="notion-row-btn"
                            onClick={() => handleSaveEdit(exam.id)}
                            title="Save changes"
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
                      /* Display mode */
                      <>
                        <div style={{ flex: 2, fontWeight: 500 }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => handleStartEdit(exam)} title="Click to edit exam details">
                            {exam.name}
                          </span>
                        </div>
                        <div style={{ flex: 1.2 }}>
                          {subject ? (
                            <span className="notion-pill notion-pill-blue">
                              🎓 {subject.name}
                            </span>
                          ) : (
                            <span className="notion-pill notion-pill-grey">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1.2, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {exam.examDate ? (
                            <span>📅 {new Date(exam.examDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No date</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <select
                            value={exam.status}
                            onChange={(e) => handleUpdateStatusDirectly(exam, e.target.value)}
                            className={`notion-pill ${getStatusClass(exam.status)}`}
                            style={{ 
                              border: 'none', 
                              cursor: 'pointer', 
                              fontWeight: 500,
                              outline: 'none',
                              fontSize: '0.78rem'
                            }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Ready">Ready</option>
                          </select>
                        </div>
                        <div style={{ flex: 0.8, textAlign: 'right', paddingRight: '20px', fontWeight: 'bold' }}>
                          {exam.grade ? (
                            <span style={{ color: 'var(--primary)' }}>{exam.grade}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>-</span>
                          )}
                        </div>
                        <div className="notion-row-actions">
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="notion-row-btn"
                              onClick={() => handleStartEdit(exam)}
                              title="Edit exam"
                            >
                              ✏️
                            </button>
                            <button
                              className="notion-row-btn"
                              onClick={() => handleDeleteExam(exam.id)}
                              title="Delete scheduling"
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

              {/* Inline scheduling adder */}
              <div className="notion-row-adder">
                {!isAdding ? (
                  <button className="notion-row-adder-btn" onClick={() => setIsAdding(true)}>
                    ＋ Add a new exam schedule
                  </button>
                ) : (
                  <form className="notion-adder-form" onSubmit={handleAddExam} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <input
                      className="notion-adder-input"
                      placeholder="Exam subject/title..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{ flex: '1 1 200px' }}
                      required
                      autoFocus
                    />

                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                    >
                      <option value="">No Subject</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      className="property-text-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px', border: '1px solid var(--border)' }}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />

                    <select
                      className="property-select-input"
                      style={{ fontSize: '0.85rem', padding: '2px 8px' }}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Ready">Ready</option>
                    </select>

                    <input
                      type="text"
                      className="property-text-input"
                      placeholder="Grade (optional)"
                      style={{ fontSize: '0.85rem', padding: '2px 8px', width: '90px', border: '1px solid var(--border)' }}
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                    />

                    <button type="submit" className="notion-filter-pill active" style={{ fontSize: '0.8rem', padding: '2px 10px' }}>Save</button>
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
