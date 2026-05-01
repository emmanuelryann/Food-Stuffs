import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth, fetchCsrfToken, API } from '../../utils/api';
import '../../styles/admin/admin.css';
import '../../styles/admin/login.css';



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await fetchWithAuth(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    },
    onSuccess: async (data) => {
      // Re-fetch CSRF token to sync with the new authenticated session cookie
      await fetchCsrfToken();
      localStorage.setItem('admin', JSON.stringify(data.admin));
      navigate('/admin', { replace: true });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card-glass">
          <div className="login-header">
            <h1><i className="fa-solid fa-utensils"></i> Food Stuffs</h1>
            <p>Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@foodstuffs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <span className="spinner"></span>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
