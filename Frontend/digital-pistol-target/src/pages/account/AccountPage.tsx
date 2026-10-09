import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { orderApi, addressApi } from '../../services/api';
import type { Order, Address } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AccountPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Address Modal State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/account');
      return;
    }
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [isAuthenticated, activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.data.success && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await addressApi.getAll();
      if (res.data.success && res.data.data) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderApi.cancel(orderId);
      if (res.data.success) {
        showToast('Order cancelled successfully', 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addressApi.create(newAddress);
      if (res.data.success) {
        showToast('Address added successfully', 'success');
        setIsAddingAddress(false);
        fetchAddresses();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.delete(id);
      showToast('Address deleted', 'success');
      fetchAddresses();
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success"><CheckCircle size={12} /> Delivered</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-primary"><Truck size={12} /> In Transit</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-warning"><Clock size={12} /> {status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Sidebar Nav */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* User Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              {user?.role === 'ADMIN' && (
                <span className="badge badge-primary" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'orders' })}
              className={`btn btn-ghost ${activeTab === 'orders' ? 'active' : ''}`}
              style={{ 
                justifyContent: 'flex-start', 
                gap: '12px',
                background: activeTab === 'orders' ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: activeTab === 'orders' ? 700 : 500
              }}
            >
              <Package size={18} /> My Orders
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'addresses' })}
              className={`btn btn-ghost ${activeTab === 'addresses' ? 'active' : ''}`}
              style={{ 
                justifyContent: 'flex-start', 
                gap: '12px',
                background: activeTab === 'addresses' ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === 'addresses' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: activeTab === 'addresses' ? 700 : 500
              }}
            >
              <MapPin size={18} /> Saved Addresses
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'wishlist' })}
              className={`btn btn-ghost ${activeTab === 'wishlist' ? 'active' : ''}`}
              style={{ 
                justifyContent: 'flex-start', 
                gap: '12px',
                background: activeTab === 'wishlist' ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === 'wishlist' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: activeTab === 'wishlist' ? 700 : 500
              }}
            >
              <Heart size={18} /> Wishlist ({wishlist?.items?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`btn btn-ghost ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ 
                justifyContent: 'flex-start', 
                gap: '12px',
                background: activeTab === 'profile' ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-primary)',
                fontWeight: activeTab === 'profile' ? 700 : 500
              }}
            >
              <User size={18} /> Profile Settings
            </button>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: '12px', marginTop: '12px' }}
              >
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '12px', color: 'var(--danger-color)', marginTop: '8px' }}
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '480px'
        }}>
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>My Orders</h2>

              {loadingOrders ? (
                <LoadingSpinner text="Fetching your orders..." />
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Package size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Orders Found</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't placed any orders with JayasriMart yet.</p>
                  <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      style={{ 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '20px',
                        background: 'var(--surface-hover)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order ID:</span>
                          <span style={{ fontWeight: 700, marginLeft: '6px' }}>{order.orderNumber}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getStatusBadge(order.status)}
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                        {order.items?.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{item.productName} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                            <span style={{ fontWeight: 600 }}>₹{item.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button" 
                            onClick={() => setSelectedOrder(order)}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </button>
                          {order.status === 'PENDING' && (
                            <button 
                              type="button" 
                              onClick={() => handleCancelOrder(order.id)}
                              className="btn btn-sm btn-ghost" 
                              style={{ color: 'var(--danger-color)' }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Saved Addresses</h2>
                {!isAddingAddress && (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingAddress(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Address
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} style={{ background: 'var(--surface-hover)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>New Delivery Address</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        value={newAddress.fullName} 
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        className="form-control" 
                        value={newAddress.phone} 
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Street Address *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control" 
                      value={newAddress.addressLine1} 
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        value={newAddress.city} 
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        value={newAddress.state} 
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        value={newAddress.postalCode} 
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary">Save Address</button>
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="btn btn-ghost">Cancel</button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <LoadingSpinner text="Loading addresses..." />
              ) : addresses.length === 0 && !isAddingAddress ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <MapPin size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Addresses Saved</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Add delivery addresses for a faster checkout experience.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      style={{ 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '20px',
                        background: 'var(--surface-hover)',
                        position: 'relative'
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
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>Phone: {addr.phone}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <button 
                          type="button" 
                          onClick={() => addr.id && handleDeleteAddress(addr.id)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>My Wishlist ({(wishlist?.items || []).length})</h2>
              {(!wishlist?.items || wishlist.items.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Heart size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Your Wishlist is Empty</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Save items that you like and want to buy later.</p>
                  <Link to="/shop" className="btn btn-primary">Browse Catalog</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {wishlist.items.map((item) => (
                    <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
                      <img 
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                        alt={item.productName} 
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName}
                        </h4>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '16px' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <button 
                            type="button" 
                            onClick={async () => {
                              await addToCart(item.productId, 1);
                              await removeFromWishlist(item.productId);
                              showToast('Moved item to Cart!', 'success');
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Move to Cart
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeFromWishlist(item.productId)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger-color)' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>Account Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-control" value={user?.firstName || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control" value={user?.lastName || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" value={user?.phone || 'Not provided'} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <input type="text" className="form-control" value={user?.role || 'CUSTOMER'} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <input type="text" className="form-control" value={user?.status || 'ACTIVE'} readOnly />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order #{selectedOrder.orderNumber}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)} 
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.2rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Status overview */}
            <div style={{ background: 'var(--surface-hover)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</div>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payment:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Shipping Address</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress}</p>
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Ordered Items</h4>
            <div style={{ borderTop: '1px solid var(--border)', marginBottom: '20px' }}>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{item.totalPrice.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success-color)' }}>
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span>{selectedOrder.shippingAmount === 0 ? 'FREE' : `₹${selectedOrder.shippingAmount}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setSelectedOrder(null)} 
              className="btn btn-outline" 
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
