import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/admin/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './components/admin/Login';
import Signup from './components/admin/Signup';
import Dashboard from './components/admin/Dashboard';
import Products from './components/admin/Products';
import Orders from './components/admin/Orders';
import Settings from './components/admin/Settings';
import Analytics from './components/admin/Analytics';
import ChangePassword from './components/admin/ChangePassword';
import AdminManagement from './components/admin/AdminManagement';
import { fetchCsrfToken } from './utils/api';
import LandingPage from './components/general/LandingPage';

function App() {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <Routes>
      {/* General / User Facing Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register-4728" element={<Signup />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="admin-management" element={<AdminManagement />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;