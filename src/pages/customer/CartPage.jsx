import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/common/Spinner';
import './cart.css';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#eef2f7"/></svg>`
  );

export default function CartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isCustomerLoggedIn } = useAuth();
  const { items, subtotal, totalItems, loading, updateItem, removeItem, clearCart } = useCart();
  const [busyId, setBusyId] = useState(null);

  if (!isCustomerLoggedIn) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Your cart is waiting</h3>
          <p>Log in to view your cart and check out.</p>
          <Link to="/login" state={{ from: '/cart' }} className="btn btn-primary" style={{ marginTop: 16 }}>
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <div className="page"><Spinner fullPage /></div>;
  }

  const changeQty = async (item, nextQty) => {
    if (nextQty < 1) return;
    setBusyId(item.id);
    try {
      await updateItem(item.id, nextQty);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update quantity'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    setBusyId(item.id);
    try {
      await removeItem(item.id);
      toast.success('Item removed');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove item'));
    } finally {
      setBusyId(null);
    }
  };

  const empty = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not clear cart'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog and add some tech to your cart.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container cart-page">
      <div className="cart-head">
        <h1>Your Cart <span className="muted">({totalItems} item{totalItems === 1 ? '' : 's'})</span></h1>
        <button className="btn btn-ghost btn-sm" onClick={empty}>Clear cart</button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className={`cart-item ${busyId === item.id ? 'busy' : ''}`}>
              <Link to={`/products/${item.productId}`} className="ci-img">
                <img
                  src={item.productImageUrl || PLACEHOLDER}
                  alt={item.productName}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
              </Link>

              <div className="ci-info">
                <Link to={`/products/${item.productId}`} className="ci-name">
                  {item.productName}
                </Link>
                <div className="ci-unit">{formatCurrency(item.unitPrice)} each</div>
                {item.inStock === false && (
                  <span className="ci-oos">Out of stock</span>
                )}
              </div>

              <div className="ci-qty">
                <button onClick={() => changeQty(item, item.quantity - 1)} disabled={busyId === item.id || item.quantity <= 1}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQty(item, item.quantity + 1)} disabled={busyId === item.id}>+</button>
              </div>

              <div className="ci-total">{formatCurrency(item.lineTotal)}</div>

              <button className="ci-remove" onClick={() => remove(item)} disabled={busyId === item.id} aria-label="Remove">
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cs-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="cs-row muted">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cs-divider" />
          <div className="cs-row cs-total">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <button className="btn btn-accent btn-block btn-lg" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="cs-continue">← Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
