import { useAuth } from '../../context/AuthContext';
import './vendor.css';

export default function Vendornavbar({ onToggleSidebar }) {
  const { vendor, logoutVendor } = useAuth();

  return (
    <header className="vnav">
      <button className="vnav-burger" onClick={onToggleSidebar} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
      <div className="vnav-title">Vendor Center</div>
      <div className="vnav-right">
        <div className="vnav-user">
          <span className="vnav-email">{vendor?.email}</span>
          <span className="vnav-role">Vendor</span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={logoutVendor}>
          Logout
        </button>
      </div>
    </header>
  );
}
