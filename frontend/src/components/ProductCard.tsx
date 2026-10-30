import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatMoney } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../constants';
import { getProductRatingSummary } from '../services/reviewService';

interface ProductCardProps {
  product: Product;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
}

export default function ProductCard({ product, onToggleCompare, isCompared }: ProductCardProps) {
  const isLowStock = product.inStock && product.stockQuantity <= 5 && product.stockQuantity > 0;
  const ratingSummary = getProductRatingSummary(product.id);

  return (
    <div className="card product-card-container">
      {onToggleCompare && (
        <button
          type="button"
          className={`compare-toggle-btn ${isCompared ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCompare(product);
          }}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
        >
          {isCompared ? '✓ Comparing' : '+ Compare'}
        </button>
      )}

      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrap">
          <img
            src={product.imageUrl ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
          {isLowStock && <span className="urgency-badge">🔥 Only {product.stockQuantity} left!</span>}
        </div>
        <div className="card-body">
          <div className="row-between">
            <span className="muted small">{product.category}</span>
            <span className="card-rating-chip" title={`${ratingSummary.averageRating} stars out of 5 (${ratingSummary.totalReviews} reviews)`}>
              ★ {ratingSummary.averageRating} <span className="small muted">({ratingSummary.totalReviews})</span>
            </span>
          </div>
          <h3 className="product-title">{product.name}</h3>
          <div className="row-between">
            <strong className="product-price">{formatMoney(product.price, product.currency)}</strong>
            <span className={product.inStock ? 'badge badge-ok' : 'badge badge-bad'}>
              {product.inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
