import { useEffect, useState } from 'react';
import {
  ListOrdered,
  Clock,
  UserCheck,
  Megaphone,
  Play,
  CheckCircle2,
  UserX,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Ticket,
  Users,
  X,
  Loader2,
  Radio,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge.jsx';

function calculateWaitMinutes(entry) {
  if (!entry.checkInTime) return 0;
  const end = entry.consultationStartTime ? new Date(entry.consultationStartTime) : new Date();
  return Math.max(0, Math.round((end - new Date(entry.checkInTime)) / 60000));
}

export default function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [checkInId, setCheckInId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [latestTicket, setLatestTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = (isAuto = false) => {
    if (!isAuto) setRefreshing(true);
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      doctorFilter
        ? api.get(`/queue/doctor/${doctorFilter}`, { params: { date: today } })
        : api.get('/queue/today'),
      api.get('/doctors', { params: { active: true } }),
      api.get('/appointments', { params: { date: today, status: 'Scheduled' } }),
    ])
      .then(([q, d, a]) => {
        setQueue(q.data);
        setDoctors(d.data);
        setAppointments(a.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to update queue data');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(() => load(true), 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, [doctorFilter]);

  const checkIn = async () => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/queue/check-in', { appointmentId: checkInId });
      setLatestTicket(data);
      setMessage(`Patient checked in successfully! Assigned Token #${data.queueNumber}`);
      setCheckInId('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const action = async (id, path) => {
    setError('');
    try {
      await api.patch(`/queue/${id}/${path}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to perform ${path}`);
    }
  };

  const callNext = async (doctorId) => {
    setError('');
    try {
      const { data } = await api.post('/queue/call-next', { doctorId });
      setMessage(`Called Token #${data.queueNumber} (${data.patientId?.fullName}) to consultation room!`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No waiting patient found for this doctor');
    }
  };

  const waitingCount = queue.filter((q) => ['Waiting', 'Called'].includes(q.status)).length;
  const inConsultationCount = queue.filter((q) => q.status === 'In Consultation').length;
  const completedCount = queue.filter((q) => q.status === 'Completed').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Patient Queue Board</h1>
          <p className="page-subtitle">Real-time consultation flow & token management</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <Radio size={14} style={{ color: '#10b981' }} />
            <span>Auto-refresh: 20s</span>
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => load(false)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{message}</span>
          <button type="button" className="alert-dismiss" onClick={() => setMessage('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button type="button" className="alert-dismiss" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Queue Metrics */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Waiting Now</h3>
            <p style={{ color: '#d97706' }}>{waitingCount}</p>
            <span className="stat-card-badge" style={{ color: '#b45309' }}>
              Waiting in lobby
            </span>
          </div>
          <div className="stat-card-icon icon-amber">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>In Consultation</h3>
            <p style={{ color: '#0f766e' }}>{inConsultationCount}</p>
            <span className="stat-card-badge" style={{ color: '#0d9488' }}>
              Currently with doctor
            </span>
          </div>
          <div className="stat-card-icon icon-teal">
            <Stethoscope size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h3>Completed Today</h3>
            <p style={{ color: '#047857' }}>{completedCount}</p>
            <span className="stat-card-badge" style={{ color: '#10b981' }}>
              Finished visits
            </span>
          </div>
          <div className="stat-card-icon icon-emerald">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Check In Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <UserCheck size={18} style={{ color: 'var(--primary)' }} />
              Patient Check-In (Arrival Desk)
            </h3>
            <p className="panel-subtitle">Select an appointment scheduled for today to issue an atomic queue token</p>
          </div>
        </div>

        <div className="toolbar" style={{ margin: 0 }}>
          <select
            value={checkInId}
            onChange={(e) => setCheckInId(e.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          >
            <option value="">-- Select today&apos;s scheduled patient appointment --</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.appointmentId} • {a.patientId?.fullName} with {a.doctorId?.fullName} ({a.startTime})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary"
            disabled={!checkInId}
            onClick={checkIn}
          >
            <Ticket size={16} />
            <span>Generate Queue Token</span>
          </button>
        </div>

        {/* Issued Ticket Preview */}
        {latestTicket && (
          <div className="ticket-card">
            <div className="ticket-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0f766e' }}>
                  City Care Clinic • Queue Token
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  {latestTicket.patientId?.fullName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ticket-num-badge">#{latestTicket.queueNumber}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token Number</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div>
                <strong>Doctor:</strong> {latestTicket.doctorId?.fullName} ({latestTicket.doctorId?.specialization || 'General'})
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setLatestTicket(null)}
              >
                Dismiss Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Queue Filter & Call Next Bar */}
      <div className="panel" style={{ padding: '1rem' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <Stethoscope size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              style={{ minWidth: 240 }}
            >
              <option value="">All Doctors (Clinic Overview)</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          {doctorFilter && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => callNext(doctorFilter)}
            >
              <Megaphone size={16} />
              <span>Call Next Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Queue Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <span>Loading live queue...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="empty-state">
            <ListOrdered size={44} className="empty-state-icon" />
            <h3>No patients currently in queue</h3>
            <p>Check in an appointment above to begin tracking consultations.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Queue #</th>
                <th>Patient Name</th>
                <th>Doctor / Chamber</th>
                <th>Status</th>
                <th>Wait Time</th>
                <th style={{ textAlign: 'right' }}>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((entry) => {
                const waitMins = calculateWaitMinutes(entry);
                const waitColor =
                  waitMins > 30 ? 'var(--danger-text)' : waitMins > 15 ? 'var(--warning-text)' : 'var(--success-text)';
                const waitBg =
                  waitMins > 30 ? 'var(--danger-light)' : waitMins > 15 ? 'var(--warning-light)' : 'var(--success-light)';

                return (
                  <tr key={entry._id}>
                    <td>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1.05rem',
                        }}
                      >
                        {entry.queueNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{entry.patientId?.fullName || 'Patient'}</div>
                      {entry.patientId?.patientId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {entry.patientId.patientId}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{entry.doctorId?.fullName || 'Assigned Doctor'}</div>
                      {entry.doctorId?.specialization && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {entry.doctorId.specialization}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: waitBg,
                          color: waitColor,
                        }}
                      >
                        <Clock size={12} /> {waitMins} min
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {entry.status === 'Waiting' && (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => action(entry._id, 'call')}
                          title="Call patient into room"
                        >
                          <Megaphone size={14} /> Call
                        </button>
                      )}
                      {['Waiting', 'Called'].includes(entry.status) && (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => action(entry._id, 'start-consultation')}
                          title="Begin consultation session"
                        >
                          <Play size={14} /> Start Consultation
                        </button>
                      )}
                      {entry.status === 'In Consultation' && (
                        <button
                          type="button"
                          className="btn-success btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => action(entry._id, 'complete')}
                          title="Finish consultation"
                        >
                          <CheckCircle2 size={14} /> Complete Visit
                        </button>
                      )}
                      {['Waiting', 'Called'].includes(entry.status) && (
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => action(entry._id, 'no-show')}
                          title="Mark patient as No Show"
                        >
                          <UserX size={14} /> No Show
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
