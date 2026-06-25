import api from './axios';

const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data.data;
};

export const checkout = (addressId) =>
  api
    .post('/api/v1/commerce/orders/checkout', addressId ? { addressId } : {})
    .then(unwrap);

export const getOrders = (params = {}) =>
  api.get('/api/v1/commerce/orders', { params }).then(unwrap);

export const getOrder = (orderId) =>
  api.get(`/api/v1/commerce/orders/${orderId}`).then(unwrap);
