import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth, fetchCsrfToken, API } from '../../utils/api';
import '../../styles/admin/admin.css';
import '../../styles/admin/layout.css';


const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <i className="fa-solid fa-chart-line"></i> },
  { path: '/admin/products', label: 'Products', icon: <i className="fa-solid fa-box"></i> },
  { path: '/admin/orders', label: 'Orders', icon: <i className="fa-solid fa-file-invoice"></i> },
  { path: '/admin/analytics', label: 'Analytics', icon: <i className="fa-solid fa-chart-column"></i> },
  { path: '/admin/settings', label: 'Settings', icon: <i className="fa-solid fa-gear"></i> },
  { path: '/admin/admin-management', label: 'Admin Management', icon: <i className="fa-solid fa-users"></i> },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [sidebarOpen]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`${API}/auth/logout`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Logout failed');
      return res.json();
    },
    onSuccess: async () => {
      // Fetch a new anonymous token after logout
      await fetchCsrfToken();
      localStorage.removeItem('admin');
      navigate('/admin/login');
    },
    onError: async () => {
      await fetchCsrfToken();
      localStorage.removeItem('admin');
      navigate('/admin/login');
    },
  });

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo"> Organico</h2>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/admin/change-password"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><i className="fa-solid fa-lock"></i></span>
            <span className="nav-label">Change Password</span>
          </NavLink>
        </div>
      </aside>

      {/* Main content area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="topbar-right">
            <div className="admin-info">
              <span className="admin-name">{admin.name || 'Admin'}</span>
              <span className="admin-role badge badge-info">{admin.role || 'admin'}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Logout</h2>
            </div>
            <p>Are you sure you want to log out? You will need to sign in again to access the admin dashboard.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <span className="spinner"></span>
                    Logging out…
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
