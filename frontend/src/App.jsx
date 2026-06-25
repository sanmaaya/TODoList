import React from 'react';
import { useTheme } from './theme.js';

export default function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <div>
      {/* SaaS Navigation */}
      <nav className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '1.1rem' }}>
          <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <rect x="5.5" y="5.5" width="13" height="13" rx="3" transform="rotate(45 12 12)" fill="url(#logo-grad)" />
            <path d="M9.5 12l1.5 1.5 3.5-3.5" stroke="var(--bg-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem' }}>PriorityFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => window.location.href = '/dashboard.html'}>Product</span>
          <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => window.location.href = '/dashboard.html'}>Templates</span>
          <button 
            onClick={toggleTheme} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a href="/dashboard.html" className="landing-btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <h1 className="animate-fade-in">Write, plan, organize.<br />All in one workspace.</h1>
        <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          PriorityFlow is a minimalist, multi-page task scheduling canvas. Styled like Notion, designed for developer focus. Toggle lists, define priorities, and write rich sub-task details.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <a href="/dashboard.html" className="landing-btn">
            Get PriorityFlow Free
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor', marginLeft: '8px' }}>
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </a>
        </div>
      </section>

      {/* Interactive Mockup Illustration */}
      <section className="landing-mockup-wrapper animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="landing-mockup" onClick={() => window.location.href = '/dashboard.html'} style={{ cursor: 'pointer', height: 'auto', minHeight: '480px' }}>
          {/* Mockup Sidebar */}
          <div className="mockup-sidebar" style={{ width: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '25px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            </div>
            
            {/* Workspace Select Mockup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <span>🏡</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Personal Workspace</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-active)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                <span>🏠</span><span>Workspace Home</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>🎯</span><span>Active Tasks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>🗄️</span><span>Archive</span>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '20px 0 8px 8px' }}>Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>💼</span><span>Work</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>👤</span><span>Personal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span>🛒</span><span>Shopping</span>
              </div>
            </div>
          </div>

          {/* Mockup Main Panel */}
          <div className="mockup-main" style={{ padding: '0 0 20px 0' }}>
            <div style={{ height: '90px', width: '100%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #06b6d4 100%)', borderBottom: '1px solid var(--border)' }}></div>
            
            <div style={{ padding: '0 24px' }}>
              {/* Emoji header float */}
              <div style={{ marginTop: '-25px', fontSize: '2.5rem', marginBottom: '8px' }}>🚀</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-main)' }}>PriorityFlow Workspace</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>A minimalist document database for tracking tasks and specifications.</div>

              {/* View filters mock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span> Table List
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>🔍 Search</span>
                  <span>Filter</span>
                  <span>Sort</span>
                </div>
              </div>

              {/* Database Rows mock */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Row 1 */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '10px', height: '10px', fill: '#fff' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  </div>
                  <div style={{ flex: 1, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>Design glassmorphism layouts</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="notion-pill notion-pill-yellow" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Medium</span>
                    <span className="notion-pill notion-pill-grey" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Design</span>
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                  <div style={{ flex: 1, color: 'var(--text-main)' }}>Code Express CRUD apis</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="notion-pill notion-pill-red" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>High</span>
                    <span className="notion-pill notion-pill-grey" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Work</span>
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                  <div style={{ flex: 1, color: 'var(--text-main)' }}>Grocery list weekend prep</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="notion-pill notion-pill-green" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Low</span>
                    <span className="notion-pill notion-pill-grey" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>Shopping</span>
                  </div>
                </div>

                {/* Row 4 - Add Row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  ＋ Add a new page / task row...
                </div>
              </div>

              {/* Bottom Doc mock section */}
              <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>📝 Notes & Spec Editor</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clicking any row above opens a dedicated details document page, letting you write structured text logs and customize properties.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Feature Grid */}
      <section className="landing-features">
        <div className="feature-box">
          <div className="feature-box-icon">📂</div>
          <h3>Multi-Page Native Layout</h3>
          <p>
            Separate HTML templates built with Vite. No complex SPA router bundle payloads, giving fast load times and clean browser history.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-box-icon">🎨</div>
          <h3>Minimalist Workspace</h3>
          <p>
            Immersive dark neutral workspace structure copying Notion's sleek styling. Clean checkmarks, subtle dividers, and drag guides.
          </p>
        </div>
        <div className="feature-box">
          <div className="feature-box-icon">📝</div>
          <h3>Document Detail Block</h3>
          <p>
            Every task acts as a single document. Maintain page status timeline, priority rankings, multi-select tag arrays, and rich details.
          </p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
        PriorityFlow &copy; {new Date().getFullYear()}. Built with React + Express.
      </footer>
    </div>
  );
}
