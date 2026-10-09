import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our wide range of products!"
          actionText="Start Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingAmount = subtotal >= 500 ? 0 : 40;
  const taxAmount = Math.max(0, (subtotal - discountAmount) * 0.05);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      const res = await api.post('/coupons/apply', {
        code: couponCode.trim().toUpperCase(),
        subtotal: subtotal,
      });

      if (res.data && res.data.data) {
        setAppliedCoupon({
          code: res.data.data.code,
          discountAmount: res.data.data.discountAmount,
        });
        showToast(res.data.data.message || 'Coupon applied successfully!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      showToast(msg, 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        couponCode: appliedCoupon?.code || null,
        discountAmount,
      },
    });
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Shopping Cart ({cart.itemCount} items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4"
                style={{
                  borderBottom: '1px solid var(--gray-200)',
                  paddingBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                {/* Product thumbnail & title */}
                <div className="flex items-center gap-4" style={{ flex: '1 1 240px' }}>
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius)',
                      objectFit: 'cover',
                      backgroundColor: '#f8fafc'
                    }}
                  />
                  <div>
                    <Link to={`/products/${item.productId}`} style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-900)' }}>
                      {item.productName}
                    </Link>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                      Unit: ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center" style={{ border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '1rem' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '1rem' }}
                  >
                    +
                  </button>
                </div>

                {/* Item Total Price */}
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'var(--font-display)' }}>
                    ₹{item.itemTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ color: 'var(--danger)', padding: '0.5rem' }}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: '1.5rem' }}>
            <Link to="/shop" className="btn btn-outline btn-sm">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)' }}>Items Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between" style={{ color: 'var(--success)' }}>
                <span className="flex items-center gap-1">
                  <Tag size={14} /> Coupon ({appliedCoupon.code})
                </span>
                <span style={{ fontWeight: 600 }}>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)' }}>Shipping Fee</span>
              <span>
                {shippingAmount === 0 ? (
                  <span className="badge badge-success">FREE</span>
                ) : (
                  `₹${shippingAmount}`
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)' }}>Estimated GST (5%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>

            <div
              className="flex items-center justify-between"
              style={{
                borderTop: '1.5px solid var(--gray-200)',
                paddingTop: '0.875rem',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary-dark)',
                fontFamily: 'var(--font-display)'
              }}
            >
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Promo Code Form */}
          <div style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (e.g. WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.875rem' }}
              />
              <button
                type="submit"
                disabled={applyingCoupon}
                className="btn btn-outline btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </form>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleProceedToCheckout}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div className="flex items-center justify-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>Secure 256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
