import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw, ChevronRight, MessageSquarePlus } from 'lucide-react';
import api from '../../services/api';
import type { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProductCard } from '../../components/common/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  // Review submission state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.data) {
          const prod: Product = res.data.data;
          setProduct(prod);
          setSelectedImage(prod.imageUrl);

          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0].variantValue);
          }

          // Fetch related
          if (prod.category) {
            const relRes = await api.get(`/products/${id}/related`, { params: { categoryId: prod.category.id } });
            if (relRes.data && relRes.data.data) {
              setRelatedProducts(relRes.data.data);
            }
          }

          // Fetch reviews
          const revRes = await api.get(`/products/${id}/reviews`);
          if (revRes.data && revRes.data.data) {
            setReviews(revRes.data.data);
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>The product you are looking for might have been moved or removed.</p>
        <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product.id, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!isOutOfStock) {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please write a comment for your review', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
      });
      if (res.data && res.data.data) {
        setReviews([res.data.data, ...reviews]);
        setNewComment('');
        showToast('Review submitted successfully! Thank you.', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const activePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" style={{ color: 'var(--text-secondary)' }}>Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${product.category.slug}`} style={{ color: 'var(--text-secondary)' }}>{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '3.5rem', marginBottom: '4rem', alignItems: 'start' }}>
        {/* Gallery */}
        <div>
          {/* Main Large Image */}
          <div className="card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', height: '420px' }}>
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.discountPercentage && product.discountPercentage > 0 ? (
              <span className="badge badge-danger" style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '0.85rem' }}>
                -{product.discountPercentage}%
              </span>
            ) : null}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2.5px solid var(--primary-color)' : '1px solid var(--border)',
                    padding: '2px',
                    cursor: 'pointer'
                  }}
                >
                  <img src={img} alt={`Thumbnail ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.brand ? product.brand.name : 'JayasriMart Certified'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>SKU: {product.sku}</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Ratings & Stock Status */}
          <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="flex items-center gap-1.5" style={{ backgroundColor: 'var(--surface-hover)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Star size={16} fill="var(--warning-color)" color="var(--warning-color)" />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {product.averageRating && product.averageRating > 0 ? product.averageRating.toFixed(1) : '4.5'}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>({reviews.length} reviews)</span>
            </div>

            {isOutOfStock ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : (
              <span className="badge badge-success">In Stock ({product.stockQuantity} available)</span>
            )}
          </div>

          {/* Pricing */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--surface-hover)', marginBottom: '2rem' }}>
            <div className="flex items-baseline gap-3">
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="badge badge-danger">Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>Inclusive of all applicable taxes</p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              {product.shortDescription}
            </p>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Options / Variations
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {product.variants.map((v) => (
                  <button
                    key={v.id || v.variantValue}
                    onClick={() => setSelectedVariant(v.variantValue)}
                    className={`btn btn-sm ${selectedVariant === v.variantValue ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {v.variantName}: {v.variantValue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Quantity</label>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Stepper */}
              <div className="flex items-center" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)' }}>
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.625rem 1rem', fontSize: '1.125rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.75rem', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity}
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  style={{ padding: '0.625rem 1rem', fontSize: '1.125rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary btn-lg"
                style={{ minWidth: '160px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn btn-outline btn-lg"
              >
                Buy Now
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-ghost btn-lg"
                style={{ color: isFavorited ? 'var(--danger-color)' : 'var(--text-secondary)' }}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isFavorited ? 'var(--danger-color)' : 'none'} />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <Truck size={18} color="var(--primary-color)" />
              <span>Fast 2-Day Dispatch</span>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={18} color="var(--success-color)" />
              <span>100% Genuine Quality</span>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <RotateCcw size={18} color="var(--primary-color)" />
              <span>7-Day Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Info Section */}
      <div className="card" style={{ marginBottom: '4rem', padding: '2rem' }}>
        {/* Tab Headers */}
        <div className="flex items-center gap-6" style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'desc' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'desc' ? '3px solid var(--primary-color)' : 'none',
              paddingBottom: '0.75rem',
              marginBottom: '-1rem'
            }}
          >
            Description & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'reviews' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-color)' : 'none',
              paddingBottom: '0.75rem',
              marginBottom: '-1rem'
            }}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1 Content */}
        {activeTab === 'desc' && (
          <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.975rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>{product.description || 'No detailed description available.'}</p>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: '1rem' }}>Product Specifications:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--surface-hover)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Brand:</strong> {product.brand?.name || 'JayasriMart'}</div>
              <div><strong>Category:</strong> {product.category?.name}</div>
              <div><strong>SKU:</strong> {product.sku}</div>
              <div><strong>Stock Status:</strong> {product.stockQuantity > 0 ? 'Available in Warehouse' : 'Out of Stock'}</div>
            </div>
          </div>
        )}

        {/* Tab 2 Reviews Content */}
        {activeTab === 'reviews' && (
          <div>
            {/* Review Form */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-hover)', marginBottom: '2.5rem' }}>
              <h4 className="flex items-center gap-2" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                <MessageSquarePlus size={20} color="var(--primary-color)" /> Write a Review
              </h4>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        style={{ color: star <= newRating ? 'var(--warning-color)' : 'var(--border)', background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer' }}
                      >
                        <Star size={24} fill={star <= newRating ? 'var(--warning-color)' : 'none'} />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.5rem', color: 'var(--text-primary)' }}>
                      {newRating} Star{newRating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Your Review Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Share your honest experience with this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.375rem' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{rev.userName}</span>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? 'var(--warning-color)' : 'none'} color={i < rev.rating ? 'var(--warning-color)' : 'var(--border)'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                No customer reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.75rem' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
