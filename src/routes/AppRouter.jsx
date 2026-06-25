import { Routes, Route, Navigate } from 'react-router-dom';

import CustomerLayout from '../components/common/CustomerLayout';
import VendorLayout from '../components/vendor/VendorLayout';
import CustomerRoutes from './CustomerRoutes';
import VendorRoutes from './VendorRoutes';

// Customer / public pages
import HomePage from '../pages/customer/HomePage';
import ProductsPage from '../pages/customer/ProductsPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import PaymentPage from '../pages/customer/PaymentPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import ProfilePage from '../pages/customer/ProfilePage';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Vendor
import VendorLoginPage from '../pages/vendor/VendorLoginPage';
import VendorRegisterPage from '../pages/vendor/VendorRegisterPage';
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage';
import VendorProductsPage from '../pages/vendor/VendorProductsPage';
import AddProductPage from '../pages/vendor/AddProductPage';
import EditProductPage from '../pages/vendor/EditProductPage';
import InventoryPage from '../pages/vendor/InventoryPage';
import VendorProfilePage from '../pages/vendor/VendorProfilePage';

import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Customer-facing pages share the storefront layout */}
      <Route element={<CustomerLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected customer */}
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <CustomerRoutes>
              <CheckoutPage />
            </CustomerRoutes>
          }
        />
        <Route
          path="/payment/:orderId"
          element={
            <CustomerRoutes>
              <PaymentPage />
            </CustomerRoutes>
          }
        />
        <Route
          path="/orders"
          element={
            <CustomerRoutes>
              <OrdersPage />
            </CustomerRoutes>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <CustomerRoutes>
              <OrderDetailPage />
            </CustomerRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <CustomerRoutes>
              <ProfilePage />
            </CustomerRoutes>
          }
        />
      </Route>

      {/* Vendor login & registration are standalone (no storefront chrome) */}
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/vendor/register" element={<VendorRegisterPage />} />

      {/* Vendor dashboard area */}
      <Route
        element={
          <VendorRoutes>
            <VendorLayout />
          </VendorRoutes>
        }
      >
        <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
        <Route path="/vendor/products" element={<VendorProductsPage />} />
        <Route path="/vendor/products/new" element={<AddProductPage />} />
        <Route path="/vendor/products/:productId/edit" element={<EditProductPage />} />
        <Route path="/vendor/inventory" element={<InventoryPage />} />
        <Route path="/vendor/profile" element={<VendorProfilePage />} />
      </Route>

      {/* Convenience redirect */}
      <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
