import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY = { cartId: null, items: [], subtotal: 0, totalItems: 0 };

export function CartProvider({ children }) {
  const { isCustomerLoggedIn } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const applyCart = (data) => {
    setCart({
      cartId: data?.cartId ?? null,
      items: data?.items ?? [],
      subtotal: data?.subtotal ?? 0,
      totalItems: data?.totalItems ?? 0,
    });
  };

  const refreshCart = useCallback(async () => {
    if (!isCustomerLoggedIn) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      applyCart(data);
    } catch {
      // leave cart as-is; surfacing handled by caller where relevant
    } finally {
      setLoading(false);
    }
  }, [isCustomerLoggedIn]);

  // Sync with backend whenever auth state changes (rule #4).
  useEffect(() => {
    if (isCustomerLoggedIn) refreshCart();
    else setCart(EMPTY);
  }, [isCustomerLoggedIn, refreshCart]);

  // The commerce add/update/remove endpoints don't reliably return the updated
  // cart (the add response comes back empty), so after every mutation we re-read
  // the authoritative cart with GET /cart. This keeps the navbar count and cart
  // page in sync in real time.
  const addItem = async (productId, quantity = 1) => {
    await cartApi.addCartItem(productId, quantity);
    await refreshCart();
  };

  const updateItem = async (cartItemId, quantity) => {
    await cartApi.updateCartItem(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await cartApi.removeCartItem(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setCart(EMPTY);
  };

  const value = {
    ...cart,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
