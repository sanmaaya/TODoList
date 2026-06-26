import React, { useState, useEffect } from 'react';
import { useTheme } from './theme.js';

export default function NotesApp() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Database States
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Modal / Editor State
  const [activeNote, setActiveNote] = useState(null); // note object or null
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorSubjectId, setEditorSubjectId] = useState('');

  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch subjects for tagging notes
      const subjectsResponse = await fetch('/_/backend/api/subjects');
      if (!subjectsResponse.ok) throw new Error('Failed to load subjects');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      // Fetch notes
      const notesResponse = await fetch('/_/backend/api/notes');
      if (!notesResponse.ok) throw new Error('Failed to load notes');
      const notesData = await notesResponse.json();
      setNotes(notesData);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve notes database. Ensure backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNote = (note) => {
    setActiveNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content || '');
    setEditorSubjectId(note.subjectId || '');
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    if (!editorTitle.trim()) {
      alert('Note Title is required.');
      return;
    }

    try {
      const response = await fetch(`/_/backend/api/notes/${activeNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editorTitle.trim(),
          content: editorContent,
          subjectId: editorSubjectId || null
        })
      });

      if (!response.ok) throw new Error('Failed to save changes');
      
      setActiveNote(null);
      fetchData();
    } catch (err) {
      alert('Error saving note: ' + err.message);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please fill out the note title.');
      return;
    }

    try {
      const response = await fetch('/_/backend/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          subjectId: newSubjectId || null
        })
      });

      if (!response.ok) throw new Error('Failed to create note');

      setNewTitle('');
      setNewContent('');
      setNewSubjectId('');
      setIsCreating(false);
      fetchData();
    } catch (err) {
      alert('Error creating note: ' + err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note card permanently?')) return;

    try {
      const response = await fetch(`/_/backend/api/notes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete note');
      
      if (activeNote && activeNote.id === id) {
        setActiveNote(null);
      }
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filter notes logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubjectFilter === 'all' || note.subjectId === selectedSubjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="workspace-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
              <defs>
                <linearGradient id="logo-grad-notes" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad-notes)" />
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
          <a href="/notes.html" className="menu-item active">
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

      {/* Main workspace */}
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
            <span className="workspace-emoji">📝</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>Lecture Notes</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.6 }}>
            A virtual note gallery to synthesize study materials, organize lecture topics, and map research outlines.
          </p>

          {error && (
            <div style={{ color: 'var(--danger-text)', padding: '10px 15px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'var(--danger)', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Database controls */}
          <div className="db-controls">
            <div className="db-views-tabs">
              <span className="db-view-tab active">
                <span>🖼️</span> Gallery View
              </span>
            </div>
            
            <div className="db-filters-wrapper">
              <input
                type="text"
                placeholder="Search notes..."
                className="notion-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="property-select-input"
                style={{ fontSize: '0.85rem' }}
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button 
                className="notion-filter-pill active"
                style={{ fontSize: '0.85rem' }}
                onClick={() => setIsCreating(true)}
              >
                ＋ New Note Page
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          {loading && notes.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '25px 0' }}>Syncing lecture notes database...</div>
          ) : filteredNotes.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notes match your filters. Create a new note block to start!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredNotes.map((note) => {
                const subject = subjects.find(s => s.id === note.subjectId);
                // Create a brief excerpt
                const excerpt = note.content 
                  ? (note.content.length > 120 ? note.content.substring(0, 120) + '...' : note.content)
                  : 'Empty page content block...';

                return (
                  <div
                    key={note.id}
                    onClick={() => handleOpenNote(note)}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-sidebar)',
                      padding: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '160px',
                      transition: 'border-color var(--transition-normal), transform var(--transition-normal)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-focus)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div>
                      {/* Subject tag */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        {subject ? (
                          <span className="notion-pill notion-pill-blue" style={{ fontSize: '0.7rem' }}>
                            🎓 {subject.name}
                          </span>
                        ) : (
                          <span className="notion-pill notion-pill-grey" style={{ fontSize: '0.7rem' }}>
                            Unassigned
                          </span>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                          }}
                          title="Delete Note"
                          onMouseEnter={(el) => el.target.style.color = '#ff7369'}
                          onMouseLeave={(el) => el.target.style.color = 'var(--text-muted)'}
                        >
                          &times;
                        </button>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.4 }}>
                        {note.title}
                      </h3>

                      {/* Content Preview */}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {excerpt}
                      </p>
                    </div>

                    {/* Date Footer */}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📅 Created: {new Date(note.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Backdrop: Creating Mode */}
          {isCreating && (
            <div 
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}
              onClick={() => setIsCreating(false)}
            >
              <div 
                style={{
                  background: 'var(--bg-main)', border: '1px solid var(--border)',
                  width: '90%', maxWidth: '600px', padding: '25px', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)', position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-main)' }}>＋ Create Note Page</h2>
                  <button 
                    onClick={() => setIsCreating(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreateNote}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Note Title</label>
                    <input
                      type="text"
                      className="property-text-input"
                      placeholder="Maslow's Hierarchy..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-sidebar)' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Link to Subject</label>
                    <select
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      className="property-select-input"
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-sidebar)' }}
                    >
                      <option value="">Unassigned</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Note Body Content</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Start typing your revision blocks here..."
                      style={{ width: '100%', height: '180px', padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-sidebar)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'none', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                      Create Page
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Backdrop: Active Editing Mode */}
          {activeNote && (
            <div 
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}
              onClick={handleSaveNote}
            >
              <div 
                style={{
                  background: 'var(--bg-main)', border: '1px solid var(--border)',
                  width: '90%', maxWidth: '750px', padding: '30px', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)', position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal close icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📝 Draft Notepad Page
                  </span>
                  <button 
                    onClick={handleSaveNote}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Untitled Note"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    width: '100%',
                    marginBottom: '15px',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '6px'
                  }}
                />

                {/* Subject Selector Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🎓 Subject Relation:
                  </span>
                  <select
                    value={editorSubjectId}
                    onChange={(e) => setEditorSubjectId(e.target.value)}
                    className="property-select-input"
                    style={{ border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '3px' }}
                  >
                    <option value="">None (Unassigned)</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Textarea */}
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Type anything to outline study guides, concepts, or checklists..."
                  style={{
                    width: '100%',
                    height: '320px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    marginBottom: '10px'
                  }}
                />

                {/* Footer Save Actions */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this note block?')) {
                        handleDeleteNote(activeNote.id);
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-text)', fontSize: '0.85rem' }}
                  >
                    🗑️ Delete Note Page
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSaveNote} className="btn btn-primary" style={{ padding: '6px 16px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      Close & Save Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
