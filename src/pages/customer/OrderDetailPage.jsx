import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../../api/orderApi';
import { getProductNames } from '../../api/catalogApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import './orders.css';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrder(orderId)
      .then(async (data) => {
        if (!active) return;
        setOrder(data);
        const map = await getProductNames((data?.items || []).map((i) => i.productId));
        if (active) setNames(map);
      })
      .catch((err) => active && toast.error(getApiErrorMessage(err, 'Could not load order')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  if (!order) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Order not found</h3>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Back to orders</Link>
        </div>
      </div>
    );
  }

  const status = (order.status || '').toUpperCase();
  const canPay = status === 'PAYMENT_PENDING' || status === 'FAILED';

  return (
    <div className="page container od-page">
      <Link to="/orders" className="od-back">← Back to orders</Link>

      <div className="od-header">
        <div>
          <h1>Order #{String(order.id).slice(0, 8)}</h1>
          <div className="muted">Placed {formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="od-layout">
        <div className="od-card">
          <h3>Items</h3>
          <div className="od-items">
            {(order.items || []).map((it, i) => (
              <div key={i} className="od-item">
                <div>
                  <div className="od-item-name">
                    {it.productName || names[it.productId] || `Product ${String(it.productId).slice(0, 8)}`}
                  </div>
                  <div className="od-item-sub">
                    {formatCurrency(it.unitPrice)} × {it.quantity}
                  </div>
                </div>
                <div className="od-item-total">
                  {formatCurrency(it.lineTotal ?? it.unitPrice * it.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="od-side">
          <div className="od-card">
            <h3>Summary</h3>
            <div className="od-meta-row">
              <span className="muted">Status</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="od-meta-row">
              <span className="muted">Items</span>
              <span>{(order.items || []).length}</span>
            </div>
            <div className="od-meta-row od-grand">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {canPay && (
              <Link to={`/payment/${order.id}`} className="btn btn-accent btn-block" style={{ marginTop: 16 }}>
                Complete payment
              </Link>
            )}
          </div>

          {order.shippingAddress && (
            <div className="od-card">
              <h3>Shipping address</h3>
              <p className="od-address">
                {typeof order.shippingAddress === 'string'
                  ? order.shippingAddress
                  : order.shippingAddress.fullAddress || order.shippingAddress.label}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
