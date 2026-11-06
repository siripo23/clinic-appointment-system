import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  ListOrdered,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../services/AuthContext.jsx';

const STATUS_COLORS = {
  Scheduled: '#6366f1',
  'Checked In': '#0284c7',
  Waiting: '#f59e0b',
  Called: '#d97706',
  'In Consultation': '#0d9488',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  'No Show': '#64748b',
};

const PALETTE = ['#0d9488', '#6366f1', '#0284c7', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <Loader2 size={36} className="spin" style={{ color: 'var(--primary)' }} />
        <span>Loading clinical dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const completionRate =
    stats.todayAppointments > 0
      ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
      : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Overview Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}. Here is what is happening at the clinic today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/appointments" className="btn-secondary btn-sm">
            <Calendar size={15} /> Book Appointment
          </Link>
          <Link to="/queue" className="btn-primary btn-sm">
            <ListOrdered size={15} /> Live Queue Board
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Total Patients</h3>
            <p>{stats.totalPatients}</p>
            <span className="stat-card-badge" style={{ color: 'var(--primary-hover)' }}>
              Registered in system
            </span>
          </div>
          <div className="stat-card-icon icon-teal">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Active Doctors</h3>
            <p>{stats.totalDoctors}</p>
            <span className="stat-card-badge" style={{ color: '#6d28d9' }}>
              On-duty specialists
            </span>
          </div>
          <div className="stat-card-icon icon-purple">
            <Stethoscope size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Today&apos;s Appointments</h3>
            <p>{stats.todayAppointments}</p>
            <span className="stat-card-badge" style={{ color: '#0369a1' }}>
              Scheduled for today
            </span>
          </div>
          <div className="stat-card-icon icon-blue">
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Waiting Patients</h3>
            <p>{stats.waitingPatients}</p>
            <span className="stat-card-badge" style={{ color: '#b45309' }}>
              Currently in waiting room
            </span>
          </div>
          <div className="stat-card-icon icon-amber">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Completed Today</h3>
            <p>{stats.completedToday}</p>
            <span className="stat-card-badge" style={{ color: '#047857' }}>
              {completionRate}% of today&apos;s visits
            </span>
          </div>
          <div className="stat-card-icon icon-emerald">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="charts-row">
        {/* Appointments by status donut */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                Appointments by Status (Today)
              </h3>
              <p className="panel-subtitle">Distribution across booking & queue workflow</p>
            </div>
          </div>

          {stats.appointmentsByStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.appointmentsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {stats.appointmentsByStatus.map((entry, i) => (
                    <Cell
                      key={entry.status || i}
                      fill={STATUS_COLORS[entry.status] || PALETTE[i % PALETTE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} patient(s)`, name]}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {val}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Calendar size={36} className="empty-state-icon" />
              <h3>No appointments today yet</h3>
              <p>Appointments scheduled for today will automatically show up here.</p>
            </div>
          )}
        </div>

        {/* Appointments by doctor bar */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
                Patient Load by Doctor (Today)
              </h3>
              <p className="panel-subtitle">Number of assigned consultations per physician</p>
            </div>
          </div>

          {stats.appointmentsByDoctor?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.appointmentsByDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis
                  dataKey="doctor"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={55}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} appointment(s)`, 'Consultations']}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Stethoscope size={36} className="empty-state-icon" />
              <h3>No doctor consultations logged</h3>
              <p>Doctor workload graphs populate once visits are booked.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
