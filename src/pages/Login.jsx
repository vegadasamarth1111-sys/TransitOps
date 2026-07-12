import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupRole, setSignupRole] = useState('Dispatcher');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setSignupError('');
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword, signupRole);
      navigate('/dashboard');
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left Brand Panel */}
      <div className="login-brand">
        <div className="login-brand-logo">🚛</div>
        <h2>TransitOps</h2>
        <p>Smart Transport Operations Platform</p>

        <div style={{ marginTop: '40px' }}>
          <p style={{ fontWeight: 600, marginBottom: '16px', color: '#333' }}>One login, four roles:</p>
          <ul className="role-list">
            <li>Fleet Manager</li>
            <li>Dispatcher</li>
            <li>Safety Officer</li>
            <li>Financial Analyst</li>
          </ul>
        </div>



        <div className="brand-footer">TRANSITOPS © 2026 · RBAC ENABLED</div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-side">
        <div className="login-form-container">

          {/* Tab Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)', padding: '4px',
            marginBottom: '32px', border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => { setTab('login'); setLoginError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                background: tab === 'login' ? 'var(--accent)' : 'transparent',
                color: tab === 'login' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                border: 'none', cursor: 'pointer',
              }}
            >Sign In</button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setSignupError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                background: tab === 'signup' ? 'var(--accent)' : 'transparent',
                color: tab === 'signup' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                border: 'none', cursor: 'pointer',
              }}
            >Create Account</button>
          </div>

          {/* ---- LOGIN FORM ---- */}
          {tab === 'login' && (
            <>
              <h2>Sign in to your account</h2>
              <p className="subtitle">Enter your credentials to continue.</p>

              {loginError && (
                <div className="validation-error" style={{ marginBottom: '16px' }}>
                  <strong>Error</strong>
                  ✕ {loginError}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                    id="login-email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    id="login-password"
                  />
                </div>
                <div className="form-row">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <button type="submit" className="login-btn" id="login-submit" disabled={loginLoading}>
                  {loginLoading ? '⏳ Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="login-access-note">
                <strong>Access is scoped by role after login:</strong><br />
                • Fleet Manager → Fleet, Maintenance<br />
                • Dispatcher → Dashboard, Trips<br />
                • Safety Officer → Drivers, Compliance<br />
                • Financial Analyst → Fuel & Expenses, Analytics
              </div>
            </>
          )}

          {/* ---- SIGNUP FORM ---- */}
          {tab === 'signup' && (
            <>
              <h2>Create your account</h2>
              <p className="subtitle">Join TransitOps and manage your fleet.</p>

              {signupError && (
                <div className="validation-error" style={{ marginBottom: '16px' }}>
                  <strong>Error</strong>
                  ✕ {signupError}
                </div>
              )}

              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="John Smith"
                    required
                    id="signup-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="john@company.in"
                    required
                    id="signup-email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select value={signupRole} onChange={e => setSignupRole(e.target.value)} id="signup-role">
                    <option>Dispatcher</option>
                    <option>Fleet Manager</option>
                    <option>Safety Officer</option>
                    <option>Financial Analyst</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    id="signup-password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    value={signupConfirm}
                    onChange={e => setSignupConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    id="signup-confirm"
                  />
                </div>
                <button type="submit" className="login-btn" id="signup-submit" disabled={signupLoading}>
                  {signupLoading ? '⏳ Creating account...' : 'Create Account'}
                </button>
              </form>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
                Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setTab('login'); }} style={{ color: 'var(--accent)' }}>
                  Sign In
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
