import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../utils/api';
import '../../styles/admin/adminmanagement.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_OPTIONS = ['active', 'deactivated', 'suspended', 'deleted'];

function AdminManagement() {
  const queryClient = useQueryClient();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const isSuperAdmin = admin.role === 'super_admin';

  const [toast, setToast] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [newStatus, setNewStatus] = useState('active');
  const [statusConfirm, setStatusConfirm] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetchWithAuth(`${API}/api/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || 'Admin status updated');
      setStatusConfirm(false);
      setAdminId('');
    },
    onError: (err) => {
      showToast(err.message, 'error');
      setStatusConfirm(false);
    },
  });

  const getStatusBadge = (status) => {
    const map = {
      active: 'badge-success',
      deactivated: 'badge-warning',
      suspended: 'badge-danger',
      deleted: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  if (!isSuperAdmin) {
    return (
      <div className="admin-management-page">
        <div className="page-header">
          <div>
            <h1>Admin Management</h1>
          </div>
        </div>
        <div className="access-denied card">
          <h2>🔒 Access Restricted</h2>
          <p>Only Super Admins can access this page. Your current role is <strong>{admin.role}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-management-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1>Admin Management</h1>
          <p>Manage admin accounts and their access status.</p>
        </div>
      </div>

      <div className="management-card card">
        <h2 className="card-title">Update Admin Status</h2>
        <p className="card-desc">
          Change the status of any admin account. Deactivating, suspending, or deleting an admin
          will immediately terminate all their active sessions.
        </p>

        <div className="status-form">
          <div className="input-group">
            <label htmlFor="admin-id-input">Admin ID</label>
            <input
              id="admin-id-input"
              className="input"
              placeholder="Enter the admin's MongoDB ObjectId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="status-select">New Status</label>
            <select
              id="status-select"
              className="input"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            disabled={!adminId.trim() || statusMutation.isPending}
            onClick={() => setStatusConfirm(true)}
          >
            Update Status
          </button>
        </div>

        <div className="status-legend">
          <h3>Status Guide</h3>
          <div className="legend-grid">
            <div className="legend-item">
              <span className="badge badge-success">active</span>
              <span>Admin can log in and perform actions normally.</span>
            </div>
            <div className="legend-item">
              <span className="badge badge-warning">deactivated</span>
              <span>Account is disabled. Admin cannot log in.</span>
            </div>
            <div className="legend-item">
              <span className="badge badge-danger">suspended</span>
              <span>Account is frozen for investigation. Admin cannot log in.</span>
            </div>
            <div className="legend-item">
              <span className="badge badge-danger">deleted</span>
              <span>Account is marked as deleted. Admin cannot log in.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {statusConfirm && (
        <div className="modal-overlay" onClick={() => setStatusConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Status Change</h2>
            </div>
            <p>
              You are about to set admin <strong className="highlight-id">{adminId}</strong> to{' '}
              <span className={`badge ${getStatusBadge(newStatus)}`}>{newStatus}</span>.
            </p>
            {newStatus !== 'active' && (
              <p className="warning-text">
                ⚠️ This will immediately terminate all active sessions for this admin.
              </p>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStatusConfirm(false)}>Cancel</button>
              <button
                className={`btn ${newStatus === 'active' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => statusMutation.mutate({ id: adminId, status: newStatus })}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? (
                  <><span className="spinner"></span>Updating…</>
                ) : (
                  `Set to ${newStatus}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
