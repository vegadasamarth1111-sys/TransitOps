import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search vehicles, trips, drivers..." id="topbar-search" />
      </div>

      <div className="topbar-user" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleTheme} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="topbar-username">{user?.name || 'User'}</span>
        <div style={{ position: 'relative' }}>
          <div
            className="topbar-role-badge"
            onClick={() => setShowUserMenu(v => !v)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            id="user-menu-toggle"
          >
            {user?.role || 'Dispatcher'}
            <div className="topbar-avatar">{user?.initials || 'U'}</div>
          </div>

          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowUserMenu(false)}
              />
              {/* Dropdown */}
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '8px', minWidth: '200px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100,
                animation: 'fadeInDown 0.15s ease'
              }}>
                {/* User info */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '14px' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
                  <div style={{
                    marginTop: '6px', display: 'inline-block', padding: '2px 8px',
                    background: 'var(--accent-muted)', color: 'var(--accent)',
                    borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600
                  }}>
                    {user?.role}
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', color: 'var(--text-primary)',
                    fontSize: '14px', cursor: 'pointer', border: 'none', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  ⚙️ Settings
                </button>

                <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', color: 'var(--danger)',
                    fontSize: '14px', cursor: 'pointer', border: 'none', textAlign: 'left',
                    fontWeight: 600, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
