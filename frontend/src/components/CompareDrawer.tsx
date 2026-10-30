import { useState } from 'react';
import type { Product } from '../types';
import { formatMoney } from '../utils/format';
import { useCart } from '../cart/CartContext';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../constants';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClear: () => void;
}

export default function CompareDrawer({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClear
}: CompareDrawerProps) {
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  // Extract all unique spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(
      products.flatMap((p) => Object.keys(p.specifications || {}))
    )
  );

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    setAddingId(product.id);
    try {
      await add(product.id, 1);
      setAddedIds((prev) => new Set(prev).add(product.id));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="row-gap" style={{ alignItems: 'center', justifyContent: 'flex-start', margin: 0 }}>
            <h2>⚖️ Side-by-Side Equipment Comparison</h2>
            <span className="badge badge-ok">{products.length} of 4 items</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {products.length > 0 && (
              <button className="btn btn-small btn-danger" onClick={onClear}>
                Clear All
              </button>
            )}
            <button className="close-btn" onClick={onClose} aria-label="Close comparison">
              &times;
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ overflowX: 'auto' }}>
          {products.length === 0 ? (
            <div className="center-box">
              <p className="muted">No products selected for comparison.</p>
              <p className="small muted">
                Click the <strong>⚖️ Compare</strong> button on any product card in the catalog to add up to 4 items here.
              </p>
              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="spec-label-col">Gear Feature</th>
                    {products.map((p) => (
                      <th key={p.id} className="compare-product-col">
                        <div className="compare-item-header">
                          <button
                            className="remove-pill-btn"
                            onClick={() => onRemoveProduct(p.id)}
                            title="Remove from comparison"
                          >
                            &times;
                          </button>
                          <img
                            src={p.imageUrl ?? PLACEHOLDER_IMAGE}
                            alt={p.name}
                            className="compare-thumb"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <h4 className="compare-name">{p.name}</h4>
                          <div className="compare-price">{formatMoney(p.price, p.currency)}</div>
                          <span className={p.inStock ? 'badge badge-ok' : 'badge badge-bad'}>
                            {p.inStock ? `In Stock (${p.stockQuantity})` : 'Out of Stock'}
                          </span>
                          <button
                            className="btn btn-small btn-primary"
                            style={{ marginTop: '0.5rem', width: '100%' }}
                            onClick={() => handleAddToCart(p)}
                            disabled={!p.inStock || addingId === p.id || addedIds.has(p.id)}
                          >
                            {addedIds.has(p.id) ? '✓ In Cart' : addingId === p.id ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="spec-label-col">Category</td>
                    {products.map((p) => (
                      <td key={p.id}>
                        <span className="badge">{p.category}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="spec-label-col">Description</td>
                    {products.map((p) => (
                      <td key={p.id} className="small muted">
                        {p.description}
                      </td>
                    ))}
                  </tr>

                  {allSpecKeys.map((key) => (
                    <tr key={key}>
                      <td className="spec-label-col">
                        <strong>{key}</strong>
                      </td>
                      {products.map((p) => (
                        <td key={p.id}>
                          {p.specifications && p.specifications[key] ? (
                            <span className="spec-val-highlight">{p.specifications[key]}</span>
                          ) : (
                            <span className="muted">&mdash;</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
