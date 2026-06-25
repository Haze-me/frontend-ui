import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCustomerToken,
  setCustomerToken,
  clearCustomerToken,
  getVendorToken,
  setVendorToken,
  clearVendorToken,
  isTokenExpired,
} from '../utils/tokenUtils';

const AuthContext = createContext(null);

const CUSTOMER_DATA_KEY = 'customer_data';
const VENDOR_DATA_KEY = 'vendor_data';

export function AuthProvider({ children }) {
  const [customerToken, setCustTok] = useState(() => {
    const t = getCustomerToken();
    return t && !isTokenExpired(t) ? t : null;
  });
  const [vendorToken, setVendTok] = useState(() => {
    const t = getVendorToken();
    return t && !isTokenExpired(t) ? t : null;
  });

  const [customer, setCustomer] = useState(() => {
    const raw = localStorage.getItem(CUSTOMER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [vendor, setVendor] = useState(() => {
    const raw = localStorage.getItem(VENDOR_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  // Clean up if a stored token was already expired on load.
  useEffect(() => {
    if (getCustomerToken() && isTokenExpired(getCustomerToken())) {
      clearCustomerToken();
      localStorage.removeItem(CUSTOMER_DATA_KEY);
    }
    if (getVendorToken() && isTokenExpired(getVendorToken())) {
      clearVendorToken();
      localStorage.removeItem(VENDOR_DATA_KEY);
    }
  }, []);

  const loginCustomer = (token, customerData) => {
    setCustomerToken(token);
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customerData));
    setCustTok(token);
    setCustomer(customerData);
  };

  const logoutCustomer = () => {
    clearCustomerToken();
    localStorage.removeItem(CUSTOMER_DATA_KEY);
    setCustTok(null);
    setCustomer(null);
  };

  const loginVendor = (token, vendorData) => {
    setVendorToken(token);
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(vendorData));
    setVendTok(token);
    setVendor(vendorData);
  };

  const logoutVendor = () => {
    clearVendorToken();
    localStorage.removeItem(VENDOR_DATA_KEY);
    setVendTok(null);
    setVendor(null);
  };

  const value = {
    customerToken,
    vendorToken,
    customer,
    vendor,
    isCustomerLoggedIn: !!customerToken,
    isVendorLoggedIn: !!vendorToken,
    loginCustomer,
    loginVendor,
    logoutCustomer,
    logoutVendor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
