import { useEffect, useState } from 'react';
import { getErrorMessage, getProducts } from '../services/api';
import type { Product } from '../types';
import { CATEGORIES, SORT_OPTIONS } from '../constants';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import GearAdvisorModal from '../components/GearAdvisorModal';
import CompareDrawer from '../components/CompareDrawer';

export default function CatalogPage() {
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('name_asc');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Innovation Modals & Comparison State
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  const min = minPrice === '' ? undefined : Number(minPrice);
  const max = maxPrice === '' ? undefined : Number(maxPrice);
  const rangeInvalid = min !== undefined && max !== undefined && min > max;

  useEffect(() => {
    if (rangeInvalid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // small debounce so typing a price doesn't fire a request per keystroke
    const timer = setTimeout(async () => {
      try {
        const data = await getProducts({ category: category || undefined, minPrice: min, maxPrice: max, sort });
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, min, max, sort, rangeInvalid, reloadKey]);

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('name_asc');
  };

  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setCompareProducts([]);
  };

  return (
    <div>
      {/* Hero PeakGear AI Banner */}
      <div className="hero-advisor-banner card">
        <div className="hero-advisor-content">
          <span className="hero-pill">⚡ NEW: PeakGear AI</span>
          <h2>Not sure which gear matches your play style?</h2>
          <p className="muted">
            Answer 3 quick questions about your sport, skill level, and training goals. Our algorithm will match you
            with the ideal equipment kit.
          </p>
        </div>
        <button className="btn btn-primary btn-hero" onClick={() => setIsAdvisorOpen(true)}>
          ⚡ Launch Gear Advisor
        </button>
      </div>

      <div className="row-between" style={{ marginTop: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>PeakNXT Pro Athletic Gear</h1>
        <span className="muted small">
          Showing {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="filters card">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min price
          <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </label>
        <label>
          Max price
          <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rangeInvalid && <ErrorMessage message="Min price cannot be greater than max price." />}

      {!rangeInvalid && loading && <Loader label="Loading products..." />}
      {!rangeInvalid && !loading && error && <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {!rangeInvalid && !loading && !error && products.length === 0 && (
        <EmptyState title="No products match your filters">
          <button className="btn" onClick={clearFilters}>
            Clear filters
          </button>
        </EmptyState>
      )}
      {!rangeInvalid && !loading && !error && products.length > 0 && (
        <div className="grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onToggleCompare={handleToggleCompare}
              isCompared={compareProducts.some((cp) => cp.id === p.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Comparison Bar */}
      {compareProducts.length > 0 && (
        <div className="floating-compare-bar">
          <div className="compare-bar-content">
            <div className="compare-bar-info">
              <span className="compare-badge">{compareProducts.length}</span>
              <strong>Compare Selected Gear ({compareProducts.length}/4)</strong>
            </div>
            <div className="compare-bar-thumbs">
              {compareProducts.map((p) => (
                <img key={p.id} src={p.imageUrl || ''} alt={p.name} className="compare-mini-thumb" />
              ))}
            </div>
          </div>
          <div className="compare-bar-actions">
            <button className="btn btn-small" onClick={handleClearCompare}>
              Clear
            </button>
            <button className="btn btn-small btn-primary" onClick={() => setIsCompareOpen(true)}>
              Compare Now &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GearAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        products={products}
      />

      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={compareProducts}
        onRemoveProduct={handleRemoveCompare}
        onClear={handleClearCompare}
      />
    </div>
  );
}
