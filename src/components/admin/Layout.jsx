import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth, fetchCsrfToken } from '../../utils/api';
import '../../styles/admin/admin.css';
import '../../styles/admin/layout.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '🧾' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { path: '/admin/admin-management', label: 'Admin Management', icon: '👥' },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

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
    logoutMutation.mutate();
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">🍔 Food Stuffs</h2>
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
            <span className="nav-icon">🔒</span>
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
    </div>
  );
}

export default Layout;
