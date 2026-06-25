import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAddresses, addAddress } from '../../api/authApi';
import { checkout } from '../../api/orderApi';
import { getApiErrorMessage } from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/common/Spinner';
import './checkout.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, subtotal, totalItems, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ label: '', fullAddress: '', isDefault: false });
  const [savingAddr, setSavingAddr] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      const list = Array.isArray(data) ? data : data?.content || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      setSelectedId(def ? def.id : null);
      setShowForm(list.length === 0); // Rule #5: prompt to add if none exist
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load addresses'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const created = await addAddress(form);
      toast.success('Address added');
      setForm({ label: '', fullAddress: '', isDefault: false });
      setShowForm(false);
      await loadAddresses();
      if (created?.id) setSelectedId(created.id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save address'));
    } finally {
      setSavingAddr(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedId) {
      toast.error('Please select a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const order = await checkout(selectedId);
      await refreshCart(); // backend empties the cart on checkout
      toast.success('Order placed! Complete your payment.');
      navigate(`/payment/${order.id}`, { replace: true }); // Rule #6
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not place order'));
      setPlacing(false);
    }
  };

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  // No items to check out
  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Nothing to check out</h3>
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container checkout-page">
      <h1 className="co-title">Checkout</h1>

      <div className="co-layout">
        <div className="co-main">
          {/* Address selection */}
          <section className="co-card">
            <div className="co-card-head">
              <h3>Delivery address</h3>
              {addresses.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowForm((s) => !s)}>
                  {showForm ? 'Cancel' : '+ Add new'}
                </button>
              )}
            </div>

            {addresses.length === 0 && !showForm && (
              <p className="muted">You have no saved addresses yet. Add one below.</p>
            )}

            <div className="addr-list">
              {addresses.map((a) => (
                <label key={a.id} className={`addr-option ${selectedId === a.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedId === a.id}
                    onChange={() => setSelectedId(a.id)}
                  />
                  <div>
                    <div className="addr-label">
                      {a.label} {a.isDefault && <span className="addr-default">Default</span>}
                    </div>
                    <div className="addr-full">{a.fullAddress}</div>
                  </div>
                </label>
              ))}
            </div>

            {showForm && (
              <form className="addr-form" onSubmit={saveAddress}>
                <div className="field">
                  <label>Label</label>
                  <input
                    className="input"
                    placeholder="Home, Office…"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Full address</label>
                  <textarea
                    className="textarea"
                    placeholder="Street, city, state, landmark…"
                    value={form.fullAddress}
                    onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                    required
                  />
                </div>
                <label className="addr-check">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  Set as default address
                </label>
                <button type="submit" className="btn btn-primary" disabled={savingAddr}>
                  {savingAddr ? 'Saving…' : 'Save address'}
                </button>
              </form>
            )}
          </section>

          {/* Items review */}
          <section className="co-card">
            <h3>Items ({totalItems})</h3>
            <div className="co-items">
              {items.map((item) => (
                <div key={item.id} className="co-item">
                  <span className="co-item-name">
                    {item.productName} <span className="muted">× {item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="co-summary">
          <h3>Order Summary</h3>
          <div className="cs-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="cs-divider" />
          <div className="cs-row cs-total">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <button
            className="btn btn-accent btn-block btn-lg"
            onClick={placeOrder}
            disabled={placing || !selectedId}
          >
            {placing ? 'Placing order…' : 'Place Order'}
          </button>
          <p className="co-note">You'll complete payment securely via Paystack.</p>
        </aside>
      </div>
    </div>
  );
}
