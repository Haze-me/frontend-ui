import api from './axios';

const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data.data;
};

export const getCart = () => api.get('/api/v1/commerce/cart').then(unwrap);

export const addCartItem = (productId, quantity) =>
  api.post('/api/v1/commerce/cart/items', { productId, quantity }).then(unwrap);

export const updateCartItem = (cartItemId, quantity) =>
  api
    .put(`/api/v1/commerce/cart/items/${cartItemId}`, { quantity })
    .then(unwrap);

export const removeCartItem = (cartItemId) =>
  api.delete(`/api/v1/commerce/cart/items/${cartItemId}`).then(unwrap);

export const clearCart = () => api.delete('/api/v1/commerce/cart').then(unwrap);
