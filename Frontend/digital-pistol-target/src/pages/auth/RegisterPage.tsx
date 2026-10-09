import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      showToast('Account created successfully! Welcome to JayasriMart.', 'success');
      navigate(redirect);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Registration failed. Try a different email.', 'error');
    } finally {
      setLoading(false);
    }
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
        maxWidth: '520px', 
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
            Join JayasriMart
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Create an account to enjoy exclusive offers & seamless shopping
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>First Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="firstName"
                  required
                  className="form-control"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                className="form-control"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="form-control"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register Now
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
