import { useEffect, useState } from 'react';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../api/authApi';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import './profile.css';

export default function ProfilePage() {
  const toast = useToast();
  const { customer, loginCustomer, customerToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState({ label: '', fullAddress: '', isDefault: false });
  const [showAddr, setShowAddr] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getProfile(), getAddresses()]);
      setProfile({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        email: p.email || '',
      });
      setAddresses(Array.isArray(a) ? a : a?.content || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      toast.success('Profile updated');
      // Keep navbar name in sync.
      const fullName = `${updated?.firstName || profile.firstName} ${updated?.lastName || profile.lastName}`.trim();
      loginCustomer(customerToken, { ...customer, fullName, email: profile.email });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not change password'));
    } finally {
      setSavingPw(false);
    }
  };

  const saveAddr = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      await addAddress(addrForm);
      toast.success('Address added');
      setAddrForm({ label: '', fullAddress: '', isDefault: false });
      setShowAddr(false);
      const a = await getAddresses();
      setAddresses(Array.isArray(a) ? a : a?.content || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add address'));
    } finally {
      setSavingAddr(false);
    }
  };

  const removeAddr = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove address'));
    }
  };

  const makeDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success('Default address updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not set default'));
    }
  };

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  return (
    <div className="page container profile-page">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-grid">
        {/* Personal info */}
        <section className="prof-card">
          <h3>Personal information</h3>
          <form onSubmit={saveProfile}>
            <div className="auth-row">
              <div className="field">
                <label>First name</label>
                <input className="input" value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} required />
              </div>
              <div className="field">
                <label>Last name</label>
                <input className="input" value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} required />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" value={profile.email} disabled />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="prof-card">
          <h3>Change password</h3>
          <form onSubmit={savePassword}>
            <div className="field">
              <label>Current password</label>
              <input className="input" type="password" value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input className="input" type="password" value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input className="input" type="password" value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
            </div>
            <button className="btn btn-primary" disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Addresses */}
        <section className="prof-card prof-addresses">
          <div className="co-card-head">
            <h3>Saved addresses</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAddr((s) => !s)}>
              {showAddr ? 'Cancel' : '+ Add address'}
            </button>
          </div>

          {addresses.length === 0 && !showAddr && (
            <p className="muted">No saved addresses yet.</p>
          )}

          <div className="addr-list">
            {addresses.map((a) => (
              <div key={a.id} className="addr-card">
                <div>
                  <div className="addr-label">
                    {a.label} {a.isDefault && <span className="addr-default">Default</span>}
                  </div>
                  <div className="addr-full">{a.fullAddress}</div>
                </div>
                <div className="addr-actions">
                  {!a.isDefault && (
                    <button className="btn btn-ghost btn-sm" onClick={() => makeDefault(a.id)}>
                      Set default
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm addr-del" onClick={() => removeAddr(a.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddr && (
            <form className="addr-form" onSubmit={saveAddr}>
              <div className="field">
                <label>Label</label>
                <input className="input" placeholder="Home, Office…" value={addrForm.label}
                  onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} required />
              </div>
              <div className="field">
                <label>Full address</label>
                <textarea className="textarea" value={addrForm.fullAddress}
                  onChange={(e) => setAddrForm({ ...addrForm, fullAddress: e.target.value })} required />
              </div>
              <label className="addr-check">
                <input type="checkbox" checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                Set as default
              </label>
              <button className="btn btn-primary" disabled={savingAddr}>
                {savingAddr ? 'Saving…' : 'Save address'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
