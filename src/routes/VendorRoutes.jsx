import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps vendor-only pages. Vendors authenticate at /vendor/login.
export default function VendorRoutes({ children }) {
  const { isVendorLoggedIn } = useAuth();
  const location = useLocation();

  if (!isVendorLoggedIn) {
    return (
      <Navigate to="/vendor/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return children;
}
