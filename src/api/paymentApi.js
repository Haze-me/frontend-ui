import api from './axios';

const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data.data;
};

export const initializePayment = (orderId) =>
  api.post(`/api/v1/commerce/payments/initialize/${orderId}`).then(unwrap);

export const verifyPayment = (reference) =>
  api.post(`/api/v1/commerce/payments/verify/${reference}`).then(unwrap);
