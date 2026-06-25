import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { registerCustomer } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isCustomerLoggedIn, loginCustomer } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rule #12: a logged-in customer visiting /register goes home.
  if (isCustomerLoggedIn) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerCustomer(form);
      // Backend returns a token on register — log straight in.
      loginCustomer(data.accessToken, {
        customerId: data.customerId,
        email: data.email,
        fullName: data.fullName,
      });
      toast.success('Account created. Welcome to Chyno-Shop!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-wrap">
      <div className="auth-card wide">
        <div className="auth-head">
          <h1>Create your account</h1>
          <p>Join Chyno-Shop and start shopping</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="auth-row">
            <div className="field">
              <label>First name</label>
              <input className="input" name="firstName" value={form.firstName} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Last name</label>
              <input className="input" name="lastName" value={form.lastName} onChange={onChange} required />
            </div>
          </div>

          <div className="field">
            <label>Email address</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label>Phone number</label>
            <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="080..." required />
          </div>

          <div className="field pw-field">
            <label>Password</label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="At least 6 characters"
              required
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login" className="link-accent">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
