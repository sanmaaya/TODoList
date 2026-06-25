import React from 'react';
import { useTheme } from './theme.js';

export default function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <div>
      {/* SaaS Navigation */}
      <nav className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '1.1rem' }}>
          <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', fill: 'var(--primary)' }}>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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
        <div className="landing-mockup" onClick={() => window.location.href = '/dashboard.html'} style={{ cursor: 'pointer' }}>
          {/* Mockup Sidebar */}
          <div className="mockup-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            </div>
            <div style={{ height: '14px', width: '90px', backgroundColor: 'var(--bg-hover)', borderRadius: '3px', marginBottom: '30px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span><div style={{ height: '10px', width: '60px', backgroundColor: 'var(--bg-hover)', borderRadius: '2px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span><div style={{ height: '10px', width: '70px', backgroundColor: 'var(--bg-hover)', borderRadius: '2px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💼</span><div style={{ height: '10px', width: '50px', backgroundColor: 'var(--bg-hover)', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
          {/* Mockup Main Canvas */}
          <div className="mockup-main">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.5rem' }}>📝</span>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="mockup-skeleton-title"></div>
                <div style={{ height: '12px', width: '180px', backgroundColor: 'var(--bg-hover)', borderRadius: '2px' }}></div>
              </div>
            </div>
            {/* Rows list mock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                <div className="mockup-skeleton-row"></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                <div className="mockup-skeleton-row-2"></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                <div style={{ height: '20px', width: '75%', backgroundColor: 'var(--bg-hover)', borderRadius: '3px' }}></div>
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
