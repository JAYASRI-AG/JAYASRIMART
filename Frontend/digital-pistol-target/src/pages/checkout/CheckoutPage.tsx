import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Smartphone 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addressApi, orderApi, couponApi } from '../../services/api';
import type { Address, Order } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CheckoutPage() {
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Step state: 1 = Shipping, 2 = Payment & Review, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // New Address Form State
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'UPI' | 'NET_BANKING'>('COD');
  const cardDetails = {
    cardNumber: '4532 •••• •••• 8892',
    expiry: '12/28',
    cvv: '•••'
  };
  const [upiId, setUpiId] = useState('user@okaxis');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    loadAddresses();
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressApi.getAll();
      if (res.data.success && res.data.data) {
        setAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
        if (defaultAddr && defaultAddr.id) {
          setSelectedAddressId(defaultAddr.id);
        } else if (res.data.data.length > 0 && res.data.data[0].id) {
          setSelectedAddressId(res.data.data[0].id);
        } else {
          setIsAddingAddress(true);
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setIsAddingAddress(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      showToast('Please fill all required address fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await addressApi.create(newAddress);
      if (res.data.success) {
        showToast('Address saved successfully!', 'success');
        await loadAddresses();
        setIsAddingAddress(false);
        if (res.data.data?.id) {
          setSelectedAddressId(res.data.data.id);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const subtotal = cart?.subtotal || 0;
      const res = await couponApi.validate(couponCode.trim(), subtotal);
      if (res.data.success && res.data.data) {
        setAppliedCoupon(res.data.data);
        showToast(`Coupon "${couponCode.toUpperCase()}" applied!`, 'success');
      } else {
        showToast(res.data.message || 'Invalid coupon', 'warning');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid or expired coupon', 'error');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !cart) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      const discount = (cart.subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maximumDiscount ? Math.min(discount, appliedCoupon.maximumDiscount) : discount;
    }
    return Math.min(appliedCoupon.discountValue, cart.subtotal);
  };

  const subtotal = cart?.subtotal || 0;
  const discount = calculateDiscount();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = Math.max(0, subtotal - discount + shipping);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'warning');
      setCurrentStep(1);
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        addressId: selectedAddressId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : paymentMethod,
      };

      const res = await orderApi.create(orderPayload);
      if (res.data.success && res.data.data) {
        setConfirmedOrder(res.data.data);
        setCurrentStep(3);
        await clearCart();
        showToast('Order placed successfully!', 'success');
      } else {
        showToast(res.data.message || 'Failed to place order', 'error');
      }
    } catch (err: any) {
      console.error('Order error:', err);
      showToast(err.response?.data?.message || 'Error processing order. Please check stock.', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (cartLoading || loading) {
    return <LoadingSpinner text="Preparing checkout..." />;
  }

  if (!cart || (cart.items.length === 0 && currentStep !== 3)) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <ShoppingBag size={56} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add some products to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="btn btn-primary" style={{ width: '100%' }}>
            Explore JayasriMart
          </Link>
        </div>
      </div>
    );
  }

  // STEP 3: Order Confirmation
  if (currentStep === 3 && confirmedOrder) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '720px' }}>
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--success-bg)', 
            color: 'var(--success-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <CheckCircle2 size={48} />
          </div>

          <span className="badge badge-success" style={{ marginBottom: '12px', fontSize: '0.85rem', padding: '6px 14px' }}>
            Order Confirmed
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Thank You for Your Order!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>
            We've received your order and will start processing it right away. A confirmation receipt is generated below.
          </p>

          <div style={{ 
            background: 'var(--surface-hover)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '20px', 
            textAlign: 'left',
            marginBottom: '32px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Order Number:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{confirmedOrder.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Method:</span>
              <span style={{ fontWeight: 600 }}>{confirmedOrder.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Delivery Address:</span>
              <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '300px' }}>{confirmedOrder.shippingAddress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Paid:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/account?tab=orders" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              View My Orders
            </Link>
            <Link to="/shop" className="btn btn-outline" style={{ padding: '12px 24px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      {/* Checkout Progress Stepper */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '15%', 
            right: '15%', 
            height: '2px', 
            background: 'var(--border)', 
            zIndex: 0 
          }} />
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '15%', 
            width: currentStep === 2 ? '70%' : '0%', 
            height: '2px', 
            background: 'var(--primary-color)', 
            transition: 'width 0.3s ease',
            zIndex: 0 
          }} />

          {/* Step 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: currentStep >= 1 ? 'var(--primary-color)' : 'var(--surface)', 
              color: currentStep >= 1 ? '#fff' : 'var(--text-secondary)',
              border: `2px solid ${currentStep >= 1 ? 'var(--primary-color)' : 'var(--border)'}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              1
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Shipping Address
            </span>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: currentStep >= 2 ? 'var(--primary-color)' : 'var(--surface)', 
              color: currentStep >= 2 ? '#fff' : 'var(--text-secondary)',
              border: `2px solid ${currentStep >= 2 ? 'var(--primary-color)' : 'var(--border)'}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              2
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Payment & Review
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        {/* Left Side: Step Forms */}
        <div>
          {/* STEP 1: Address Selection */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={24} color="var(--primary-color)" /> Select Delivery Address
                </h2>
                {!isAddingAddress && addresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingAddress(true)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                )}
              </div>

              {!isAddingAddress && addresses.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div 
                        key={addr.id}
                        onClick={() => addr.id && setSelectedAddressId(addr.id)}
                        style={{ 
                          border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-lg)',
                          padding: '20px',
                          background: isSelected ? 'var(--primary-bg)' : 'var(--surface)',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Default</span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                          {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone: {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Add New Address Form */
                <form onSubmit={handleSaveAddress} style={{ 
                  background: 'var(--surface)', 
                  padding: '24px', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid var(--border)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Delivery Address</h3>
                    {addresses.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setIsAddingAddress(false)}
                        className="btn btn-sm btn-ghost"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Street Address *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="Flat / House No., Street, Area"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Landmark / Apartment (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      placeholder="Near City Center"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="Karnataka"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="560001"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Save & Use This Address
                  </button>
                </form>
              )}

              {addresses.length > 0 && !isAddingAddress && (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}

          {/* STEP 2: Payment & Review */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={24} color="var(--primary-color)" /> Choose Payment Method
                </h2>
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ArrowLeft size={16} /> Edit Address
                </button>
              </div>

              {/* Selected Address Summary Banner */}
              {selectedAddressId && (
                <div style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '16px', 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={20} color="var(--primary-color)" />
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Delivering to:</span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {addresses.find(a => a.id === selectedAddressId)?.fullName} - {addresses.find(a => a.id === selectedAddressId)?.addressLine1}, {addresses.find(a => a.id === selectedAddressId)?.city}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-link btn-sm" style={{ padding: 0 }}>
                    Change
                  </button>
                </div>
              )}

              {/* Payment Methods */}
              <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {/* Cash on Delivery */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  style={{ 
                    border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    background: paymentMethod === 'COD' ? 'var(--primary-bg)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'var(--surface-hover)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Truck size={20} color="var(--primary-color)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay cash or UPI upon delivery</div>
                    </div>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--border)'}`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    {paymentMethod === 'COD' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                  </div>
                </div>

                {/* Credit / Debit Card (Mock) */}
                <div 
                  onClick={() => setPaymentMethod('CARD')}
                  style={{ 
                    border: `2px solid ${paymentMethod === 'CARD' ? 'var(--primary-color)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    background: paymentMethod === 'CARD' ? 'var(--primary-bg)' : 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: paymentMethod === 'CARD' ? '16px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--surface-hover)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <CreditCard size={20} color="var(--primary-color)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>Credit / Debit Card</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instant simulated payment gateway</div>
                      </div>
                    </div>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: `2px solid ${paymentMethod === 'CARD' ? 'var(--primary-color)' : 'var(--border)'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {paymentMethod === 'CARD' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                    </div>
                  </div>

                  {paymentMethod === 'CARD' && (
                    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Card Number</label>
                        <input type="text" className="form-control" value={cardDetails.cardNumber} readOnly />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>Valid Thru</label>
                          <input type="text" className="form-control" value={cardDetails.expiry} readOnly />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>CVV</label>
                          <input type="text" className="form-control" value={cardDetails.cvv} readOnly />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI (Mock) */}
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  style={{ 
                    border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary-color)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    background: paymentMethod === 'UPI' ? 'var(--primary-bg)' : 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: paymentMethod === 'UPI' ? '16px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--surface-hover)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Smartphone size={20} color="var(--primary-color)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>UPI (GPay / PhonePe / Paytm)</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay via any UPI ID or App</div>
                      </div>
                    </div>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary-color)' : 'var(--border)'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {paymentMethod === 'UPI' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                    </div>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>UPI ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)} 
                        placeholder="username@bank" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Security Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <ShieldCheck size={22} color="var(--success-color)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  All orders on JayasriMart are covered by 100% Purchase Protection with bank-grade encryption.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Card */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '24px',
          position: 'sticky',
          top: '90px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h3>

          {/* Cart Items Preview */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
            {cart?.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <img 
                  src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
                  alt={item.productName} 
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  ₹{item.itemTotal.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter coupon code" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{ paddingLeft: '36px', textTransform: 'uppercase' }}
              />
              <Tag size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button 
              type="submit" 
              className="btn btn-outline" 
              disabled={couponLoading || !couponCode.trim()}
              style={{ padding: '0 16px' }}
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </form>

          {appliedCoupon && (
            <div style={{ 
              background: 'var(--success-bg)', 
              color: 'var(--success-color)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
              <button 
                type="button" 
                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div style={{ display: 'grid', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success-color)' }}>
                <span>Coupon Discount</span>
                <span style={{ fontWeight: 600 }}>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
              <span style={{ fontWeight: 600 }}>
                {shipping === 0 ? <span style={{ color: 'var(--success-color)' }}>FREE</span> : `₹${shipping}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary-color)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {currentStep === 2 ? (
            <button 
              type="button" 
              onClick={handlePlaceOrder}
              disabled={submittingOrder}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {submittingOrder ? 'Placing Order...' : `Place Order (₹${total.toLocaleString('en-IN')})`}
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
