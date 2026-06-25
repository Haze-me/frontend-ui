import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorProducts, deleteVendorProduct, getInventory } from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import './vendorPages.css';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46"><rect width="46" height="46" fill="#eef2f7"/></svg>`);

function thumb(p) {
  const imgs = p.images;
  if (Array.isArray(imgs) && imgs.length) {
    const first = imgs.find((i) => i?.isPrimary) || imgs[0];
    if (typeof first === 'string') return first;
    return first?.imageUrl || first?.url || PLACEHOLDER;
  }
  return p.primaryImageUrl || PLACEHOLDER;
}

export default function VendorProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [stockMap, setStockMap] = useState({}); // productId -> availableQuantity

  const load = async () => {
    setLoading(true);
    try {
      const query = { page };
      if (search) query.search = search;
      if (status) query.status = status;
      const data = await getVendorProducts(query);
      const list = data?.content || (Array.isArray(data) ? data : []);
      setProducts(list);
      setTotalPages(data?.totalPages || 0);
      // Products have no stock field — fetch available stock from inventory.
      const invs = await Promise.all(
        list.map((p) => getInventory(p.id).then((inv) => [p.id, inv?.availableQuantity ?? 0]).catch(() => [p.id, null]))
      );
      setStockMap(Object.fromEntries(invs));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await deleteVendorProduct(p.id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete product'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="vp-head">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <Link to="/vendor/products/new" className="btn btn-accent">＋ Add Product</Link>
      </div>

      <div className="vp-table-wrap">
        <div className="vp-toolbar">
          <form
            style={{ display: 'flex', gap: 8, flex: 1 }}
            onSubmit={(e) => { e.preventDefault(); setPage(0); setSearch(searchInput.trim()); }}
          >
            <input
              className="input"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">Search</button>
          </form>
          <select
            className="select"
            value={status}
            onChange={(e) => { setPage(0); setStatus(e.target.value); }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Add your first product to get started.</p>
            <Link to="/vendor/products/new" className="btn btn-primary" style={{ marginTop: 14 }}>
              ＋ Add Product
            </Link>
          </div>
        ) : (
          <table className="vp-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ opacity: deletingId === p.id ? 0.5 : 1 }}>
                  <td>
                    <img className="vp-thumb" src={thumb(p)} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="muted">{p.sku || '—'}</td>
                  <td>{formatCurrency(p.price)}</td>
                  {(() => {
                    const qty = stockMap[p.id];
                    const n = Number(qty);
                    return (
                      <td className={qty == null ? '' : n === 0 ? 'out-stock' : n < 5 ? 'low-stock' : ''}>
                        {qty == null ? '—' : qty}
                      </td>
                    );
                  })()}
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/vendor/products/${p.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)' }}
                        onClick={() => remove(p)}
                        disabled={deletingId === p.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
