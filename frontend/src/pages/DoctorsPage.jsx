import { useEffect, useState } from 'react';
import {
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext.jsx';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyForm = {
  fullName: '',
  specialization: '',
  phone: '',
  email: '',
  consultationFee: 500,
  appointmentDurationMinutes: 30,
  availability: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00' }],
  isActive: true,
};

export default function DoctorsPage() {
  const { isAdmin } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' or doctorId
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/doctors', { params: { search: search.trim() || undefined } })
      .then((res) => setDoctors(res.data))
      .catch((err) =>
        setNotification({
          type: 'error',
          text: err.response?.data?.message || 'Failed to fetch doctors',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setModal('add');
    setNotification(null);
  };

  const openEdit = (d) => {
    setForm({
      fullName: d.fullName,
      specialization: d.specialization,
      phone: d.contact?.phone || '',
      email: d.contact?.email || '',
      consultationFee: d.consultationFee,
      appointmentDurationMinutes: d.appointmentDurationMinutes,
      availability: d.availability?.length ? d.availability : emptyForm.availability,
      isActive: d.isActive,
    });
    setModal(d._id);
    setNotification(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);
    try {
      const body = {
        fullName: form.fullName.trim(),
        specialization: form.specialization.trim(),
        contact: { phone: form.phone.trim(), email: form.email.trim() },
        consultationFee: Number(form.consultationFee),
        appointmentDurationMinutes: Number(form.appointmentDurationMinutes),
        availability: form.availability,
      };
      if (modal !== 'add') body.isActive = form.isActive;

      if (modal === 'add') {
        await api.post('/doctors', body);
        setNotification({ type: 'success', text: 'Doctor registered successfully!' });
      } else {
        await api.put(`/doctors/${modal}`, body);
        setNotification({ type: 'success', text: 'Doctor profile updated successfully!' });
      }
      setModal(null);
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save doctor details',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate Dr. ${name}?`)) return;
    try {
      await api.delete(`/doctors/${id}`);
      setNotification({ type: 'success', text: `Dr. ${name} deactivated.` });
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to deactivate doctor',
      });
    }
  };

  const addScheduleSlot = () => {
    setForm({
      ...form,
      availability: [
        ...form.availability,
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00' },
      ],
    });
  };

  const removeScheduleSlot = (index) => {
    if (form.availability.length <= 1) return;
    const updated = form.availability.filter((_, i) => i !== index);
    setForm({ ...form, availability: updated });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Directory & Schedules</h1>
          <p className="page-subtitle">Physician credentials, consultation fees, and weekly shift rosters</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus size={18} /> Add Doctor
          </button>
        )}
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{notification.text}</span>
          <button type="button" className="alert-dismiss" onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="panel" style={{ padding: '1rem' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              placeholder="Search by name, ID, or specialization (e.g. Cardiology)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <button type="button" className="btn-primary" onClick={load}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                api.get('/doctors').then((r) => setDoctors(r.data));
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Doctors Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <span>Loading doctors directory...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <Stethoscope size={44} className="empty-state-icon" />
            <h3>No doctors found</h3>
            <p>Try searching with another keyword or add a new doctor profile.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor ID</th>
                <th>Doctor & Specialization</th>
                <th>Contact</th>
                <th>Fee & Slot</th>
                <th>Working Hours (Roster)</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id}>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        color: 'var(--primary-dark)',
                      }}
                    >
                      {d.doctorId}
                    </span>
                  </td>
                  <td>
                    <div className="table-patient-cell">
                      <div className="avatar-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                        <Stethoscope size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.fullName}</div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 2,
                            padding: '1px 6px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        >
                          {d.specialization}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {d.contact?.phone && (
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} style={{ color: 'var(--primary)' }} />
                        <a href={`tel:${d.contact.phone}`} style={{ color: 'inherit' }}>
                          {d.contact.phone}
                        </a>
                      </div>
                    )}
                    {d.contact?.email && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} />
                        <a href={`mailto:${d.contact.email}`} style={{ color: 'inherit' }}>
                          {d.contact.email}
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.92rem' }}>
                      ₹{d.consultationFee}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {d.appointmentDurationMinutes || 30} mins / visit
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 280 }}>
                      {d.availability?.map((slot, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            color: 'var(--text-main)',
                            fontWeight: 500,
                          }}
                        >
                          <strong>{slot.dayOfWeek.slice(0, 3)}:</strong> {slot.startTime}-{slot.endTime}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {d.isActive ? (
                      <span className="badge badge-success">
                        <span className="badge-dot" /> Active
                      </span>
                    ) : (
                      <span className="badge badge-neutral">
                        <span className="badge-dot" /> Inactive
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => openEdit(d)}
                        title="Edit Doctor Roster"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      {d.isActive && (
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => deactivate(d._id, d.fullName)}
                          title="Deactivate Doctor"
                        >
                          <Trash2 size={14} /> Deactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      {modal && isAdmin && (
        <div className="modal-backdrop" onClick={() => !actionLoading && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Add New Doctor Profile' : 'Edit Doctor Information'}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModal(null)}
                disabled={actionLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save} className="modal-form">
              <div className="modal-body">
                <div className="form-section-divider">1. Doctor Identity & Speciality</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name (with Dr. prefix) *</label>
                    <input
                      required
                      placeholder="Dr. Rajesh Nair"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization *</label>
                    <input
                      required
                      placeholder="Cardiology, General Medicine..."
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-section-divider">2. Contact & Consultation Details</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      required
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Consultation Fee (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Slot Duration (minutes) *</label>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      required
                      value={form.appointmentDurationMinutes}
                      onChange={(e) =>
                        setForm({ ...form, appointmentDurationMinutes: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-section-divider">
                  3. Weekly Working Hours (Embedded Array)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                  {form.availability.map((slot, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#f8fafc',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => {
                          const availability = [...form.availability];
                          availability[idx] = { ...slot, dayOfWeek: e.target.value };
                          setForm({ ...form, availability });
                        }}
                        style={{ flex: 1.2, minWidth: 120 }}
                      >
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const availability = [...form.availability];
                          availability[idx] = { ...slot, startTime: e.target.value };
                          setForm({ ...form, availability });
                        }}
                        style={{ flex: 1 }}
                      />

                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>

                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const availability = [...form.availability];
                          availability[idx] = { ...slot, endTime: e.target.value };
                          setForm({ ...form, availability });
                        }}
                        style={{ flex: 1 }}
                      />

                      {form.availability.length > 1 && (
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => removeScheduleSlot(idx)}
                          title="Remove slot"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={addScheduleSlot}
                >
                  <Plus size={14} /> Add Another Shift / Day
                </button>

                {modal !== 'add' && (
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        style={{ width: 'auto', minHeight: 'unset' }}
                      />
                      <span>Active Practice Status</span>
                    </label>
                  </div>
                )}
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
                    'Add Doctor'
                  ) : (
                    'Save Changes'
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
