import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../services/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <Activity size={28} strokeWidth={2.5} />
          </div>
          <h1>City Care Clinic</h1>
          <p className="sub">Appointment & Patient Queue Management System</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
              <Mail size={17} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.com"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
              <Lock size={17} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  background: 'transparent',
                  border: 'none',
                  minHeight: 'unset',
                  padding: '4px',
                  color: 'var(--text-muted)',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="demo-credentials-box">
          <h4>Quick Demo Logins (Click to autofill)</h4>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn-demo-chip"
              onClick={() => fillDemo('admin@clinic.com', 'Admin@123')}
            >
              <Shield size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Admin
            </button>
            <button
              type="button"
              className="btn-demo-chip"
              onClick={() => fillDemo('reception@clinic.com', 'Reception@123')}
            >
              <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Receptionist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
