import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Tag, 
  Star, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  FolderTree, 
  RefreshCw, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  adminApi, 
  productApi, 
  categoryApi, 
  brandApi, 
  couponApi, 
  reviewApi 
} from '../../services/api';
import type { 
  AdminDashboard, 
  Product, 
  Category, 
  Brand, 
  Order, 
  User, 
  Coupon, 
  Review 
} from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'overview';

  // Stats State
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Categories & Brands State
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', imageUrl: '' });
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', description: '', logoUrl: '' });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Customers State
  const [customers, setCustomers] = useState<User[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumOrderAmount: 500,
    maximumDiscount: 200,
    active: true
  });

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (user && user.role !== 'ADMIN') {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/');
      return;
    }

    loadTabContent();
    loadCategoriesAndBrands();
  }, [isAuthenticated, user, currentTab]);

  const loadCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        categoryApi.getAll(),
        brandApi.getAll()
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (brandRes.data.success) setBrands(brandRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTabContent = () => {
    switch (currentTab) {
      case 'overview':
        fetchStats();
        break;
      case 'products':
        fetchProducts();
        break;
      case 'orders':
        fetchOrders();
        break;
      case 'customers':
        fetchCustomers();
        break;
      case 'categories':
        loadCategoriesAndBrands();
        break;
      case 'coupons':
        fetchCoupons();
        break;
      case 'reviews':
        fetchReviews();
        break;
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.data.success) setStats(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productApi.getAll({ page: 0, size: 50 });
      if (res.data.success) setProducts(res.data.data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await adminApi.getAllOrders();
      if (res.data.success) setOrders(res.data.data.content || res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await adminApi.getAllUsers();
      if (res.data.success) setCustomers(res.data.data.content || res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await couponApi.getAll();
      if (res.data.success) setCoupons(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await reviewApi.getPending();
      if (res.data.success) setReviews(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...editingProduct,
        categoryId: editingProduct.category?.id || (categories[0]?.id),
        brandId: editingProduct.brand?.id || (brands[0]?.id),
      };

      if (editingProduct.id) {
        await productApi.update(editingProduct.id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await productApi.create(payload);
        showToast('Product created successfully!', 'success');
      }
      setIsEditingProduct(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  // Category & Brand Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await categoryApi.create({ ...newCategory, slug, active: true });
      showToast('Category created!', 'success');
      setShowCategoryModal(false);
      setNewCategory({ name: '', slug: '', description: '', imageUrl: '' });
      loadCategoriesAndBrands();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create category', 'error');
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = newBrand.slug || newBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await brandApi.create({ ...newBrand, slug, active: true });
      showToast('Brand created!', 'success');
      setShowBrandModal(false);
      setNewBrand({ name: '', slug: '', description: '', logoUrl: '' });
      loadCategoriesAndBrands();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create brand', 'error');
    }
  };

  // Order Status Update Handler
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}`, 'success');
      fetchOrders();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // User Status Toggle Handler
  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      showToast(`User status updated to ${newStatus}`, 'success');
      fetchCustomers();
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  // Coupon Handler
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponApi.create(newCoupon);
      showToast('Coupon created successfully!', 'success');
      setShowCouponModal(false);
      fetchCoupons();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  // Review Moderation Handler
  const handleApproveReview = async (id: number) => {
    try {
      await reviewApi.approve(id);
      showToast('Review approved and published!', 'success');
      fetchReviews();
    } catch {
      showToast('Failed to approve review', 'error');
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      await reviewApi.delete(id);
      showToast('Review deleted', 'success');
      fetchReviews();
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px 80px 20px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Admin Control Center</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>JayasriMart Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={loadTabContent}
            className="btn btn-outline btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <Link to="/shop" className="btn btn-primary btn-sm">
            View Live Store
          </Link>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gap: '4px'
        }}>
          {[
            { key: 'overview', label: 'Overview', icon: LayoutDashboard },
            { key: 'products', label: 'Products', icon: Package },
            { key: 'categories', label: 'Categories & Brands', icon: FolderTree },
            { key: 'orders', label: 'Customer Orders', icon: ShoppingBag },
            { key: 'customers', label: 'Customers', icon: Users },
            { key: 'coupons', label: 'Coupons & Discounts', icon: Tag },
            { key: 'reviews', label: 'Review Moderation', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`btn btn-ghost ${isActive ? 'active' : ''}`}
                style={{ 
                  justifyContent: 'flex-start', 
                  gap: '10px',
                  background: isActive ? 'var(--primary-bg)' : 'transparent',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Main Workspace */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)', 
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '600px'
        }}>
          {/* 1. OVERVIEW TAB */}
          {currentTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Dashboard Metrics</h2>
              
              {loadingStats ? (
                <LoadingSpinner text="Computing store metrics..." />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>Total Revenue</span>
                        <DollarSign size={20} color="var(--primary-color)" />
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                        ₹{stats?.totalSales?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>Total Orders</span>
                        <ShoppingBag size={20} color="#3b82f6" />
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                        {stats?.totalOrders || 0}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>Customers</span>
                        <Users size={20} color="#10b981" />
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                        {stats?.totalCustomers || 0}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>Low Stock Alerts</span>
                        <AlertTriangle size={20} color="var(--warning-color)" />
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stats?.lowStockProducts ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                        {stats?.lowStockProducts || 0}
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Items Alert section */}
                  {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
                    <div style={{ marginBottom: '32px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <ShieldAlert size={18} /> Urgent Inventory Restock Needed
                      </h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {stats.lowStockItems.map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{p.name} (SKU: {p.sku})</span>
                            <span className="badge badge-warning" style={{ fontWeight: 700 }}>{p.stockQuantity} units left</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 2. PRODUCTS TAB */}
          {currentTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Products Catalog ({products.length})</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        sku: `SKU-${Date.now().toString().slice(-4)}`,
                        price: 999,
                        stockQuantity: 50,
                        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
                        active: true,
                        featured: false
                      });
                      setIsEditingProduct(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> New Product
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <LoadingSpinner text="Fetching products..." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 8px' }}>Product</th>
                        <th style={{ padding: '12px 8px' }}>SKU</th>
                        <th style={{ padding: '12px 8px' }}>Category</th>
                        <th style={{ padding: '12px 8px' }}>Price</th>
                        <th style={{ padding: '12px 8px' }}>Stock</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                            />
                            <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.name}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                          <td style={{ padding: '12px 8px' }}>{product.category?.name || 'General'}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{product.price.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${product.stockQuantity < 10 ? 'badge-warning' : 'badge-success'}`}>
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${product.active ? 'badge-primary' : 'badge-danger'}`}>
                              {product.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button 
                                type="button" 
                                onClick={() => { setEditingProduct(product); setIsEditingProduct(true); }}
                                className="btn btn-ghost btn-sm"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--danger-color)' }}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. CATEGORIES & BRANDS TAB */}
          {currentTab === 'categories' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Categories */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Categories ({categories.length})</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowCategoryModal(true)} 
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} /> Add Category
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {categories.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />}
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/{c.slug}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Brands ({brands.length})</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowBrandModal(true)} 
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} /> Add Brand
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {brands.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/{b.slug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ORDERS TAB */}
          {currentTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Customer Orders ({orders.length})</h2>
              
              {loadingOrders ? (
                <LoadingSpinner text="Fetching all orders..." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 8px' }}>Order #</th>
                        <th style={{ padding: '12px 8px' }}>Customer</th>
                        <th style={{ padding: '12px 8px' }}>Total</th>
                        <th style={{ padding: '12px 8px' }}>Payment</th>
                        <th style={{ padding: '12px 8px' }}>Order Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>{order.orderNumber}</td>
                          <td style={{ padding: '12px 8px' }}>{order.userName || order.userEmail || 'Guest'}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className="badge badge-primary">{order.paymentMethod}</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <select 
                              className="form-control"
                              style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <button 
                              type="button" 
                              onClick={() => setSelectedOrder(order)}
                              className="btn btn-outline btn-sm"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. CUSTOMERS TAB */}
          {currentTab === 'customers' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Registered Customers ({customers.length})</h2>
              {loadingCustomers ? (
                <LoadingSpinner text="Fetching customers list..." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 8px' }}>Name</th>
                        <th style={{ padding: '12px 8px' }}>Email</th>
                        <th style={{ padding: '12px 8px' }}>Role</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.firstName} {c.lastName}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{c.email}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${c.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>{c.role}</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            {c.role !== 'ADMIN' && (
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(c.id, c.status)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: c.status === 'ACTIVE' ? 'var(--danger-color)' : 'var(--success-color)' }}
                              >
                                {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 6. COUPONS TAB */}
          {currentTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Discount Coupons ({coupons.length})</h2>
                <button 
                  type="button" 
                  onClick={() => setShowCouponModal(true)} 
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Create Coupon
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {coupons.map(coupon => (
                  <div key={coupon.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', background: 'var(--surface-hover)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{coupon.code}</span>
                      <span className={`badge ${coupon.active ? 'badge-success' : 'badge-danger'}`}>
                        {coupon.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                      {coupon.description || 'Special store promotion'}
                    </p>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Discount: {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Min Order: ₹{coupon.minimumOrderAmount || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. REVIEWS MODERATION TAB */}
          {currentTab === 'reviews' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Pending Customer Reviews ({reviews.length})</h2>
              {loadingReviews ? (
                <LoadingSpinner text="Fetching pending reviews..." />
              ) : reviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reviews currently awaiting moderation.</p>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {reviews.map(rev => (
                    <div key={rev.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', background: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{rev.userName} <span style={{ color: 'var(--warning-color)' }}>★ {rev.rating}/5</span></div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>"{rev.comment}"</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleApproveReview(rev.id)} 
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteReview(rev.id)} 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--danger-color)' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isEditingProduct && (
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
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Product Title *</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  value={editingProduct.name || ''} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    value={editingProduct.sku || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={editingProduct.category?.id || (categories[0]?.id || '')}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === Number(e.target.value));
                      setEditingProduct({ ...editingProduct, category: cat });
                    }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control" 
                    value={editingProduct.price || 0} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={editingProduct.discountPrice || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? Number(e.target.value) : undefined })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Units *</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control" 
                    value={editingProduct.stockQuantity || 0} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Image URL *</label>
                <input 
                  type="url" 
                  required 
                  className="form-control" 
                  value={editingProduct.imageUrl || ''} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Short Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingProduct.shortDescription || ''} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Full Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={editingProduct.description || ''} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editingProduct.active ?? true} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })} 
                  />
                  <span>Active for Sale</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editingProduct.featured ?? false} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} 
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
                <button type="button" onClick={() => setIsEditingProduct(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add New Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Category Name *</label>
                <input type="text" required className="form-control" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Image URL (Optional)</label>
                <input type="url" className="form-control" value={newCategory.imageUrl} onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Category</button>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Creation Modal */}
      {showBrandModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add New Brand</h3>
            <form onSubmit={handleCreateBrand}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Brand Name *</label>
                <input type="text" required className="form-control" value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Brand</button>
                <button type="button" onClick={() => setShowBrandModal(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Creation Modal */}
      {showCouponModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '500px', width: '100%', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Create Promo Coupon</h3>
            <form onSubmit={handleSaveCoupon}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Coupon Code *</label>
                <input type="text" required className="form-control" placeholder="e.g. FESTIVE20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-control" value={newCoupon.discountType} onChange={(e: any) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}>
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input type="number" required className="form-control" value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Coupon</button>
                <button type="button" onClick={() => setShowCouponModal(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal in Admin */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '560px', width: '100%', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order #{selectedOrder.orderNumber}</h3>
              <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Customer: <strong>{selectedOrder.userName} ({selectedOrder.userEmail})</strong></p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Shipping Address: {selectedOrder.shippingAddress}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
              {selectedOrder.items?.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0' }}>
                  <span>{i.productName} × {i.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{i.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '12px' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
