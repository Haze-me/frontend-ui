import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorMe, getVendorProducts, getInventory } from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import './vendorPages.css';

export default function VendorDashboardPage() {
  const toast = useToast();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState({ total: 0, stock: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [me, products] = await Promise.all([
          getVendorMe().catch(() => null),
          // Pull a wide page to compute stats client-side.
          getVendorProducts({ page: 0, size: 200 }).catch(() => null),
        ]);
        if (!active) return;
        setVendor(me);
        const list = products?.content || (Array.isArray(products) ? products : []);
        const total = products?.totalElements ?? list.length;
        let activeCount = 0, inactiveCount = 0;
        list.forEach((p) => {
          if ((p.status || '').toUpperCase() === 'ACTIVE') activeCount += 1;
          else inactiveCount += 1;
        });
        // Products carry no stock field — sum available stock from inventory.
        const invs = await Promise.all(
          list.map((p) => getInventory(p.id).catch(() => null))
        );
        const stock = invs.reduce((sum, inv) => sum + Number(inv?.availableQuantity || 0), 0);
        if (!active) return;
        setStats({ total, stock, active: activeCount, inactive: inactiveCount });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not load dashboard'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner fullPage />;

  const businessName = vendor?.businessName || 'Vendor';

  const cards = [
    { label: 'Total products', value: stats.total, icon: '📦', bg: 'var(--blue-50)' },
    { label: 'Total stock units', value: stats.stock, icon: '🏷️', bg: '#fff7ed' },
    { label: 'Active products', value: stats.active, icon: '✅', bg: 'var(--success-bg)' },
    { label: 'Inactive products', value: stats.inactive, icon: '⏸️', bg: '#f1f5f9' },
  ];

  return (
    <div>
      <div className="vp-welcome">
        <h1>Welcome back, {businessName} 👋</h1>
        <p>Here's an overview of your store today.</p>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon" style={{ background: c.bg }}>{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <Link to="/vendor/products/new" className="btn btn-accent btn-lg">＋ Add Product</Link>
        <Link to="/vendor/products" className="btn btn-primary btn-lg">View Products</Link>
        <Link to="/vendor/inventory" className="btn btn-outline btn-lg">Manage Inventory</Link>
      </div>
    </div>
  );
}
