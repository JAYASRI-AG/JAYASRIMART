import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product.id, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} style={{ position: 'relative', overflow: 'hidden', paddingTop: '80%', backgroundColor: '#f8fafc', display: 'block' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="badge badge-danger">-{product.discountPercentage}%</span>
          ) : null}
          {product.featured && <span className="badge badge-warning">Featured</span>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorited ? 'var(--danger)' : 'var(--gray-600)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)',
            zIndex: 3
          }}
          aria-label="Toggle Wishlist"
        >
          <Heart size={18} fill={isFavorited ? 'var(--danger)' : 'none'} />
        </button>
      </Link>

      {/* Product Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
            <span>{product.brand ? product.brand.name : (product.category ? product.category.name : 'JayasriMart')}</span>
            {isOutOfStock ? (
              <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>Out of stock</span>
            ) : (
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>In stock</span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <h3
              style={{
                fontSize: '0.975rem',
                fontWeight: 600,
                color: 'var(--gray-900)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.35,
                minHeight: '2.7rem',
                marginBottom: '0.5rem'
              }}
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1" style={{ marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
            <div className="flex items-center" style={{ color: 'var(--accent)' }}>
              <Star size={15} fill="var(--accent)" />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
              {product.averageRating && product.averageRating > 0 ? product.averageRating.toFixed(1) : '4.5'}
            </span>
            <span style={{ color: 'var(--gray-400)' }}>({product.reviewCount || 12})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
          <div>
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-display)' }}>
                ₹{product.discountPrice ? product.discountPrice.toLocaleString('en-IN') : product.price.toLocaleString('en-IN')}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn btn-sm ${isOutOfStock ? 'btn-outline' : 'btn-primary'}`}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius)',
              opacity: isOutOfStock ? 0.6 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
