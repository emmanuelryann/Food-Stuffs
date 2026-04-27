import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import '../styles/layout.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/orders', label: 'Orders', icon: '🧾' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/admin-management', label: 'Admin Management', icon: '👥' },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`${API}/auth/logout`, { method: 'POST' });
    },
    onSuccess: () => {
      localStorage.removeItem('admin');
      navigate('/login');
    },
    onError: () => {
      localStorage.removeItem('admin');
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">🍔 Food Stuffs</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
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
            to="/change-password"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">🔒</span>
            <span className="nav-label">Change Password</span>
          </NavLink>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <span></span><span></span><span></span>
          </button>

          <div className="topbar-right">
            <div className="admin-info">
              <span className="admin-name">{admin.name || 'Admin'}</span>
              <span className="admin-role badge badge-info">{admin.role || 'admin'}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
