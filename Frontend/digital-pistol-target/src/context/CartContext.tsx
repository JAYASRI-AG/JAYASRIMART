import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
    } catch {
      // Ignored if user not logged in or cart empty
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      showToast('Please login to add items to your cart', 'info');
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.data && res.data.data) {
        setCart(res.data.data);
        showToast('Added to cart successfully!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      showToast(msg, 'error');
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data && res.data.data) {
        setCart(res.data.data);
        showToast('Item removed from cart', 'info');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart((prev) => (prev ? { ...prev, items: [], subtotal: 0, itemCount: 0 } : null));
    } catch {
      // Ignored
    }
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
