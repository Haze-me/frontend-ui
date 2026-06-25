import api from './axios';

// All responses follow the envelope: { success, message, data, ... }
// We return response.data.data (the payload) on success, else throw.
const unwrap = (res) => {
  if (res?.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data.data;
};

// ---------- Customer auth ----------
export const registerCustomer = (body) =>
  api.post('/api/v1/commerce/auth/register', body).then(unwrap);

export const loginCustomer = (body) =>
  api.post('/api/v1/commerce/auth/login', body).then(unwrap);

// ---------- Customer profile ----------
export const getProfile = () =>
  api.get('/api/v1/commerce/profile').then(unwrap);

export const updateProfile = (body) =>
  api.put('/api/v1/commerce/profile', body).then(unwrap);

export const changePassword = (body) =>
  api.post('/api/v1/commerce/profile/change-password', body).then(unwrap);

// ---------- Customer addresses ----------
export const getAddresses = () =>
  api.get('/api/v1/commerce/addresses').then(unwrap);

export const addAddress = (body) =>
  api.post('/api/v1/commerce/addresses', body).then(unwrap);

export const deleteAddress = (addressId) =>
  api.delete(`/api/v1/commerce/addresses/${addressId}`).then(unwrap);

export const setDefaultAddress = (addressId) =>
  api.put(`/api/v1/commerce/addresses/${addressId}/default`).then(unwrap);

// ---------- Vendor auth ----------
// Trailing slashes required: Django has APPEND_SLASH on and errors on POST without one.
export const loginVendor = (body) =>
  api.post('/api/admin/auth/login/', body).then(unwrap);

export const refreshVendorToken = (refresh) =>
  api.post('/api/admin/auth/token/refresh/', { refresh }).then(unwrap);

// Vendor self-registration — creates a PENDING account awaiting admin approval.
export const registerVendor = (body) =>
  api
    .post('/api/admin/auth/vendor/register/', {
      email: body.email,
      password: body.password,
      confirm_password: body.confirmPassword,
    })
    .then(unwrap);
