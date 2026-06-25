import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './navbar.css';

export default function Navbar() {
  const { isCustomerLoggedIn, customer, logoutCustomer } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logoutCustomer();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark">C</span>
          <span className="logo-text">
            Chyno<span className="logo-accent">-Shop</span>
          </span>
        </Link>

        <form className="nav-search" onSubmit={onSearch}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="nav-search-input"
            placeholder="Search electronics, brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" className={isActive('/products') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            Shop
          </Link>

          {isCustomerLoggedIn ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                {customer?.fullName?.split(' ')[0] || 'Profile'}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}

          <Link to="/cart" className="nav-cart" onClick={() => setMenuOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l2.4 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.4" fill="currentColor" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
        </nav>

        <button className="nav-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
