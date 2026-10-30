import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addReview } from '../services/reviewService';
import type { ProductReview } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderId?: string;
  onReviewSubmitted?: (review: ProductReview) => void;
}

const AVAILABLE_TAGS = [
  '🏆 Match Grade',
  '🛡️ Maximum Durability',
  '🎯 Pinpoint Control',
  '👌 Ergonomic Grip',
  '⚡ High Speed',
  '💯 Great Value'
];

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['🏆 Match Grade']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const ratingDescriptions: Record<number, string> = {
    1: '⭐ 1 / 5 - Poor Athletic Tolerance',
    2: '⭐ 2 / 5 - Below Expectations',
    3: '⭐ 3 / 5 - Average Training Gear',
    4: '⭐ 4 / 5 - Great Quality & Performance',
    5: '⭐ 5 / 5 - Elite Match / Tournament Grade'
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please add a headline for your feedback.');
      return;
    }
    if (!comment.trim() || comment.length < 10) {
      setError('Please write at least 10 characters describing your equipment experience.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewerName =
        user?.displayName ||
        (user?.email ? user.email.split('@')[0] : 'Verified Athlete');

      const newReview = addReview({
        productId,
        userId: user?.uid || 'guest-user',
        userName: reviewerName,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: true,
        orderId,
        tags: selectedTags
      });

      setSubmitted(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setTitle('');
        setComment('');
      }, 1500);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-ok">✓ VERIFIED PURCHASER</span>
              <span className="small muted">
                {orderId ? `Order #${orderId.slice(0, 8).toUpperCase()}` : 'Recent Purchase'}
              </span>
            </div>
            <h3 style={{ margin: '0.35rem 0 0' }}>Rate & Review Gear</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close review modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div className="center-box" style={{ padding: '2rem 1rem' }}>
              <div className="success-icon">&#10003;</div>
              <h3>Review Submitted!</h3>
              <p className="muted">
                Thank you for contributing your athletic feedback for <strong>{productName}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form" style={{ padding: 0 }}>
              <div>
                <span className="small muted" style={{ display: 'block' }}>
                  Equipment Item:
                </span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{productName}</strong>
              </div>

              {/* Interactive Star Rating Picker */}
              <div>
                <label style={{ marginBottom: '0.35rem' }}>Your Rating</label>
                <div className="star-picker-row" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${active ? 'star-active' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} star`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <div className="rating-desc-label">
                  {ratingDescriptions[hoverRating || rating]}
                </div>
              </div>

              {/* Performance Tag Pills */}
              <div>
                <label style={{ marginBottom: '0.35rem' }}>Key Performance Highlights</label>
                <div className="tag-pills-row">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        className={`tag-pill-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Headline */}
              <label>
                Headline / Summary
                <input
                  type="text"
                  placeholder="e.g. Incredible balance and durable grip on match day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              {/* Feedback Textarea */}
              <label>
                Detailed Athlete Review
                <textarea
                  rows={4}
                  placeholder="How did this product perform during your drills, training, or matches? Share gear fit, weight balance, and durability..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    padding: '0.6rem 0.7rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    font: 'inherit',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                  required
                />
              </label>

              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
