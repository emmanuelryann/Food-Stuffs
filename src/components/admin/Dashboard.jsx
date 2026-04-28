import { useQuery } from '@tanstack/react-query';
import { fetchJsonWithAuth } from '../../utils/api';
import '../../styles/admin/dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/products`),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/orders`),
  });

  const { data: clickData, isLoading: loadingClicks } = useQuery({
    queryKey: ['click-insights'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/admin/analytics/click-insights`),
  });

  const isLoading = loadingProducts || loadingOrders || loadingClicks;

  const totalProducts = products?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;
  const completedOrders = orders?.filter((o) => o.status === 'completed').length || 0;
  const totalRevenue = orders
    ?.filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0) || 0;
  const totalClicks = clickData?.insights?.reduce((sum, c) => sum + c.clickCount, 0) || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here is an overview of your store.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-sub">Active in store</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{pendingOrders}</div>
          <div className="stat-sub">Awaiting action</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Completed Orders</div>
          <div className="stat-value">{completedOrders}</div>
          <div className="stat-sub">Successfully fulfilled</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${totalRevenue.toFixed(2)}</div>
          <div className="stat-sub">From completed sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👆</div>
          <div className="stat-label">Total Clicks</div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-sub">WhatsApp click intents</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="order-id-cell">{order.orderId}</td>
                    <td>{order.customerName || '—'}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
