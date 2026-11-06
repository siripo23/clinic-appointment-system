const config = {
  Scheduled: { cls: 'badge-indigo', pulse: false },
  'Checked In': { cls: 'badge-info', pulse: false },
  Waiting: { cls: 'badge-warning', pulse: true },
  Called: { cls: 'badge-warning', pulse: true },
  'In Consultation': { cls: 'badge-info', pulse: true },
  Completed: { cls: 'badge-success', pulse: false },
  Cancelled: { cls: 'badge-danger', pulse: false },
  'No Show': { cls: 'badge-danger', pulse: false },
};

export default function StatusBadge({ status }) {
  const item = config[status] || { cls: 'badge-neutral', pulse: false };
  return (
    <span className={`badge ${item.cls}`}>
      <span className={`badge-dot ${item.pulse ? 'pulse' : ''}`} />
      {status}
    </span>
  );
}
