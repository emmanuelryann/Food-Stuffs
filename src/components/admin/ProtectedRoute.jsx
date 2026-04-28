import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const admin = localStorage.getItem('admin');

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
