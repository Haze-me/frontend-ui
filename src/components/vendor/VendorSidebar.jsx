import { NavLink, Link } from 'react-router-dom';
import './vendor.css';

const LINKS = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/vendor/products', label: 'Products', icon: '▤' },
  { to: '/vendor/products/new', label: 'Add Product', icon: '＋' },
  { to: '/vendor/inventory', label: 'Inventory', icon: '▥' },
  { to: '/vendor/profile', label: 'Profile', icon: '◉' },
];

export default function VendorSidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="vsb-overlay" onClick={onClose} />}
      <aside className={`vsb ${open ? 'open' : ''}`}>
        <Link to="/" className="vsb-logo">
          <span className="logo-mark">C</span>
          <span>Chyno<span className="logo-accent">-Shop</span></span>
        </Link>

        <nav className="vsb-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/vendor/products'}
              className={({ isActive }) => `vsb-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="vsb-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="vsb-back">← Back to store</Link>
      </aside>
    </>
  );
}
