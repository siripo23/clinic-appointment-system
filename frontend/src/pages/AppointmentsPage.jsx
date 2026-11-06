import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Edit,
  XCircle,
  Clock,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ date: '', doctorId: '', status: '', search: '' });
  const [modal, setModal] = useState(null); // 'add' or appointmentId
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', text: '' }

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    startTime: '09:00',
    endTime: '09:30',
    reason: '',
  });

  const load = (customFilters = filters) => {
    setLoading(true);
    api
      .get('/appointments', {
        params: {
          ...customFilters,
          search: customFilters.search?.trim() || undefined,
          date: customFilters.date || undefined,
          doctorId: customFilters.doctorId || undefined,
          status: customFilters.status || undefined,
        },
      })
      .then((r) => setAppointments(r.data))
      .catch((err) =>
        setNotification({
          type: 'error',
          text: err.response?.data?.message || 'Failed to fetch appointments',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get('/patients', { params: { active: true } }),
      api.get('/doctors', { params: { active: true } }),
    ]).then(([p, d]) => {
      setPatients(p.data);
      setDoctors(d.data);
    });
    load();
  }, []);

  const setFilterToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = { ...filters, date: today };
    setFilters(updated);
    load(updated);
  };

  const clearFilters = () => {
    const reset = { date: '', doctorId: '', status: '', search: '' };
    setFilters(reset);
    load(reset);
  };

  const openBook = () => {
    setForm({
      patientId: patients[0]?._id || '',
      doctorId: doctors[0]?._id || '',
      appointmentDate: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '09:30',
      reason: '',
    });
    setModal('add');
    setNotification(null);
  };

  const openEdit = (a) => {
    setForm({
      patientId: a.patientId?._id || a.patientId,
      doctorId: a.doctorId?._id || a.doctorId,
      appointmentDate: a.appointmentDate?.slice(0, 10) || '',
      startTime: a.startTime || '09:00',
      endTime: a.endTime || '09:30',
      reason: a.reason || '',
    });
    setModal(a._id);
    setNotification(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);
    try {
      if (modal === 'add') {
        await api.post('/appointments', form);
        setNotification({ type: 'success', text: 'Appointment booked successfully!' });
      } else {
        await api.put(`/appointments/${modal}`, form);
        setNotification({ type: 'success', text: 'Appointment updated successfully!' });
      }
      setModal(null);
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save appointment',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAppt = async (id, aptId) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${aptId || ''}?`)) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      setNotification({ type: 'success', text: 'Appointment cancelled.' });
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Could not cancel appointment',
      });
    }
  };

  const quickCheckIn = async (appointmentId) => {
    try {
      const { data } = await api.post('/queue/check-in', { appointmentId });
      setNotification({
        type: 'success',
        text: `Checked in! Patient assigned Queue Ticket #${data.queueNumber}`,
      });
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Check-in failed',
      });
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateStr.slice(0, 10) === today;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment Management</h1>
          <p className="page-subtitle">Schedule, reschedule, filter, and check in patient visits</p>
        </div>
        <button type="button" className="btn-primary" onClick={openBook}>
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{notification.text}</span>
          <button
            type="button"
            className="alert-dismiss"
            onClick={() => setNotification(null)}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: '1rem' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              placeholder="Search by ID, patient, doctor..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              title="Filter by appointment date"
            />
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={setFilterToday}
              title="Filter for today's appointments"
            >
              Today
            </button>
          </div>

          <select
            value={filters.doctorId}
            onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.fullName} ({d.specialization})
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {['Scheduled', 'Checked In', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show'].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              )
            )}
          </select>

          <button type="button" className="btn-primary" onClick={() => load()}>
            <Filter size={15} /> Apply
          </button>

          {(filters.date || filters.doctorId || filters.status || filters.search) && (
            <button type="button" className="btn-secondary btn-sm" onClick={clearFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Loader2 size={30} className="spin" style={{ color: 'var(--primary)' }} />
            <span>Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <CalendarIcon size={44} className="empty-state-icon" />
            <h3>No appointments found</h3>
            <p>Try adjusting your search filters or book a new appointment.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Details</th>
                <th>Assigned Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Reason</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const canCheckIn =
                  a.status === 'Scheduled' && isToday(a.appointmentDate);
                const canModify = !['Cancelled', 'Completed'].includes(a.status);

                return (
                  <tr key={a._id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          color: 'var(--primary-dark)',
                        }}
                      >
                        {a.appointmentId}
                      </span>
                    </td>
                    <td>
                      <div className="table-patient-cell">
                        <div className="avatar-sm">
                          {a.patientId?.fullName ? a.patientId.fullName[0].toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.patientId?.fullName || 'Unknown'}</div>
                          {a.patientId?.contact?.phone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {a.patientId.contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.doctorId?.fullName || 'Unassigned'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.doctorId?.specialization || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>
                        {a.appointmentDate?.slice(0, 10)}
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Clock size={12} /> {a.startTime} - {a.endTime}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: a.reason ? 'var(--text-main)' : 'var(--text-light)',
                        }}
                      >
                        {a.reason || 'Routine Consultation'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {canCheckIn && (
                        <button
                          type="button"
                          className="btn-success btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => quickCheckIn(a._id)}
                          title="Check in patient for queue"
                        >
                          <UserCheck size={14} /> Check In
                        </button>
                      )}
                      {canModify && (
                        <>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            style={{ marginRight: 6 }}
                            onClick={() => openEdit(a)}
                            title="Reschedule / Edit"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => cancelAppt(a._id, a.appointmentId)}
                            title="Cancel Appointment"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking / Rescheduling Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => !actionLoading && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Book New Appointment' : 'Reschedule Appointment'}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModal(null)}
                disabled={actionLoading}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Patient *</label>
                  <select
                    required
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  >
                    <option value="">-- Choose registered patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullName} ({p.patientId}) - {p.contact?.phone || 'No phone'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Doctor *</label>
                  <select
                    required
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  >
                    <option value="">-- Choose specialist doctor --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.specialization}) - Fee: ₹{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Date *</label>
                    <input
                      type="date"
                      required
                      value={form.appointmentDate}
                      onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Chief Complaint / Consultation Reason</label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Fever and body pain, regular diabetic checkup, follow-up..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModal(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Saving...
                    </>
                  ) : modal === 'add' ? (
                    'Confirm Booking'
                  ) : (
                    'Save Reschedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
