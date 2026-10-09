import axios from 'axios';
import type { Category, Brand, Address } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get<any>('/auth/me'),
};

// Category API
export const categoryApi = {
  getAll: () => api.get<any>('/categories'),
  getBySlug: (slug: string) => api.get<any>(`/categories/${slug}`),
  create: (data: Partial<Category>) => api.post<any>('/categories', data),
  update: (id: number, data: Partial<Category>) => api.put<any>(`/categories/${id}`, data),
  delete: (id: number) => api.delete<any>(`/categories/${id}`),
};

// Brand API
export const brandApi = {
  getAll: () => api.get<any>('/brands'),
  getBySlug: (slug: string) => api.get<any>(`/brands/${slug}`),
  create: (data: Partial<Brand>) => api.post<any>('/brands', data),
  update: (id: number, data: Partial<Brand>) => api.put<any>(`/brands/${id}`, data),
  delete: (id: number) => api.delete<any>(`/brands/${id}`),
};

// Product API
export const productApi = {
  getAll: (params?: any) => api.get<any>('/products', { params }),
  getById: (id: number) => api.get<any>(`/products/${id}`),
  getBySlug: (slug: string) => api.get<any>(`/products/slug/${slug}`),
  getFeatured: () => api.get<any>('/products/featured'),
  getRelated: (id: number) => api.get<any>(`/products/${id}/related`),
  create: (data: any) => api.post<any>('/products', data),
  update: (id: number, data: any) => api.put<any>(`/products/${id}`, data),
  delete: (id: number) => api.delete<any>(`/products/${id}`),
  updateStock: (id: number, stock: number) => api.patch<any>(`/products/${id}/stock`, { stockQuantity: stock }),
};

// Cart API
export const cartApi = {
  getCart: () => api.get<any>('/cart'),
  addItem: (productId: number, quantity: number = 1) => api.post<any>('/cart/items', { productId, quantity }),
  updateQuantity: (itemId: number, quantity: number) => api.put<any>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: number) => api.delete<any>(`/cart/items/${itemId}`),
  clearCart: () => api.delete<any>('/cart'),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get<any>('/wishlist'),
  addItem: (productId: number) => api.post<any>(`/wishlist/items/${productId}`),
  removeItem: (productId: number) => api.delete<any>(`/wishlist/items/${productId}`),
  checkItem: (productId: number) => api.get<any>(`/wishlist/check/${productId}`),
};

// Address API
export const addressApi = {
  getAll: () => api.get<any>('/addresses'),
  create: (data: Address) => api.post<any>('/addresses', data),
  update: (id: number, data: Address) => api.put<any>(`/addresses/${id}`, data),
  delete: (id: number) => api.delete<any>(`/addresses/${id}`),
  setDefault: (id: number) => api.patch<any>(`/addresses/${id}/default`),
};

// Order API
export const orderApi = {
  create: (data: any) => api.post<any>('/orders', data),
  getMyOrders: () => api.get<any>('/orders/my-orders'),
  getById: (id: number) => api.get<any>(`/orders/${id}`),
  cancel: (id: number) => api.post<any>(`/orders/${id}/cancel`),
};

// Coupon API
export const couponApi = {
  validate: (code: string, amount: number) => api.get<any>(`/coupons/validate?code=${code}&orderAmount=${amount}`),
  getAll: () => api.get<any>('/coupons'),
  create: (data: any) => api.post<any>('/coupons', data),
  delete: (id: number) => api.delete<any>(`/coupons/${id}`),
};

// Review API
export const reviewApi = {
  getByProduct: (productId: number) => api.get<any>(`/reviews/product/${productId}`),
  create: (data: { productId: number; rating: number; comment: string }) => api.post<any>('/reviews', data),
  getPending: () => api.get<any>('/reviews/pending'),
  approve: (id: number) => api.patch<any>(`/reviews/${id}/approve`),
  delete: (id: number) => api.delete<any>(`/reviews/${id}`),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get<any>('/admin/dashboard'),
  getAllOrders: (params?: any) => api.get<any>('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: string) => api.patch<any>(`/admin/orders/${id}/status`, { status }),
  getAllUsers: (params?: any) => api.get<any>('/admin/users', { params }),
  updateUserStatus: (id: number, status: string) => api.patch<any>(`/admin/users/${id}/status`, { status }),
};

export default api;
