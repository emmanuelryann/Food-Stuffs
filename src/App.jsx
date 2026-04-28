import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/admin/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';
import Products from './components/admin/Products';
import Orders from './components/admin/Orders';
import Settings from './components/admin/Settings';
import Analytics from './components/admin/Analytics';
import ChangePassword from './components/admin/ChangePassword';
import AdminManagement from './components/admin/AdminManagement';
import { fetchCsrfToken } from './utils/api';

function App() {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/admin-management" element={<AdminManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
