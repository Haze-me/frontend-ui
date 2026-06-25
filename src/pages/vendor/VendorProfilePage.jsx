import { useEffect, useState } from 'react';
import { getVendorMe } from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import './vendorPages.css';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function VendorProfilePage() {
  const toast = useToast();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getVendorMe()
      .then((data) => active && setVendor(data))
      .catch((err) => active && toast.error(getApiErrorMessage(err, 'Could not load profile')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner fullPage />;

  if (!vendor) {
    return (
      <div className="empty-state">
        <h3>Could not load vendor profile</h3>
      </div>
    );
  }

  const rows = [
    ['Business name', vendor.businessName || '—'],
    ['Business email', vendor.businessEmail || '—'],
    ['Phone', vendor.phone || '—'],
    ['Member since', formatDate(vendor.createdAt)],
  ];

  return (
    <div>
      <div className="vp-head">
        <div>
          <h1>Vendor Profile</h1>
          <p>Your business account details</p>
        </div>
      </div>

      <div className="vp-form-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--blue), var(--navy))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800,
              }}
            >
              {(vendor.businessName || 'V').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>{vendor.businessName || 'Vendor'}</h2>
              <div className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
                {vendor.businessEmail}
              </div>
            </div>
          </div>
          <StatusBadge status={vendor.status} />
        </div>

        <div className="od-card" style={{ border: '1px solid var(--border)' }}>
          {rows.map(([label, value]) => (
            <div className="od-meta-row" key={label} style={{ padding: '4px 0' }}>
              <span className="muted">{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
