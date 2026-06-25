import api from './axios';
import axios from 'axios';

// The Django (vendor) service speaks snake_case; the rest of the app uses
// camelCase. Convert responses to camelCase here so page code stays uniform,
// and build request bodies in the exact snake_case Django expects.
const toCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function camelize(value) {
  if (Array.isArray(value)) return value.map(camelize);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [k, v]) => {
      acc[toCamel(k)] = camelize(v);
      return acc;
    }, {});
  }
  return value;
}

const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return camelize(res.data.data);
};

// ---------- Vendor profile & dashboard ----------
// Django exposes the vendor's own record at vendors/profile/ (not /me/).
export const getVendorMe = () =>
  api.get('/api/admin/vendors/profile/').then(unwrap);

// ---------- Product management ----------
// Django's DRF pagination is 1-based; the rest of the app pages from 0.
export const getVendorProducts = (params = {}) => {
  const q = { ...params };
  if (q.page != null) q.page = Number(q.page) + 1;
  return api.get('/api/admin/products/', { params: q }).then(unwrap);
};

export const getVendorProduct = (productId) =>
  api.get(`/api/admin/products/${productId}/`).then(unwrap);

// Map our camelCase form values to Django's product fields. Note: products
// carry no stock field — stock is managed separately via the inventory app.
const toProductBody = (b) => ({
  name: b.name,
  description: b.description || '',
  brand: b.brand || '',
  sku: b.sku,
  price: b.price,
  category: b.categoryId || b.category,
  status: b.status || 'ACTIVE',
});

export const createVendorProduct = (body) =>
  api.post('/api/admin/products/', toProductBody(body)).then(unwrap);

export const updateVendorProduct = (productId, body) =>
  api.put(`/api/admin/products/${productId}/`, toProductBody(body)).then(unwrap);

export const deleteVendorProduct = (productId) =>
  api.delete(`/api/admin/products/${productId}/`).then(unwrap);

// ---------- Inventory ----------
export const getInventory = (productId) =>
  api.get(`/api/admin/inventory/${productId}/`).then(unwrap);

export const updateInventory = (productId, body) =>
  api
    .patch(`/api/admin/inventory/${productId}/`, {
      available_quantity: body.availableQuantity,
      reason: body.reason,
    })
    .then(unwrap);

// ---------- Categories (read-only) ----------
export const getVendorCategories = () =>
  api.get('/api/admin/categories/').then(unwrap);

// ---------- Image uploads ----------
// 1) presign, 2) PUT to S3, 3) attach to product.
export const getImageUploadUrl = (productId, fileName, contentType) =>
  api
    .post('/api/admin/images/presigned-url/', {
      product_id: productId,
      file_name: fileName,
      content_type: contentType,
    })
    .then(unwrap);

// Direct PUT to S3 presigned URL (no auth header, no gateway).
export const uploadToS3 = (uploadUrl, file) =>
  axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });

export const attachProductImage = (productId, imageUrl, isPrimary) =>
  api
    .post(`/api/admin/products/${productId}/images/`, {
      image_url: imageUrl,
      is_primary: isPrimary,
    })
    .then(unwrap);

// Full upload flow for one file: presign -> PUT to S3 -> attach to product.
export const uploadProductImage = async (productId, file, isPrimary = false) => {
  const { uploadUrl, imageUrl } = await getImageUploadUrl(
    productId,
    file.name,
    file.type
  );
  await uploadToS3(uploadUrl, file);
  return attachProductImage(productId, imageUrl, isPrimary);
};
