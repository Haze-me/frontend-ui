import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorProducts, getInventory, updateInventory } from '../../api/vendorApi';
import { getApiErrorMessage } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import './vendorPages.css';

const LOW_STOCK = 5;

export default function InventoryPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]); // { product, inventory }
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // productId
  const [editVal, setEditVal] = useState({ availableQuantity: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getVendorProducts({ page: 0, size: 200 });
      const products = data?.content || (Array.isArray(data) ? data : []);
      const withInv = await Promise.all(
        products.map(async (p) => {
          const inv = await getInventory(p.id).catch(() => null);
          return { product: p, inventory: inv };
        })
      );
      setRows(withInv);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load inventory'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditing(row.product.id);
    setEditVal({
      availableQuantity: row.inventory?.availableQuantity ?? row.product.stockQuantity ?? 0,
      reason: '',
    });
  };

  const save = async (productId) => {
    if (!editVal.reason.trim()) {
      toast.error('Please provide a reason for the change');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateInventory(productId, {
        availableQuantity: Number(editVal.availableQuantity),
        reason: editVal.reason.trim(),
      });
      setRows((prev) =>
        prev.map((r) => (r.product.id === productId ? { ...r, inventory: updated || r.inventory } : r))
      );
      toast.success('Inventory updated');
      setEditing(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update inventory'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div>
      <div className="vp-head">
        <div>
          <h1>Inventory</h1>
          <p>Track and adjust stock levels. Items under {LOW_STOCK} units are flagged.</p>
        </div>
      </div>

      <div className="vp-table-wrap">
        {rows.length === 0 ? (
          <div className="empty-state">
            <h3>No products to track</h3>
            <Link to="/vendor/products/new" className="btn btn-primary" style={{ marginTop: 14 }}>
              ＋ Add Product
            </Link>
          </div>
        ) : (
          <table className="vp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Sold</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, inventory }) => {
                const avail = inventory?.availableQuantity ?? product.stockQuantity ?? 0;
                const isEditing = editing === product.id;
                const low = avail < LOW_STOCK;
                return (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600 }}>
                      {product.name}
                      {low && <span className="badge" style={{ marginLeft: 8, background: 'var(--warning-bg)', color: 'var(--warning)' }}>Low</span>}
                    </td>
                    <td className="muted">{inventory?.productSku || product.sku || '—'}</td>
                    <td>
                      {isEditing ? (
                        <input
                          className="input"
                          type="number"
                          min="0"
                          style={{ width: 90, padding: '7px 9px' }}
                          value={editVal.availableQuantity}
                          onChange={(e) => setEditVal({ ...editVal, availableQuantity: e.target.value })}
                        />
                      ) : (
                        <span className={avail === 0 ? 'out-stock' : low ? 'low-stock' : ''}>{avail}</span>
                      )}
                    </td>
                    <td>{inventory?.reservedQuantity ?? 0}</td>
                    <td>{inventory?.soldQuantity ?? 0}</td>
                    <td>{inventory?.totalStock ?? avail}</td>
                    <td>
                      {isEditing ? (
                        <div className="inv-edit">
                          <input
                            className="input"
                            placeholder="Reason"
                            style={{ width: 150, padding: '7px 9px' }}
                            value={editVal.reason}
                            onChange={(e) => setEditVal({ ...editVal, reason: e.target.value })}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => save(product.id)} disabled={saving}>
                            {saving ? '…' : 'Save'}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit({ product, inventory })}>
                          Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
