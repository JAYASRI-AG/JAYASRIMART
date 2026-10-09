import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { Wishlist } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  itemCount: number;
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data && res.data.data) {
        setWishlist(res.data.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: number): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      showToast('Please login to save to wishlist', 'info');
      window.location.href = '/login';
      return;
    }

    const inList = isInWishlist(productId);
    try {
      if (inList) {
        const res = await api.delete(`/wishlist/${productId}`);
        if (res.data && res.data.data) {
          setWishlist(res.data.data);
          showToast('Removed from wishlist', 'info');
        }
      } else {
        const res = await api.post(`/wishlist/${productId}`);
        if (res.data && res.data.data) {
          setWishlist(res.data.data);
          showToast('Added to wishlist!', 'success');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update wishlist';
      showToast(msg, 'error');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data && res.data.data) {
        setWishlist(res.data.data);
        showToast('Removed from wishlist', 'info');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove from wishlist';
      showToast(msg, 'error');
    }
  };

  const itemCount = wishlist?.itemCount || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        itemCount,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
