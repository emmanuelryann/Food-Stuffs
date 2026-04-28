import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const admin = localStorage.getItem('admin');

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
