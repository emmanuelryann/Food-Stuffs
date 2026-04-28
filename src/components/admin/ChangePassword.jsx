import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth, fetchCsrfToken } from '../../utils/api';
import '../../styles/admin/changepassword.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetchWithAuth(`${API}/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to change password');
      return result;
    },
    onSuccess: async (data) => {
      setSuccess(data.message || 'Password changed successfully. Redirecting to login…');
      setError('');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await fetchCsrfToken(); // fetch an anonymous token before redirecting
      setTimeout(() => {
        localStorage.removeItem('admin');
        navigate('/admin/login');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    mutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="change-password-page">
      <div className="page-header">
        <div>
          <h1>Change Password</h1>
          <p>Update your account password. You will be logged out after changing it.</p>
        </div>
      </div>

      <div className="password-card card">
        <form onSubmit={handleSubmit} className="password-form">
          {error && <div className="login-error">{error}</div>}
          {success && <div className="password-success">{success}</div>}

          <div className="input-group">
            <label htmlFor="current-pwd">Current Password</label>
            <div className="input-with-icon">
              <input
                id="current-pwd"
                type={showCurrent ? 'text' : 'password'}
                className="input"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="new-pwd">New Password</label>
            <div className="input-with-icon">
              <input
                id="new-pwd"
                type={showNew ? 'text' : 'password'}
                className="input"
                placeholder="Min. 8 characters, uppercase + number"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirm-pwd">Confirm New Password</label>
            <div className="input-with-icon">
              <input
                id="confirm-pwd"
                type={showConfirm ? 'text' : 'password'}
                className="input"
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <><span className="spinner"></span>Changing…</>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
