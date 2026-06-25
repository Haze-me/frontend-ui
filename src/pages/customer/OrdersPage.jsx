import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../api/orderApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import './orders.css';

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrders({ page, size: PAGE_SIZE })
      .then((data) => {
        if (!active) return;
        setOrders(data?.content || []);
        setTotalPages(data?.totalPages || 0);
      })
      .catch((err) => active && toast.error(getApiErrorMessage(err, 'Could not load orders')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading) return <div className="page"><Spinner fullPage /></div>;

  return (
    <div className="page container orders-page">
      <h1 className="orders-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <h3>No orders yet</h3>
          <p>When you place an order, it'll show up here.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="order-list">
            {orders.map((order) => (
              <Link to={`/orders/${order.id}`} key={order.id} className="order-row">
                <div className="or-main">
                  <div className="or-id">Order #{String(order.id).slice(0, 8)}</div>
                  <div className="or-meta muted">
                    {formatDate(order.createdAt)} · {(order.items || []).length} item
                    {(order.items || []).length === 1 ? '' : 's'}
                  </div>
                </div>
                <StatusBadge status={order.status} />
                <div className="or-total">{formatCurrency(order.totalAmount)}</div>
                <span className="or-arrow">›</span>
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
