import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage, getProduct } from '../services/api';
import type { Product, ProductReview } from '../types';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ReviewModal from '../components/ReviewModal';
import { getProductRatingSummary, getReviewsForProduct } from '../services/reviewService';
import { formatDate, formatMoney } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setReviews(getReviewsForProduct(p.id));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const onAdd = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setAdding(true);
    setAddError(null);
    setAdded(false);
    try {
      await add(product.id, quantity);
      setAdded(true);
    } catch (e) {
      setAddError(getErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmitted = () => {
    if (product) {
      setReviews(getReviewsForProduct(product.id));
    }
  };

  if (loading) return <Loader label="Loading product..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (!product) return null;

  const maxQty = Math.max(1, Math.min(10, product.stockQuantity));
  const ratingSummary = getProductRatingSummary(product.id);

  return (
    <div>
      <Link to="/" className="muted">
        &larr; Back to shop
      </Link>
      <div className="details">
        <img
          className="details-img"
          src={product.imageUrl ?? PLACEHOLDER_IMAGE}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <div>
          <span className="muted small">{product.category}</span>
          <h1>{product.name}</h1>

          {/* Star Rating Overview */}
          <div className="rating-summary-pill" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="stars-gold">
              {'★'.repeat(Math.round(ratingSummary.averageRating))}
              {'☆'.repeat(5 - Math.round(ratingSummary.averageRating))}
            </div>
            <strong>{ratingSummary.averageRating}</strong>
            <span className="muted small">({ratingSummary.totalReviews} verified reviews)</span>
          </div>

          <p className="price">{formatMoney(product.price, product.currency)}</p>
          <p>{product.description}</p>

          <span className={product.inStock ? 'badge badge-ok' : 'badge badge-bad'}>
            {product.inStock ? `In stock (${product.stockQuantity} available)` : 'Out of stock'}
          </span>

          {Object.keys(product.specifications).length > 0 && (
            <table className="specs">
              <tbody>
                {Object.entries(product.specifications).map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="buy-row">
            <label>
              Qty
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} disabled={!product.inStock}>
                {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" onClick={onAdd} disabled={!product.inStock || adding}>
              {adding ? 'Adding...' : 'Add to cart'}
            </button>
          </div>

          {addError && (
            <div className="alert alert-error" role="alert">
              {addError}
            </div>
          )}
          {added && (
            <div className="alert alert-success" role="status">
              Added to cart. <Link to="/cart">View cart</Link>
            </div>
          )}
        </div>
      </div>

      {/* Athlete Reviews & Feedback Section */}
      <div id="reviews-section" className="reviews-section card" style={{ marginTop: '2.5rem', padding: '1.5rem' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>💬 Athlete Reviews & Equipment Feedback</h2>
            <span className="muted small">Real feedback from verified purchasers & play-tested athletes</span>
          </div>
          <button className="btn btn-primary btn-small" onClick={() => setIsReviewModalOpen(true)}>
            ⭐ Write a Review
          </button>
        </div>

        <div className="reviews-layout">
          {/* Rating Breakdown Left Column */}
          <div className="rating-breakdown-card card">
            <div className="rating-big-score">{ratingSummary.averageRating}</div>
            <div className="stars-gold" style={{ fontSize: '1.3rem' }}>
              {'★'.repeat(Math.round(ratingSummary.averageRating))}
              {'☆'.repeat(5 - Math.round(ratingSummary.averageRating))}
            </div>
            <p className="muted small">Based on {ratingSummary.totalReviews} verified reviews</p>

            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = ratingSummary.distribution[s] || 0;
                const pct = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;
                return (
                  <div key={s} className="rating-bar-row">
                    <span className="small">{s} ★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="small muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Feed Right Column */}
          <div className="reviews-feed">
            {reviews.length === 0 ? (
              <div className="center-box" style={{ padding: '2rem' }}>
                <p className="muted">No athlete reviews yet for this equipment.</p>
                <p className="small muted">Be the first to share your field test feedback!</p>
                <button
                  className="btn btn-small btn-primary"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  ⭐ Write the First Review
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-card card">
                    <div className="row-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{rev.userName}</strong>
                        {rev.verifiedPurchase && <span className="badge badge-ok">✓ Verified Buyer</span>}
                      </div>
                      <span className="muted small">{formatDate(rev.createdAt)}</span>
                    </div>

                    <div className="stars-gold" style={{ margin: '0.25rem 0' }}>
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>

                    <h4 style={{ margin: '0.2rem 0' }}>{rev.title}</h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text)' }}>{rev.comment}</p>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="review-tags-row">
                        {rev.tags.map((t) => (
                          <span key={t} className="review-tag-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product.id}
        productName={product.name}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
