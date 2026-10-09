import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, LogIn, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Welcome back to JayasriMart!', 'success');
      navigate(redirect);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 160px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px',
      background: 'linear-gradient(135deg, rgba(238, 77, 45, 0.05) 0%, rgba(255, 138, 101, 0.05) 100%)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '460px', 
        background: 'var(--surface)', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid var(--border)', 
        padding: '40px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', 
            color: '#fff', 
            marginBottom: '16px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Welcome to JayasriMart
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to access your orders, wishlist & discounts
          </p>
        </div>

        {/* Quick Demo Login Presets */}
        <div style={{ 
          background: 'var(--surface-hover)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '16px', 
          marginBottom: '24px', 
          border: '1px dashed var(--primary-color)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px' }}>
            <Sparkles size={14} /> ONE-CLICK DEMO ACCOUNTS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@jayasrimart.com', 'Customer@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <User size={13} /> Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@jayasrimart.com', 'Admin@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Shield size={13} /> Demo Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: 0 }}>Password</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer' }}>Forgot password?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
