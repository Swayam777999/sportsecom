import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { getErrorMessage, placeOrder } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatMoney } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function CartPage() {
  const { cart, loading, error, refresh, update, remove } = useCart();
  const navigate = useNavigate();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  // One key per checkout screen: if the user double-clicks or retries, the backend returns the SAME order.
  const idempotencyKey = useRef(crypto.randomUUID());

  const run = async (itemId: string, fn: () => Promise<void>) => {
    setBusyId(itemId);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const onPlaceOrder = async () => {
    setPlacing(true);
    setActionError(null);
    try {
      const order = await placeOrder(idempotencyKey.current);
      await refresh(); // cart is now empty on the server
      navigate(`/confirmation/${order.id}`, { replace: true });
    } catch (e) {
      setActionError(getErrorMessage(e));
      await refresh(); // pick up any stock/price changes
    } finally {
      setPlacing(false);
    }
  };

  if (loading && !cart) return <Loader label="Loading your cart..." />;
  if (error && !cart) return <ErrorMessage message={error} onRetry={() => void refresh()} />;
  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState title="Your cart is empty">
        <Link to="/" className="btn btn-primary">
          Browse products
        </Link>
      </EmptyState>
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div>
      <h1>Your cart</h1>
      {actionError && <ErrorMessage message={actionError} />}

      <div className="cart-layout">
        <div className="card">
          {cart.items.map((item) => (
            <div className={`cart-row ${item.available ? '' : 'cart-row-unavailable'}`} key={item.itemId}>
              <img
                src={item.imageUrl ?? PLACEHOLDER_IMAGE}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="cart-info">
                <strong>{item.name}</strong>
                <span className="muted small">{formatMoney(item.unitPrice, item.currency)} each</span>
                {!item.available && (
                  <span className="badge badge-bad">Not enough stock - update quantity or remove</span>
                )}
              </div>
              <div className="qty">
                <button
                  className="btn btn-small"
                  aria-label="Decrease quantity"
                  disabled={busyId === item.itemId || item.quantity <= 1}
                  onClick={() => run(item.itemId, () => update(item.itemId, item.quantity - 1))}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  className="btn btn-small"
                  aria-label="Increase quantity"
                  disabled={busyId === item.itemId || item.quantity >= 10}
                  onClick={() => run(item.itemId, () => update(item.itemId, item.quantity + 1))}
                >
                  +
                </button>
              </div>
              <strong className="line-total">{formatMoney(item.lineTotal, item.currency)}</strong>
              <button
                className="btn btn-small btn-danger"
                disabled={busyId === item.itemId}
                onClick={() => run(item.itemId, () => remove(item.itemId))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h2>Order summary</h2>
          <div className="row-between">
            <span>Items</span>
            <span>{cart.itemCount}</span>
          </div>
          <div className="row-between total">
            <span>Total</span>
            <strong>{formatMoney(cart.subtotal, cart.currency)}</strong>
          </div>
          <p className="muted small">Payment: Pay on delivery. Final prices are confirmed by the server when you order.</p>
          <button className="btn btn-primary" onClick={onPlaceOrder} disabled={placing || hasUnavailable}>
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </div>
    </div>
  );
}
