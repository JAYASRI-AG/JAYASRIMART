import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import api from '../../services/api';
import type { Category, Brand, Product, ProductPageResponse } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';
import { ProductSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Fetch categories and brands for sidebar filters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        if (catRes.data && catRes.data.data) setCategories(catRes.data.data);
        if (brandRes.data && brandRes.data.data) setBrands(brandRes.data.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products when filters/page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page,
          size: 12,
          sort,
        };
        if (search) params.search = search;
        if (category) params.categorySlug = category;
        if (brand) params.brandSlug = brand;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const res = await api.get<any>('/products', { params });
        if (res.data && res.data.data) {
          const pageData: ProductPageResponse = res.data.data;
          setProducts(pageData.content);
          setTotalPages(pageData.totalPages);
          setTotalElements(pageData.totalElements);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, brand, minPrice, maxPrice, sort, page]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header Breadcrumb & Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}` : search ? `Search results for "${search}"` : 'All Products'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Showing <strong>{products.length}</strong> of <strong>{totalElements}</strong> available items
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar Filters */}
        <aside className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <h3 className="flex items-center gap-2" style={{ fontSize: '1.125rem' }}>
              <Filter size={18} /> Filters
            </h3>
            <button type="button" onClick={clearAllFilters} className="btn btn-ghost btn-sm flex items-center gap-1" style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Search inside catalog */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Search</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-1">
              <input
                type="text"
                placeholder="Keywords..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Categories Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Categories</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                style={{
                  textAlign: 'left',
                  padding: '0.375rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: !category ? 700 : 400,
                  backgroundColor: !category ? 'var(--primary-bg)' : 'transparent',
                  color: !category ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  style={{
                    textAlign: 'left',
                    padding: '0.375rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: category === cat.slug ? 700 : 400,
                    backgroundColor: category === cat.slug ? 'var(--primary-bg)' : 'transparent',
                    color: category === cat.slug ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Brands</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => updateParam('brand', '')}
                style={{
                  textAlign: 'left',
                  padding: '0.375rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: !brand ? 700 : 400,
                  backgroundColor: !brand ? 'var(--primary-bg)' : 'transparent',
                  color: !brand ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => updateParam('brand', b.slug)}
                  style={{
                    textAlign: 'left',
                    padding: '0.375rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: brand === b.slug ? 700 : 400,
                    backgroundColor: brand === b.slug ? 'var(--primary-bg)' : 'transparent',
                    color: brand === b.slug ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Price Range (₹)</label>
            <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem' }}
                />
              </div>
              <button type="submit" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '0.25rem' }}>
                Apply Range
              </button>
            </form>
          </div>
        </aside>

        {/* Product Listing Main Area */}
        <div>
          {/* Top Bar Sort & Filter Summary */}
          <div className="card flex items-center justify-between" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem' }}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} color="var(--primary-color)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sort By:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--surface)',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name: A to Z</option>
              </select>
            </div>

            {/* Active filters pill */}
            <div className="flex items-center gap-2 flex-wrap">
              {category && <span className="badge badge-primary">Category: {category}</span>}
              {brand && <span className="badge badge-primary">Brand: {brand}</span>}
              {(minPrice || maxPrice) && <span className="badge badge-primary">Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}</span>}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products match your criteria"
              description="Try adjusting your filters, clearing price ranges, or searching for a different keyword."
              actionText="Reset All Filters"
              onAction={clearAllFilters}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2" style={{ marginTop: '3rem' }}>
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => updateParam('page', (page - 1).toString())}
                className="btn btn-outline btn-sm"
                style={{ opacity: page <= 0 ? 0.5 : 1 }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => updateParam('page', i.toString())}
                  className={`btn btn-sm ${page === i ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: '36px' }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => updateParam('page', (page + 1).toString())}
                className="btn btn-outline btn-sm"
                style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
