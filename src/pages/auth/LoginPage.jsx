import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { loginCustomer as loginCustomerApi } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isCustomerLoggedIn, isVendorLoggedIn, loginCustomer } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/';

  // Rule #11: a logged-in vendor visiting /login goes to their dashboard.
  if (isVendorLoggedIn) return <Navigate to="/vendor/dashboard" replace />;
  // Already a logged-in customer? Send them home.
  if (isCustomerLoggedIn) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginCustomerApi(form);
      loginCustomer(data.accessToken, {
        customerId: data.customerId,
        email: data.email,
        fullName: data.fullName,
      });
      toast.success('Welcome back!');
      navigate(from, { replace: true }); // Rule #3: return to where they came from
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <h1>Welcome back</h1>
          <p>Sign in to your Chyno-Shop account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email address</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
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

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-foot">
          Don't have an account? <Link to="/register" className="link-accent">Create one</Link>
        </p>
        <p className="auth-foot" style={{ marginTop: 8 }}>
          Are you a vendor? <Link to="/vendor/login" className="link-accent">Vendor login</Link>
        </p>
      </div>
    </div>
  );
}
