import { Link } from 'react-router-dom';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="nav-logo">
            <span className="logo-mark">C</span>
            <span className="logo-text" style={{ color: '#fff' }}>
              Chyno<span className="logo-accent">-Shop</span>
            </span>
          </Link>
          <p>
            Nigeria's premium multi-vendor electronics marketplace. Genuine
            products, trusted vendors, fast delivery.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?sortBy=newest">New Arrivals</Link>
          <Link to="/products?sortBy=rating">Top Rated</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-col">
          <h4>Sell on Chyno</h4>
          <Link to="/vendor/register">Become a Vendor</Link>
          <Link to="/vendor/login">Vendor Login</Link>
          <Link to="/vendor/dashboard">Vendor Dashboard</Link>
        </div>
      </div>

      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Chyno-Shop. All rights reserved.</span>
        <span>Payments secured by Paystack · Prices in ₦ (NGN)</span>
      </div>
    </footer>
  );
}
