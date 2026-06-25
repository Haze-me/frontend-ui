import { useState } from 'react';
import '../../pages/vendor/vendorPages.css';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'DRAFT'];

// Shared create/edit form. The parent owns submission (create vs update) and
// image upload, since image uploads need a product id.
export default function ProductForm({
  categories = [],
  initial = {},
  submitLabel = 'Save',
  onSubmit,
  onCancel,
  // Image section — picked files upload as part of the parent's onSubmit.
  existingImages = [],
  files = [],
  onFilesPicked,
}) {
  const [form, setForm] = useState({
    name: initial.name || '',
    brand: initial.brand || '',
    sku: initial.sku || '',
    description: initial.description || '',
    price: initial.price ?? '',
    categoryId: initial.categoryId || '',
    status: initial.status || 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="vp-form-card" onSubmit={submit}>
      <div className="field">
        <label>Product name</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>

      <div className="vp-form-row">
        <div className="field">
          <label>Brand</label>
          <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        </div>
        <div className="field">
          <label>SKU</label>
          <input className="input" value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
        </div>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="vp-form-row">
        <div className="field">
          <label>Price (₦)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Status</label>
        <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <p className="muted" style={{ fontSize: '0.82rem', marginTop: -6, marginBottom: 14 }}>
        Stock is managed on the <strong>Inventory</strong> page after the product is created.
      </p>

      {/* Images */}
      <div className="field">
        <label>Product images</label>
        <div className="img-uploader">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFilesPicked && onFilesPicked([...e.target.files])}
          />
          <p style={{ marginTop: 8, fontSize: '0.82rem' }}>
            {files.length > 0
              ? `${files.length} new image${files.length === 1 ? '' : 's'} will upload when you save.`
              : 'Select one or more images — they upload when you save.'}
          </p>

          {(existingImages.length > 0 || files.length > 0) && (
            <div className="img-preview-row">
              {existingImages.map((src, i) => (
                <img key={`e${i}`} className="img-preview" src={src} alt="" />
              ))}
              {files.map((f, i) => (
                <img key={`f${i}`} className="img-preview" src={URL.createObjectURL(f)} alt="" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="vp-form-actions">
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
