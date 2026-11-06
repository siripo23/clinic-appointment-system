import { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';

export default function ReportsPage() {
  const [byStatus, setByStatus] = useState([]);
  const [byDoctor, setByDoctor] = useState([]);
  const [daily, setDaily] = useState([]);
  const [waiting, setWaiting] = useState({ averageWaitingMinutes: 0, sampleSize: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/appointments-by-status'),
      api.get('/analytics/appointments-by-doctor'),
      api.get('/analytics/daily-trends'),
      api.get('/analytics/waiting-time'),
    ])
      .then(([s, d, t, w]) => {
        setByStatus(s.data);
        setByDoctor(d.data);
        setDaily(t.data);
        setWaiting(w.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load analytics data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <Loader2 size={36} className="spin" style={{ color: 'var(--primary)' }} />
        <span>Computing MongoDB aggregation metrics...</span>
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

  const avgWait = waiting.averageWaitingMinutes || 0;
  const waitBadgeColor =
    avgWait < 15 ? 'var(--success-text)' : avgWait < 30 ? 'var(--warning-text)' : 'var(--danger-text)';
  const waitBadgeBg =
    avgWait < 15 ? 'var(--success-light)' : avgWait < 30 ? 'var(--warning-light)' : 'var(--danger-light)';

  const totalAnalyzed = byStatus.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Clinical Analytics</h1>
          <p className="page-subtitle">Real-time business intelligence computed via MongoDB Aggregation Pipelines</p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Average Waiting Time</h3>
            <p>{avgWait} min</p>
            <span
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: waitBadgeBg,
                color: waitBadgeColor,
                width: 'fit-content',
              }}
            >
              {avgWait <= 15 ? '✨ Excellent Flow' : avgWait <= 30 ? '⚠️ Moderate Delay' : '🚨 High Queue Wait'}
            </span>
          </div>
          <div className="stat-card-icon icon-amber">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Sampled Consultations</h3>
            <p>{waiting.sampleSize}</p>
            <span className="stat-card-badge" style={{ color: '#047857' }}>
              Completed doctor sessions
            </span>
          </div>
          <div className="stat-card-icon icon-emerald">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Total Bookings Logged</h3>
            <p>{totalAnalyzed}</p>
            <span className="stat-card-badge" style={{ color: '#0369a1' }}>
              Historical appointments
            </span>
          </div>
          <div className="stat-card-icon icon-blue">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="charts-row">
        {/* Appointments by Status */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                Appointments by Status
              </h3>
              <p className="panel-subtitle">Pipeline: $group by status with $count</p>
            </div>
          </div>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} appointments`, 'Count']}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <BarChart3 size={36} className="empty-state-icon" />
              <h3>No appointment status data</h3>
            </div>
          )}
        </div>

        {/* Appointments by Doctor */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
                Appointments by Doctor
              </h3>
              <p className="panel-subtitle">Pipeline: $lookup doctors + $group by physician</p>
            </div>
          </div>
          {byDoctor.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="doctor"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={55}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} appointments`, 'Workload']}
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
              <h3>No physician workload data</h3>
            </div>
          )}
        </div>

        {/* Daily Trends Area Chart */}
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                <TrendingUp size={18} style={{ color: '#6366f1' }} />
                Daily Appointment Booking Trends
              </h3>
              <p className="panel-subtitle">Pipeline: $dateToString day grouping over timeline</p>
            </div>
          </div>
          {daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={daily} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} appointments`, 'Volume']}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Calendar size={36} className="empty-state-icon" />
              <h3>No daily trend history found</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
