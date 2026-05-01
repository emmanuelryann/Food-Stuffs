import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth, API } from '../../utils/api';
import '../../styles/admin/adminmanagement.css';


const STATUS_OPTIONS = ['active', 'deactivated', 'suspended', 'deleted'];
const ROLE_OPTIONS = ['admin', 'super_admin'];

function AdminManagement() {
  const queryClient = useQueryClient();
  const loggedInAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
  const isSuperAdmin = loggedInAdmin.role === 'super_admin';

  const [toast, setToast] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);
  
  // Edit State
  const [editAdmin, setEditAdmin] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editStatus, setEditStatus] = useState('active');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}/api/admins`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admins');
      return data;
    },
    enabled: isSuperAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await fetchWithAuth(`${API}/api/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update admin');
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || 'Admin updated successfully');
      setEditAdmin(null);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => {
      showToast(err.message, 'error');
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

  const handleEditClick = (admin) => {
    setEditAdmin(admin);
    setEditName(admin.name);
    setEditRole(admin.role);
    setEditStatus(admin.status);
  };

  const handleUpdateAdmin = () => {
    if (!editAdmin) return;
    const updates = {};
    if (editName !== editAdmin.name) updates.name = editName;
    if (editRole !== editAdmin.role) updates.role = editRole;
    if (editStatus !== editAdmin.status) updates.status = editStatus;
    
    if (Object.keys(updates).length > 0) {
      updateMutation.mutate({ id: editAdmin._id, updates });
    } else {
      setEditAdmin(null);
    }
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
          <h2><i className="fa-solid fa-lock"></i> Access Restricted</h2>
          <p>Only Super Admins can access this page. Your current role is <strong>{loggedInAdmin.role}</strong>.</p>
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
          <p>Manage admin accounts, roles, and access statuses.</p>
        </div>
      </div>

      <div className="management-card card">
        {isLoading ? (
          <div className="loading-screen">
            <div className="spinner spinner-lg"></div>
            <p>Loading admins…</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <h3>No admins found</h3>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin?._id || index}>
                    <td><strong>{admin?.name}</strong></td>
                    <td>{admin?.email}</td>
                    <td>
                      <span className={`badge ${admin.role === 'super_admin' ? 'badge-info' : 'badge-neutral'}`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(admin.status)}`}>{admin.status}</span>
                    </td>
                    <td className="date-cell">{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => setViewAdmin(admin)}
                          title="View Admin"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => handleEditClick(admin)}
                          title="Edit Admin"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Admin Modal */}
      {viewAdmin && (
        <div className="modal-overlay" onClick={() => setViewAdmin(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Details</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewAdmin(null)}>✕</button>
            </div>
            <div className="admin-detail">
              <div className="detail-row"><span>Name:</span><span>{viewAdmin.name}</span></div>
              <div className="detail-row"><span>Email:</span><span>{viewAdmin.email}</span></div>
              <div className="detail-row"><span>Role:</span><span className="badge badge-info">{viewAdmin.role.replace('_', ' ')}</span></div>
              <div className="detail-row"><span>Status:</span><span className={`badge ${getStatusBadge(viewAdmin.status)}`}>{viewAdmin.status}</span></div>
              <div className="detail-row"><span>Email Verified:</span><span>{viewAdmin.isEmailVerified ? 'Yes' : 'No'}</span></div>
              <div className="detail-row"><span>Last Login:</span><span>{viewAdmin.lastLogin ? new Date(viewAdmin.lastLogin).toLocaleString() : 'Never'}</span></div>
              <div className="detail-row"><span>Created At:</span><span>{new Date(viewAdmin.createdAt).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editAdmin && (
        <div className="modal-overlay" onClick={() => setEditAdmin(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Admin</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditAdmin(null)}>✕</button>
            </div>
            <div className="admin-form">
              <div className="input-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="edit-role">Role</label>
                <select
                  id="edit-role"
                  className="input"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={editAdmin?._id === (loggedInAdmin?.id || loggedInAdmin?._id)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
                {editAdmin?._id === (loggedInAdmin?.id || loggedInAdmin?._id) && (
                  <span className="input-hint">You cannot change your own role.</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  className="input"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={editAdmin?._id === (loggedInAdmin?.id || loggedInAdmin?._id)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {editAdmin?._id === (loggedInAdmin?.id || loggedInAdmin?._id) && (
                  <span className="input-hint">You cannot change your own status.</span>
                )}
              </div>
            </div>
            
            {editStatus !== 'active' && editStatus !== editAdmin.status && (
              <p className="warning-text" style={{ marginBottom: '16px' }}>
                ⚠️ Deactivating, suspending, or deleting will terminate their active sessions immediately.
              </p>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditAdmin(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateAdmin}
                disabled={updateMutation.isPending || (!editName.trim())}
              >
                {updateMutation.isPending ? (
                  <><span className="spinner"></span>Saving…</>
                ) : (
                  'Save Changes'
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
