import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage, getOrder } from '../services/api';
import type { Order } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import OrderTracker from '../components/OrderTracker';
import ReviewModal from '../components/ReviewModal';
import { hasUserReviewed } from '../services/reviewService';
import { useAuth } from '../auth/AuthContext';
import { formatMoney } from '../utils/format';

export default function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedReviewItem, setSelectedReviewItem] = useState<{ id: string; name: string } | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    getOrder(orderId)
      .then((o) => {
        if (!cancelled) {
          setOrder(o);
          // Check which products in this order are already reviewed
          const reviewed = new Set<string>();
          o.items.forEach((item) => {
            if (hasUserReviewed(item.productId, user?.uid || '', orderId)) {
              reviewed.add(item.productId);
            }
          });
          setReviewedProductIds(reviewed);
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
  }, [orderId, user?.uid]);

  if (loading) return <Loader label="Confirming your order..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return null;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="center-box" style={{ paddingBottom: '1.5rem' }}>
        <div className="success-icon">&#10003;</div>
        <h1>Order Confirmed!</h1>
        <p>
          Thank you for choosing PeakNXT. Your order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> for{' '}
          <strong>{formatMoney(order.total, order.currency)}</strong> has been processed successfully.
        </p>
        <p className="muted">Payment Method: {order.paymentStatus}</p>
        <div className="row-gap" style={{ marginTop: '0.5rem' }}>
          <Link to="/orders" className="btn btn-primary">
            View All Orders
          </Link>
          <Link to="/" className="btn">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Post-Purchase Feedback & Rating Prompt */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>⭐ Rate & Review Your New Equipment</h3>
            <span className="muted small">
              Help fellow athletes by sharing your experience with your purchased gear.
            </span>
          </div>
          <span className="badge badge-ok">VERIFIED BUYER FEEDBACK</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {order.items.map((item) => {
            const isReviewed = reviewedProductIds.has(item.productId);
            return (
              <div
                key={item.productId}
                className="row-between card"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)'
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div className="small muted">Qty: {item.quantity} &middot; {formatMoney(item.unitPrice, order.currency)}</div>
                </div>
                <button
                  className={`btn btn-small ${isReviewed ? '' : 'btn-primary'}`}
                  onClick={() => setSelectedReviewItem({ id: item.productId, name: item.name })}
                >
                  {isReviewed ? '✓ Edit Review' : '⭐ Rate Product'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Live Tracker & Tax Invoice */}
      <OrderTracker order={order} />

      {/* Review Modal */}
      {selectedReviewItem && (
        <ReviewModal
          isOpen={true}
          onClose={() => setSelectedReviewItem(null)}
          productId={selectedReviewItem.id}
          productName={selectedReviewItem.name}
          orderId={order.id}
          onReviewSubmitted={(rev) => {
            setReviewedProductIds((prev) => new Set(prev).add(rev.productId));
          }}
        />
      )}
    </div>
  );
}
