import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User as UserIcon, Menu, X, ShieldAlert, LogOut, Package, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'white', borderBottom: '1px solid var(--gray-200)' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: 'var(--primary-dark)', color: 'white', padding: '0.375rem 0', fontSize: '0.8125rem' }}>
        <div className="container flex items-center justify-between">
          <span>🎉 Welcome to <strong>JayasriMart</strong> — Free Delivery on orders over ₹500! Use code <strong>WELCOME10</strong></span>
          <div className="flex items-center gap-4" style={{ display: 'none' }}>
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex items-center justify-between" style={{ padding: '0.875rem 1.25rem', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, #1d4ed8 100%)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', color: 'var(--primary-dark)' }}>
              Jayasri<span style={{ color: 'var(--brand)' }}>Mart</span>
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1" style={{ maxWidth: '600px', display: 'flex', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{
              paddingRight: '3rem',
              borderRadius: 'var(--radius-full)',
              borderColor: 'var(--gray-300)',
              fontSize: '0.9375rem'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'var(--brand)',
              color: 'white',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link to="/wishlist" className="flex items-center gap-1" style={{ position: 'relative', color: 'var(--gray-700)', padding: '0.5rem' }}>
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-1" style={{ position: 'relative', color: 'var(--gray-700)', padding: '0.5rem' }}>
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'var(--brand)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Dropdown */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <div>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 btn btn-outline btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <UserIcon size={16} />
                  <span>{user.firstName}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '220px',
                      backgroundColor: 'white',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--gray-200)',
                      padding: '0.5rem',
                      zIndex: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--gray-100)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.firstName} {user.lastName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user.email}</p>
                      {isAdmin && <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>Administrator</span>}
                    </div>

                    <Link to="/account" onClick={() => setProfileDropdownOpen(false)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <UserIcon size={16} /> My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setProfileDropdownOpen(false)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <Package size={16} /> My Orders
                    </Link>
                    <Link to="/account/addresses" onClick={() => setProfileDropdownOpen(false)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                      <MapPin size={16} /> Addresses
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--brand)' }}>
                        <ShieldAlert size={16} /> Admin Portal
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '0.25rem' }}></div>
                    <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: 'var(--gray-700)' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Nav links bar */}
      <div style={{ backgroundColor: 'var(--gray-100)', borderTop: '1px solid var(--gray-200)', fontSize: '0.875rem', fontWeight: 600 }}>
        <div className="container flex items-center justify-between" style={{ padding: '0.5rem 1.25rem' }}>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/" style={{ color: 'var(--gray-800)' }}>Home</Link>
            <Link to="/shop" style={{ color: 'var(--gray-800)' }}>Shop All</Link>
            <Link to="/shop?category=electronics" style={{ color: 'var(--gray-600)' }}>Electronics</Link>
            <Link to="/shop?category=fashion" style={{ color: 'var(--gray-600)' }}>Fashion</Link>
            <Link to="/shop?category=home-kitchen" style={{ color: 'var(--gray-600)' }}>Home & Kitchen</Link>
            <Link to="/shop?category=beauty" style={{ color: 'var(--gray-600)' }}>Beauty</Link>
            <Link to="/shop?category=sports" style={{ color: 'var(--gray-600)' }}>Sports</Link>
            <Link to="/shop?category=books" style={{ color: 'var(--gray-600)' }}>Books</Link>
            <Link to="/shop?category=grocery" style={{ color: 'var(--gray-600)' }}>Grocery</Link>
          </div>

          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1" style={{ color: 'var(--brand)', fontWeight: 700 }}>
              <ShieldAlert size={16} /> Admin Console
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
