// Maps order/product statuses to colour styles.
const STYLES = {
  PAYMENT_PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Pending Payment' },
  PAID: { bg: 'var(--blue-50)', color: 'var(--blue)', label: 'Paid' },
  COMPLETED: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Completed' },
  CANCELLED: { bg: '#f1f5f9', color: 'var(--text-secondary)', label: 'Cancelled' },
  FAILED: { bg: 'var(--error-bg)', color: 'var(--error)', label: 'Failed' },
  ACTIVE: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Active' },
  INACTIVE: { bg: '#f1f5f9', color: 'var(--text-secondary)', label: 'Inactive' },
  DRAFT: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Draft' },
  // Vendor account statuses
  APPROVED: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Approved' },
  PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Pending' },
  SUSPENDED: { bg: 'var(--error-bg)', color: 'var(--error)', label: 'Suspended' },
  REJECTED: { bg: 'var(--error-bg)', color: 'var(--error)', label: 'Rejected' },
};

export default function StatusBadge({ status }) {
  const key = (status || '').toUpperCase();
  const s = STYLES[key] || { bg: '#f1f5f9', color: 'var(--text-secondary)', label: status || '—' };
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
