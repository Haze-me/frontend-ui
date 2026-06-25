import api from './axios';

const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data.data;
};

// Public — no token required. The catalog browse endpoint is 1-indexed; the
// app pages from 0, so shift here. It also accepts search/categoryId/brand/
// price filters and sort tokens (price_asc|price_desc|newest|rating) directly.
export const getProducts = (params = {}) => {
  const q = { ...params };
  if (q.page != null) q.page = Number(q.page) + 1;
  return api.get('/api/v1/catalog/products', { params: q }).then(unwrap);
};

// Kept for call-site compatibility — the backend now sorts server-side.
export const getProductsSorted = (params = {}) => getProducts(params);

// Product detail is served by slug at `/products/{slug}`, so a productId UUID
// 404s there; `/products/by-id/{productId}` returns the same payload by id.
export const getProduct = (productId) =>
  api.get(`/api/v1/catalog/products/by-id/${productId}`).then(unwrap);

// Legacy slug lookup, if ever needed.
export const getProductBySlug = (slug) =>
  api.get(`/api/v1/catalog/products/${slug}`).then(unwrap);

export const searchProducts = (q, params = {}) =>
  api
    .get('/api/v1/catalog/products/search', { params: { q, ...params } })
    .then(unwrap);

// Order items only carry productId; fetch names for a set of ids → { id: name }.
export const getProductNames = async (ids = []) => {
  const unique = [...new Set(ids.filter(Boolean))];
  const entries = await Promise.all(
    unique.map((id) =>
      getProduct(id)
        .then((p) => [id, p?.name])
        .catch(() => [id, null])
    )
  );
  return Object.fromEntries(entries.filter(([, name]) => name));
};

export const getCategories = () =>
  api.get('/api/v1/catalog/categories').then(unwrap);

export const getCategory = (categoryId) =>
  api.get(`/api/v1/catalog/categories/${categoryId}`).then(unwrap);
