import axios from 'axios';
import {
  getCustomerToken,
  getVendorToken,
  clearCustomerToken,
  clearVendorToken,
} from '../utils/tokenUtils';

// All calls go through the API Gateway — never the services directly.
export const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the right bearer token based on the route being called.
// Vendor endpoints live under /api/admin and /api/v1/inventory.
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isVendorRoute =
    url.includes('/api/admin') || url.includes('/api/v1/inventory');

  const token = isVendorRoute ? getVendorToken() : getCustomerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the relevant token and bounce to the matching login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401) {
      const isVendorRoute =
        url.includes('/api/admin') || url.includes('/api/v1/inventory');
      if (isVendorRoute) {
        clearVendorToken();
        if (!window.location.pathname.startsWith('/vendor/login')) {
          window.location.assign('/vendor/login');
        }
      } else {
        clearCustomerToken();
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')
        ) {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to pull a friendly message out of any error shape. Validation
// responses carry field-level detail in `errors` (Django: [{field,message}],
// commerce/catalog: ["field: message"]); surface that instead of the generic
// "Validation failed" so the user knows exactly what to fix.
export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;

  const errs = data?.errors;
  if (Array.isArray(errs) && errs.length) {
    return errs
      .map((e) => {
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object') {
          return e.field ? `${e.field}: ${e.message}` : e.message || JSON.stringify(e);
        }
        return String(e);
      })
      .join(' · ');
  }

  if (typeof errs === 'string' && errs) return errs;
  if (data?.message) return data.message;
  return error?.message || fallback;
}

export default api;
