import { useState } from 'react';
import type { Product } from '../types';
import { formatMoney } from '../utils/format';
import { useCart } from '../cart/CartContext';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../constants';

interface GearAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function GearAdvisorModal({ isOpen, onClose, products }: GearAdvisorModalProps) {
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingAll, setAddingAll] = useState(false);
  const [allAdded, setAllAdded] = useState(false);

  if (!isOpen) return null;

  const sportsOptions = [
    { id: 'cricket', name: 'Cricket', icon: '🏏', categories: ['Bats', 'Balls', 'Protective Gear'] },
    { id: 'football', name: 'Football', icon: '⚽', categories: ['Balls', 'Protective Gear', 'Training Equipment'] },
    { id: 'tennis_badminton', name: 'Racket Sports', icon: '🏸', categories: ['Rackets', 'Balls'] },
    { id: 'fitness', name: 'Fitness & Gym', icon: '🏋️', categories: ['Fitness', 'Training Equipment'] },
    { id: 'swimming', name: 'Swimming', icon: '🏊', categories: ['Swimming'] }
  ];

  const skillOptions = [
    { id: 'beginner', title: 'Beginner / Casual', desc: 'Starting out, focused on durability and ease of use.' },
    { id: 'intermediate', title: 'Club / Regular', desc: 'Playing weekly, seeking balance of speed and control.' },
    { id: 'pro', title: 'Elite / Tournament', desc: 'Maximum performance, tournament-grade materials.' }
  ];

  const goalOptions = [
    { id: 'match', title: 'Match Day Performance', desc: 'High responsiveness and official match standards.' },
    { id: 'training', title: 'Daily Training & Drills', desc: 'Heavy durability, workout stamina and agility.' },
    { id: 'power', title: 'Strength & Speed', desc: 'Power output, cardio conditioning, and muscle build.' }
  ];

  // Calculate recommendations
  const getRecommendations = () => {
    const currentSport = sportsOptions.find((s) => s.id === selectedSport);
    const targetCats = currentSport ? currentSport.categories : [];

    let pool = products.filter((p) => p.inStock && targetCats.some((c) => p.category.toLowerCase().includes(c.toLowerCase())));
    if (pool.length === 0) pool = products.filter((p) => p.inStock).slice(0, 4);

    // Sort by price depending on skill level
    if (skillLevel === 'beginner') {
      pool.sort((a, b) => a.price - b.price);
    } else if (skillLevel === 'pro') {
      pool.sort((a, b) => b.price - a.price);
    }

    return pool.slice(0, 3).map((p, idx) => ({
      ...p,
      matchScore: 99 - idx * 4,
      tag: idx === 0 ? "Coach's Top Pick" : idx === 1 ? 'High Performance' : 'Best Value'
    }));
  };

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

  const handleAddEntireKit = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    const recs = getRecommendations();
    setAddingAll(true);
    try {
      for (const p of recs) {
        if (!addedIds.has(p.id)) {
          await add(p.id, 1);
          setAddedIds((prev) => new Set(prev).add(p.id));
        }
      }
      setAllAdded(true);
    } finally {
      setAddingAll(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedSport('');
    setSkillLevel('');
    setPrimaryGoal('');
    setAddedIds(new Set());
    setAddingAll(false);
    setAllAdded(false);
  };

  const recommendations = step === 4 ? getRecommendations() : [];
  const kitTotalPrice = recommendations.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card advisor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="advisor-title-row">
            <span className="advisor-logo">⚡ PeakGear AI</span>
            <span className="badge badge-ok">Smart Matchmaker</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Progress Bar */}
        <div className="advisor-progress">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div>
              <h3>Step 1 of 3: What is your primary sport?</h3>
              <p className="muted small">PeakGear AI will calibrate recommendations to your athletic discipline.</p>
              <div className="option-grid">
                {sportsOptions.map((s) => (
                  <button
                    key={s.id}
                    className={`advisor-option ${selectedSport === s.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSport(s.id);
                      setStep(2);
                    }}
                  >
                    <span className="option-icon">{s.icon}</span>
                    <span className="option-title">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>Step 2 of 3: What is your skill level?</h3>
              <p className="muted small">We balance gear tolerance, weight, and specifications for your stage.</p>
              <div className="option-list">
                {skillOptions.map((s) => (
                  <button
                    key={s.id}
                    className={`advisor-card-option ${skillLevel === s.id ? 'active' : ''}`}
                    onClick={() => {
                      setSkillLevel(s.id);
                      setStep(3);
                    }}
                  >
                    <div>
                      <strong>{s.title}</strong>
                      <p className="muted small">{s.desc}</p>
                    </div>
                    <span className="arrow-indicator">&rarr;</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-small" onClick={() => setStep(1)} style={{ marginTop: '1rem' }}>
                &larr; Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>Step 3 of 3: What is your primary training goal?</h3>
              <p className="muted small">Match performance, endurance development, or power training.</p>
              <div className="option-list">
                {goalOptions.map((g) => (
                  <button
                    key={g.id}
                    className={`advisor-card-option ${primaryGoal === g.id ? 'active' : ''}`}
                    onClick={() => {
                      setPrimaryGoal(g.id);
                      setStep(4);
                    }}
                  >
                    <div>
                      <strong>{g.title}</strong>
                      <p className="muted small">{g.desc}</p>
                    </div>
                    <span className="arrow-indicator">&rarr;</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-small" onClick={() => setStep(2)} style={{ marginTop: '1rem' }}>
                &larr; Back
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="advisor-results-header">
                <h3>🏆 Your Tailored Peak Gear Kit</h3>
                <p className="muted small">
                  Curated for {sportsOptions.find((s) => s.id === selectedSport)?.name} &middot;{' '}
                  {skillOptions.find((s) => s.id === skillLevel)?.title}
                </p>
              </div>

              {/* 1-Click Complete Bundle Callout */}
              <div className="bundle-callout card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-ok">1-CLICK BUNDLE</span>
                    <strong>Complete Kit ({recommendations.length} Items)</strong>
                  </div>
                  <p className="muted small" style={{ margin: '0.25rem 0 0' }}>
                    Total Kit Price: <strong>{formatMoney(kitTotalPrice, 'INR')}</strong> &middot; Free Express Delivery
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddEntireKit}
                  disabled={addingAll || allAdded}
                >
                  {allAdded ? '✓ Entire Kit in Cart' : addingAll ? 'Adding Entire Kit...' : '⚡ Add Complete Kit to Cart'}
                </button>
              </div>

              <div className="recommended-list">
                {recommendations.map((p) => (
                  <div key={p.id} className="rec-card card">
                    <img
                      src={p.imageUrl ?? PLACEHOLDER_IMAGE}
                      alt={p.name}
                      className="rec-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="rec-info">
                      <div className="row-between">
                        <span className="badge badge-ok">{p.tag}</span>
                        <span className="match-pill">{p.matchScore}% Match</span>
                      </div>
                      <strong style={{ display: 'block', margin: '0.25rem 0' }}>{p.name}</strong>
                      <span className="muted small">{p.category}</span>
                      <div className="row-between" style={{ marginTop: '.5rem' }}>
                        <span className="rec-price">{formatMoney(p.price, p.currency)}</span>
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => handleAddToCart(p)}
                          disabled={addingId === p.id || addedIds.has(p.id)}
                        >
                          {addedIds.has(p.id) ? '✓ In Cart' : addingId === p.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-small" onClick={reset}>
                  🔄 Start Over
                </button>
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                >
                  View Cart &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
