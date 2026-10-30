import { useState } from 'react';
import type { Order } from '../types';
import { formatDate, formatMoney } from '../utils/format';

interface OrderTrackerProps {
  order: Order;
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Derive tracking status milestones
  const steps = [
    { title: 'Order Confirmed', desc: 'Order received & logged in PeakNXT system', done: true },
    { title: 'Gear Quality Checked', desc: 'Equipment inspected for peak athletic tolerances', done: true },
    { title: 'Dispatched from Hub', desc: `Carrier: PeakNXT Logistics (Tracking #PKX-${order.id.slice(0, 6).toUpperCase()})`, done: true },
    { title: 'Out for Delivery', desc: 'Expected delivery to your doorstep within 1-2 business days', done: false }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-tracker-card card">
      <div className="row-between" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0 }}>🚚 Live Order Tracking & Dispatch Status</h3>
          <span className="muted small">
            Order Reference #{order.id.slice(0, 8).toUpperCase()} &middot; Placed on {formatDate(order.createdAt)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button className="btn btn-small" onClick={() => setShowInvoiceModal(true)}>
            🧾 View Tax Invoice
          </button>
          <button className="btn btn-small btn-primary" onClick={handlePrint}>
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="tracker-timeline">
        {steps.map((s, idx) => (
          <div key={s.title} className={`tracker-step ${s.done ? 'step-done' : 'step-pending'}`}>
            <div className="tracker-dot">
              {s.done ? '✓' : idx + 1}
            </div>
            <div className="tracker-label">
              <strong>{s.title}</strong>
              <span className="small muted">{s.desc}</span>
            </div>
            {idx < steps.length - 1 && <div className="tracker-connector" />}
          </div>
        ))}
      </div>

      {/* Printable Invoice Modal / Section */}
      {showInvoiceModal && (
        <div className="modal-backdrop" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-card invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🧾 PeakNXT Official Tax Invoice</h3>
              <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body printable-invoice" id="printable-invoice">
              <div className="invoice-header">
                <div>
                  <h2 className="brand-logo" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary)' }}>
                    PeakNXT
                  </h2>
                  <p className="small muted">Elite Sports & Athletic Performance Gear</p>
                  <p className="small muted">GSTIN / Tax ID: 29AAACP0123Q1Z2 &middot; PeakNXT Logistics Hub</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-ok">CONFIRMED ORDER</span>
                  <p className="small" style={{ marginTop: '0.4rem' }}>
                    <strong>Invoice #:</strong> INV-{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="small muted">
                    <strong>Date:</strong> {formatDate(order.createdAt)}
                  </p>
                  <p className="small muted">
                    <strong>Payment Mode:</strong> {order.paymentStatus}
                  </p>
                </div>
              </div>

              <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.productId}>
                      <td>
                        <strong>{i.name}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(i.unitPrice, order.currency)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(i.lineTotal, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="row-between">
                  <span className="muted">Subtotal:</span>
                  <strong>{formatMoney(order.subtotal, order.currency)}</strong>
                </div>
                <div className="row-between">
                  <span className="muted">Express Athletic Shipping:</span>
                  <span className="badge badge-ok">FREE</span>
                </div>
                <div className="row-between">
                  <span className="muted">Standard Sales Tax / GST (Included):</span>
                  <span>{formatMoney(order.total * 0.12, order.currency)}</span>
                </div>
                <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border)' }} />
                <div className="row-between" style={{ fontSize: '1.2rem' }}>
                  <strong>Grand Total:</strong>
                  <strong style={{ color: 'var(--primary)' }}>{formatMoney(order.total, order.currency)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #d1d5db' }}>
                <div className="invoice-footer muted small" style={{ margin: 0, padding: 0, border: 'none', textAlign: 'left' }}>
                  <p style={{ margin: 0 }}>
                    🛡️ <strong>Authentic PeakNXT Play-Tested Gear</strong>
                  </p>
                  <p style={{ margin: 0 }}>30-day manufacturer performance warranty included.</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem' }}>Scan QR on delivery to confirm receipt.</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.35rem', background: '#f3f4f6', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="#1f2937">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 2h2v4h-2v-4zm2 2h2v2h-2v-2zm-6-2h2v2h-2v-2z" />
                  </svg>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#4b5563', letterSpacing: '0.5px' }}>PKX-VERIFIED</div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn" onClick={() => setShowInvoiceModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
