import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../services/AuthContext.jsx';

const emptyForm = {
  fullName: '',
  dateOfBirth: '',
  gender: 'Male',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
};

export default function PatientsPage() {
  const { isAdmin } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' or patientId
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/patients', { params: { search: search.trim() || undefined } })
      .then((res) => setPatients(res.data))
      .catch((err) =>
        setNotification({
          type: 'error',
          text: err.response?.data?.message || 'Failed to load patients',
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

  const openEdit = (p) => {
    setForm({
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
      gender: p.gender || 'Male',
      phone: p.contact?.phone || '',
      email: p.contact?.email || '',
      street: p.address?.street || '',
      city: p.address?.city || '',
      state: p.address?.state || '',
      pincode: p.address?.pincode || '',
    });
    setModal(p._id);
    setNotification(null);
  };

  const buildBody = () => ({
    fullName: form.fullName.trim(),
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    contact: { phone: form.phone.trim(), email: form.email.trim() },
    address: {
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    },
  });

  const save = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setNotification(null);
    try {
      const body = buildBody();
      if (modal === 'add') {
        await api.post('/patients', body);
        setNotification({ type: 'success', text: 'New patient registered successfully!' });
      } else {
        await api.put(`/patients/${modal}`, body);
        setNotification({ type: 'success', text: 'Patient details updated successfully!' });
      }
      setModal(null);
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save patient',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate patient record for "${name}"?`)) return;
    try {
      await api.delete(`/patients/${id}`);
      setNotification({ type: 'success', text: `Patient "${name}" deactivated.` });
      load();
    } catch (err) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Could not deactivate patient',
      });
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="page-subtitle">Register and maintain electronic medical records (EMR)</p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Register Patient
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
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="panel" style={{ padding: '1rem' }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              placeholder="Search by patient name, ID (e.g. PAT-0001), phone..."
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
                api.get('/patients').then((r) => setPatients(r.data));
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <span>Loading patient records...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Users size={44} className="empty-state-icon" />
            <h3>No patients found</h3>
            <p>Try searching with another keyword or click &quot;Register Patient&quot; above.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Full Name & Demographics</th>
                <th>Contact Info</th>
                <th>Location / Address</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const age = calculateAge(p.dateOfBirth);
                return (
                  <tr key={p._id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          color: 'var(--primary-dark)',
                        }}
                      >
                        {p.patientId}
                      </span>
                    </td>
                    <td>
                      <div className="table-patient-cell">
                        <div className="avatar-sm">
                          {p.fullName ? p.fullName[0].toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.gender} {age !== null ? `• ${age} yrs` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.contact?.phone && (
                        <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={13} style={{ color: 'var(--primary)' }} />
                          <a href={`tel:${p.contact.phone}`} style={{ color: 'inherit' }}>
                            {p.contact.phone}
                          </a>
                        </div>
                      )}
                      {p.contact?.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} />
                          <a href={`mailto:${p.contact.email}`} style={{ color: 'inherit' }}>
                            {p.contact.email}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {p.address?.city || 'City not set'}
                        {p.address?.state ? `, ${p.address.state}` : ''}
                      </div>
                      {p.address?.street && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {p.address.street} {p.address.pincode ? `- ${p.address.pincode}` : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.isActive ? (
                        <span className="badge badge-success">
                          <span className="badge-dot" /> Active
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          <span className="badge-dot" /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => openEdit(p)}
                        title="Edit Patient Details"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      {isAdmin && p.isActive && (
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => deactivate(p._id, p.fullName)}
                          title="Deactivate Patient"
                        >
                          <Trash2 size={14} /> Deactivate
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

      {/* Patient Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => !actionLoading && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Register New Patient' : 'Edit Patient Information'}</h2>
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
                <div className="form-section-divider">1. Personal Information</div>
                <div className="form-group">
                  <label>Full Legal Name *</label>
                  <input
                    required
                    placeholder="E.g. Rajesh Kumar"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-section-divider">2. Contact Details</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="E.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-section-divider">3. Residential Address</div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    placeholder="House / Flat / Street Name"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>PIN Code</label>
                    <input
                      placeholder="6 digits"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
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
                    'Register Patient'
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
