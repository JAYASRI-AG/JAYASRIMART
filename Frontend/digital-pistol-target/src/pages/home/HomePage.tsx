import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import type { Category, Product } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';
import { ProductSkeleton } from '../../components/common/LoadingSpinner';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products/new-arrivals')
        ]);

        if (catRes.data && catRes.data.data) {
          setCategories(catRes.data.data);
        }
        if (featRes.data && featRes.data.data) {
          setFeaturedProducts(featRes.data.data);
        }
        if (newRes.data && newRes.data.data) {
          setNewArrivals(newRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
        color: 'white',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow circles */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="flex items-center justify-between gap-8 flex-wrap">
            <div style={{ flex: '1 1 500px', maxWidth: '650px' }}>
              <div className="badge badge-primary" style={{ backgroundColor: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', marginBottom: '1.25rem', padding: '0.4rem 0.85rem' }}>
                <Sparkles size={15} style={{ marginRight: '6px' }} />
                <span>Next-Gen E-Commerce Marketplace</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: '1.25rem', lineHeight: 1.15 }}>
                Shop Smarter with <span style={{ color: '#60a5fa' }}>JayasriMart</span>
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
                Everything you need, all in one place. Discover certified electronics, trending fashion, kitchen essentials, and wellness products with fast dispatch across India.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link to="/shop" className="btn btn-primary btn-lg">
                  <span>Explore Catalog</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=electronics" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                  View Deals
                </Link>
              </div>

              {/* Stats pill */}
              <div className="flex items-center gap-6" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>20+</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Demo Products</p>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>8</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Categories</p>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>100%</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Secure Checkout</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80"
                  alt="JayasriMart Shopping"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>SPECIAL OFFER</p>
                      <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Flat ₹50 Off Orders &gt; ₹499</h4>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.8125rem' }}>Code: JAYASRI50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-end justify-between" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Browse Categories</span>
              <h2 style={{ fontSize: '1.875rem' }}>Popular Categories</h2>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="card"
                style={{
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 70%)'
                  }}></div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                    <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700 }}>{cat.name}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Explore items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="flex items-end justify-between" style={{ marginBottom: '2.5rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <span className="badge badge-warning flex items-center gap-1">
                  <TrendingUp size={14} /> Curated Picks
                </span>
              </div>
              <h2 style={{ fontSize: '2rem' }}>Featured Products</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                Handpicked top-rated products with the best offers today.
              </p>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm">
              <span>See More</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No featured products found.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section style={{ margin: '1rem 0 4.5rem' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '580px', position: 'relative', zIndex: 2 }}>
              <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>Limited Time Promotion</span>
              <h2 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                Save 10% on Your First Order!
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#dbeafe', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Join thousands of happy customers shopping on JayasriMart. Apply coupon code <strong style={{ color: '#fbbf24', textDecoration: 'underline' }}>WELCOME10</strong> at checkout.
              </p>
              <Link to="/shop" className="btn btn-primary btn-lg" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#111827' }}>
                <span>Start Shopping Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '1.75rem 2.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '1px' }}>USE PROMO CODE</p>
              <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>WELCOME10</h3>
              <p style={{ fontSize: '0.8125rem', color: '#93c5fd' }}>Valid on orders above ₹299</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ paddingBottom: '4.5rem' }}>
        <div className="container">
          <div className="flex items-end justify-between" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Fresh in Stock</span>
              <h2 style={{ fontSize: '2rem' }}>New Arrivals</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                Check out the newest additions across all departments.
              </p>
            </div>
            <Link to="/shop?sort=newest" className="btn btn-outline btn-sm">
              <span>View All New</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : newArrivals.length > 0 ? (
              newArrivals.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No new products found.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
