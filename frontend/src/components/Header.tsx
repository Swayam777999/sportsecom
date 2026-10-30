import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';

export default function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('peaknxt_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('peaknxt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const logoSrc = theme === 'dark' ? '/logo-icon-dark.png' : '/logo-icon.png';

  return (
    <header className="header">
      <div className="container header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" className="brand" aria-label="PeakNXT Home">
            <img
              src={logoSrc}
              alt="PeakNXT"
              className="brand-logo"
              onError={(e) => {
                // Fallback to transparent full logo if icon isn't found
                const target = e.currentTarget;
                if (!target.src.includes('logo-transparent.png')) {
                  target.src = '/logo-transparent.png';
                }
              }}
            />
            <span className="brand-title">PeakNXT</span>
          </Link>
          <span className="brand-tagline">Pro Athletic Performance</span>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            Shop
          </NavLink>
          {user ? (
            <>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/cart">Cart{count > 0 ? ` (${count})` : ''}</NavLink>
              <NavLink to="/account">Account</NavLink>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </div>
    </header>
  );
}
