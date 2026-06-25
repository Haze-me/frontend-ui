import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { loginVendor as loginVendorApi } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../auth/auth.css';

export default function VendorLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isVendorLoggedIn, loginVendor } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isVendorLoggedIn) return <Navigate to="/vendor/dashboard" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginVendorApi(form);
      // Vendor token shape: { access, refresh, user: { id, email, role } }
      loginVendor(data.access, data.user || { email: form.email });
      toast.success('Signed in to Vendor Center');
      navigate('/vendor/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid vendor credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap auth-vendor" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <div className="auth-head">
          <Link to="/" className="nav-logo" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <span className="logo-mark">C</span>
            <span className="logo-text">Chyno<span className="logo-accent">-Shop</span></span>
          </Link>
          <span className="auth-badge">VENDOR CENTER</span>
          <h1>Vendor Login</h1>
          <p>Manage your products, inventory and orders</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Business email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="vendor@business.com"
              required
            />
          </div>

          <div className="field pw-field">
            <label>Password</label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="btn btn-dark btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In to Vendor Center'}
          </button>
        </form>

        <p className="auth-foot">
          New vendor? <Link to="/vendor/register" className="link-accent">Create an account</Link>
        </p>
        <p className="auth-foot" style={{ marginTop: 8 }}>
          Shopping instead? <Link to="/login" className="link-accent">Customer login</Link>
        </p>
      </div>
    </div>
  );
}
