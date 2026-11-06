import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ListOrdered,
  BarChart3,
  LogOut,
  Menu,
  X,
  Activity,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext.jsx';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'receptionist'] },
  { to: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'receptionist'] },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors', roles: ['admin', 'receptionist'] },
  { to: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'receptionist'] },
  { to: '/queue', icon: ListOrdered, label: 'Live Queue', roles: ['admin', 'receptionist'], highlight: true },
  { to: '/reports', icon: BarChart3, label: 'Reports & Analytics', roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="layout">
      {/* Mobile Backdrop */}
      <div
        className={`mobile-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-wrapper">
            <div className="sidebar-brand-icon">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div className="sidebar-brand-text">
              <h2>City Care Clinic</h2>
              <p>Queue & EHR Platform</p>
            </div>
          </div>
          <div className="sidebar-status-pill">
            <span className="status-dot-pulse" />
            <span>Clinic Live Online</span>
          </div>
        </div>

        <div className="sidebar-nav-container" onClick={() => setOpen(false)}>
          <div className="sidebar-section-title">Navigation</div>
          {nav
            .filter((item) => item.roles.includes(user?.role))
            .map(({ to, icon: Icon, label, highlight }) => (
              <NavLink key={to} to={to} end={to === '/'}>
                <Icon size={18} />
                <span>{label}</span>
                {highlight && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.68rem',
                      background: 'rgba(20, 184, 166, 0.25)',
                      color: '#5eead4',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                )}
              </NavLink>
            ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-initials">{getInitials(user?.name)}</div>
            <div className="user-info-text">
              <div className="user-info-name">{user?.name}</div>
              <div className="user-info-role">
                {user?.role === 'admin' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ShieldCheck size={12} /> Administrator
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <UserCheck size={12} /> Receptionist
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="header-date-badge">
              <Clock size={14} />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
          </div>

          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginRight: '0.25rem' }}>
              <div className="avatar-sm" style={{ width: 34, height: 34 }}>
                {getInitials(user?.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button type="button" className="btn-secondary btn-sm" onClick={handleLogout} title="Sign out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
