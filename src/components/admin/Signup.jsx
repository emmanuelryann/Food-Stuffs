import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '../../utils/api';
import '../../styles/admin/admin.css';
import '../../styles/admin/login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetchWithAuth(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Signup failed');
      return result;
    },
    onSuccess: () => {
      setSuccess('Admin account created successfully! Redirecting...');
      setTimeout(() => navigate('/admin/login'), 2500);
    },
    onError: (err) => {
      setError(err.message);
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    signupMutation.mutate(submitData);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card-glass">
          <div className="login-header">
            <h1><i className="fa-solid fa-utensils"></i> Food Stuffs</h1>
            <p>Create Admin Account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-toast">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}
            {success && (
              <div className="login-success-toast">
                <i className="fa-solid fa-circle-check"></i>
                {success}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@foodstuffs.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Role</label>
              <select id="role" className="input" value={formData.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
