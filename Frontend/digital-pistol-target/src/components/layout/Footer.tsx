import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to JayasriMart newsletter!', 'success');
      setEmail('');
    }
  };

  return (
    <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--gray-300)', marginTop: '4rem' }}>
      {/* Value propositions banner */}
      <div style={{ borderBottom: '1px solid var(--primary-light)', padding: '2rem 0' }}>
        <div className="container grid grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand)', padding: '0.75rem', borderRadius: '12px' }}>
              <Truck size={28} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem' }}>Free Delivery</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Orders over ₹500 across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem' }}>Secure Payments</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>100% encrypted mock gateways</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)', padding: '0.75rem', borderRadius: '12px' }}>
              <RefreshCw size={28} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem' }}>Easy Returns</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>7-day hassle-free policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '12px' }}>
              <Clock size={28} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem' }}>24/7 Support</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Dedicated customer team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2rem' }}>
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, #1d4ed8 100%)',
                color: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingBag size={20} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'white' }}>
                Jayasri<span style={{ color: 'var(--brand)' }}>Mart</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
              JayasriMart is India's next-generation e-commerce marketplace delivering authentic lifestyle, tech, and household products with unprecedented speed and trust.
            </p>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-2"><MapPin size={16} color="var(--brand)" /> 19 Jayasri Square, Tech City, India</div>
              <div className="flex items-center gap-2"><Phone size={16} color="var(--brand)" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail size={16} color="var(--brand)" /> support@jayasrimart.com</div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1.25rem' }}>Popular Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/shop?category=electronics" style={{ color: 'var(--gray-400)' }}>Smartphones & Laptops</Link></li>
              <li><Link to="/shop?category=fashion" style={{ color: 'var(--gray-400)' }}>Footwear & Apparel</Link></li>
              <li><Link to="/shop?category=home-kitchen" style={{ color: 'var(--gray-400)' }}>Home & Kitchen Appliances</Link></li>
              <li><Link to="/shop?category=beauty" style={{ color: 'var(--gray-400)' }}>Beauty & Personal Care</Link></li>
              <li><Link to="/shop?category=sports" style={{ color: 'var(--gray-400)' }}>Sports & Fitness Equipment</Link></li>
              <li><Link to="/shop?category=books" style={{ color: 'var(--gray-400)' }}>Books & Novels</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1.25rem' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/account/orders" style={{ color: 'var(--gray-400)' }}>Track Your Orders</Link></li>
              <li><Link to="/account" style={{ color: 'var(--gray-400)' }}>Account Settings</Link></li>
              <li><Link to="/cart" style={{ color: 'var(--gray-400)' }}>View Shopping Cart</Link></li>
              <li><Link to="/wishlist" style={{ color: 'var(--gray-400)' }}>My Wishlist</Link></li>
              <li><span style={{ color: 'var(--gray-400)', cursor: 'pointer' }}>Privacy Policy</span></li>
              <li><span style={{ color: 'var(--gray-400)', cursor: 'pointer' }}>Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '1.25rem' }}>Newsletter Signup</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
              Subscribe to receive updates on exclusive deals, coupons, and newly arrived products.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                style={{ backgroundColor: 'var(--primary-light)', border: 'none', color: 'white' }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--gray-500)', flexWrap: 'wrap', gap: '1rem' }}>
          <p>© 2026 JayasriMart. All rights reserved. Crafted with excellence.</p>
          <div className="flex items-center gap-4">
            <span>Development Mode Active</span>
            <span>•</span>
            <span>MySQL `marketplace` Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
