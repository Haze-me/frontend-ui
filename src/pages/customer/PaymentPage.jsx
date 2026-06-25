import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getOrder } from '../../api/orderApi';
import { getProductNames } from '../../api/catalogApi';
import { initializePayment, verifyPayment } from '../../api/paymentApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import './payment.css';

export default function PaymentPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null); // { paymentStatus, orderStatus }
  const [names, setNames] = useState({});

  // Paystack appends the reference to the callback URL on return.
  const reference = params.get('reference') || params.get('trxref');

  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      const map = await getProductNames((data?.items || []).map((i) => i.productId));
      setNames(map);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load order'));
    }
  }, [orderId, toast]);

  const runVerify = useCallback(
    async (ref) => {
      setVerifying(true);
      try {
        const data = await verifyPayment(ref);
        setResult(data);
        const ok = (data.paymentStatus || '').toUpperCase() === 'PAID' ||
          (data.orderStatus || '').toUpperCase() === 'PAID' ||
          (data.orderStatus || '').toUpperCase() === 'COMPLETED';
        if (ok) toast.success('Payment confirmed!');
        else toast.error('Payment was not successful.');
        await loadOrder();
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not verify payment'));
      } finally {
        setVerifying(false);
      }
    },
    [toast, loadOrder]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadOrder();
      if (active && reference) await runVerify(reference); // Rule #7: auto-verify on return
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const payNow = async () => {
    setPaying(true);
    try {
      const data = await initializePayment(orderId);
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl; // redirect to Paystack
      } else {
        toast.error('No payment URL returned.');
        setPaying(false);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start payment'));
      setPaying(false);
    }
  };

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  if (!order) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Order not found</h3>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>View orders</Link>
        </div>
      </div>
    );
  }

  const status = (result?.orderStatus || order.status || '').toUpperCase();
  const isPaid = status === 'PAID' || status === 'COMPLETED';
  const isFailed = status === 'FAILED' || status === 'CANCELLED';
  const canPay = !isPaid && !isFailed;

  return (
    <div className="page container pay-page">
      <div className="pay-card">
        {/* Result banner */}
        {isPaid && (
          <div className="pay-result success">
            <div className="pay-icon">✓</div>
            <h2>Payment successful</h2>
            <p>Your order has been confirmed. Thank you for shopping with Chyno-Shop!</p>
          </div>
        )}
        {isFailed && (
          <div className="pay-result failed">
            <div className="pay-icon">✕</div>
            <h2>Payment {status === 'CANCELLED' ? 'cancelled' : 'failed'}</h2>
            <p>Your payment didn't go through. You can try again below.</p>
          </div>
        )}
        {verifying && (
          <div className="pay-result">
            <Spinner />
            <h2>Verifying payment…</h2>
          </div>
        )}

        {/* Order summary */}
        <div className="pay-summary">
          <div className="pay-head">
            <div>
              <span className="muted">Order</span>
              <h3>#{String(order.id).slice(0, 8)}</h3>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="pay-items">
            {(order.items || []).map((it, i) => (
              <div key={i} className="pay-item">
                <span>
                  {it.productName || names[it.productId] || `Product ${String(it.productId).slice(0, 6)}`}{' '}
                  <span className="muted">× {it.quantity}</span>
                </span>
                <span>{formatCurrency(it.lineTotal ?? it.unitPrice * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pay-total">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        {canPay && !verifying && (
          <button className="btn btn-accent btn-block btn-lg" onClick={payNow} disabled={paying}>
            {paying ? 'Redirecting to Paystack…' : `Pay ${formatCurrency(order.totalAmount)}`}
          </button>
        )}
        {(isPaid || isFailed) && (
          <div className="pay-actions">
            {isFailed && (
              <button className="btn btn-accent btn-lg" onClick={payNow} disabled={paying}>
                {paying ? 'Redirecting…' : 'Try again'}
              </button>
            )}
            <Link to={`/orders/${order.id}`} className="btn btn-outline btn-lg">View order</Link>
            <Link to="/products" className="btn btn-ghost btn-lg">Continue shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}
