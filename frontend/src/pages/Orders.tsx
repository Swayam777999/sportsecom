import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage, getOrders } from '../services/api';
import type { Order } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import OrderTracker from '../components/OrderTracker';
import ReviewModal from '../components/ReviewModal';
import { hasUserReviewed } from '../services/reviewService';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../utils/format';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Review modal state
  const [reviewItem, setReviewItem] = useState<{ id: string; name: string; orderId: string } | null>(null);
  const [reviewedProductKeys, setReviewedProductKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          // Pre-populate reviewed keys
          const reviewed = new Set<string>();
          data.forEach((o) => {
            o.items.forEach((item) => {
              if (hasUserReviewed(item.productId, user?.uid || '', o.id)) {
                reviewed.add(`${o.id}_${item.productId}`);
              }
            });
          });
          setReviewedProductKeys(reviewed);
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
  }, [reloadKey, user?.uid]);

  if (loading) return <Loader label="Loading your orders..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (orders.length === 0) {
    return (
      <EmptyState title="No orders yet">
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>PeakNXT Order History</h1>
        <span className="badge badge-ok">{orders.length} Total Orders</span>
      </div>

      {orders.map((o) => (
        <details className="card order" key={o.id}>
          <summary>
            <span>
              <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
              <span className="muted small"> &middot; {formatDate(o.createdAt)}</span>
            </span>
            <span>
              <span className="badge badge-ok">{o.status}</span> <strong>{formatMoney(o.total, o.currency)}</strong>
            </span>
          </summary>

          <table className="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((i) => {
                const isReviewed = reviewedProductKeys.has(`${o.id}_${i.productId}`);
                return (
                  <tr key={i.productId}>
                    <td>
                      <Link to={`/products/${i.productId}`} style={{ fontWeight: 600 }}>
                        {i.name}
                      </Link>
                    </td>
                    <td>{i.quantity}</td>
                    <td>{formatMoney(i.unitPrice, o.currency)}</td>
                    <td>{formatMoney(i.lineTotal, o.currency)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-small ${isReviewed ? '' : 'btn-primary'}`}
                        onClick={() => setReviewItem({ id: i.productId, name: i.name, orderId: o.id })}
                        title="Rate and review this purchased equipment"
                      >
                        {isReviewed ? '✓ Reviewed' : '⭐ Rate Gear'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: '1.25rem' }}>
            <OrderTracker order={o} />
          </div>
        </details>
      ))}

      {reviewItem && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewItem(null)}
          productId={reviewItem.id}
          productName={reviewItem.name}
          orderId={reviewItem.orderId}
          onReviewSubmitted={(rev) => {
            setReviewedProductKeys((prev) => new Set(prev).add(`${rev.orderId}_${rev.productId}`));
          }}
        />
      )}
    </div>
  );
}
