import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { registerVendor } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../auth/auth.css';

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isVendorLoggedIn } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isVendorLoggedIn) return <Navigate to="/vendor/dashboard" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerVendor(form);
      toast.success('Vendor account created — awaiting admin approval.');
      navigate('/vendor/login', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create vendor account'));
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
          <span className="auth-badge">BECOME A VENDOR</span>
          <h1>Create a vendor account</h1>
          <p>Start selling on Chyno-Shop. New accounts are reviewed before activation.</p>
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
              placeholder="At least 8 characters"
              required
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="field">
            <label>Confirm password</label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-dark btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Vendor Account'}
          </button>
        </form>

        <p className="auth-foot">
          Already a vendor? <Link to="/vendor/login" className="link-accent">Vendor login</Link>
        </p>
      </div>
    </div>
  );
}
