import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/home/HomePage';
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AccountPage from './pages/account/AccountPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { AlertCircle } from 'lucide-react';

// 404 Page Component
function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--surface)', padding: '48px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <AlertCircle size={56} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          Return to JayasriMart Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    {/* Public Browsing Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/category/:slug" element={<ShopPage />} />
                    <Route path="/brand/:slug" element={<ShopPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Customer Protected Routes */}
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account" 
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account/*" 
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Admin Protected Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
