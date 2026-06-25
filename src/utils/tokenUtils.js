// LocalStorage keys for the two token types
export const CUSTOMER_TOKEN_KEY = 'customer_token';
export const VENDOR_TOKEN_KEY = 'vendor_token';

export const getCustomerToken = () =>
  localStorage.getItem(CUSTOMER_TOKEN_KEY);
export const setCustomerToken = (t) =>
  localStorage.setItem(CUSTOMER_TOKEN_KEY, t);
export const clearCustomerToken = () =>
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);

export const getVendorToken = () => localStorage.getItem(VENDOR_TOKEN_KEY);
export const setVendorToken = (t) => localStorage.setItem(VENDOR_TOKEN_KEY, t);
export const clearVendorToken = () =>
  localStorage.removeItem(VENDOR_TOKEN_KEY);

// Decode a JWT payload without verifying the signature (client-side display only)
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Returns true if the JWT has an `exp` claim in the past
export function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
}
