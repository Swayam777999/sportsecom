import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, getMe } from '../services/api';
import type { UserProfile } from '../types';
import { useAuth } from '../auth/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/format';

export default function AccountPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMe()
      .then((p) => {
        if (!cancelled) setProfile(p);
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
  }, [reloadKey]);

  const onLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (loading) return <Loader label="Loading your account..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <div>
      <h1>My account</h1>
      <div className="card form">
        <div>
          <span className="muted small">Name</span>
          <p>{profile?.displayName}</p>
        </div>
        <div>
          <span className="muted small">Email</span>
          <p>{profile?.email}</p>
        </div>
        <div>
          <span className="muted small">Member since</span>
          <p>{profile ? formatDate(profile.createdAt) : ''}</p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}
