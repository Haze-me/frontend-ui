import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps customer-only pages. If not logged in, redirect to /login and
// remember where we came from so we can return after login (rule #3).
export default function CustomerRoutes({ children }) {
  const { isCustomerLoggedIn } = useAuth();
  const location = useLocation();

  if (!isCustomerLoggedIn) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return children;
}
