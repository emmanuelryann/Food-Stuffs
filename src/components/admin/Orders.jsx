import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth, API } from '../../utils/api';
import '../../styles/admin/orders.css';


function Orders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}/api/orders`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/settings`),
  });

  const currency = settings?.currencySymbol || '$';

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetchWithAuth(`${API}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('Order status updated');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetchWithAuth(`${API}/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDeleteConfirm(null);
      showToast('Order deleted');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (orderIds) => {
      const res = await fetchWithAuth(`${API}/api/orders/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrders([]);
      setBulkDeleteConfirm(false);
      showToast(data.message || 'Orders deleted');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map((o) => o.orderId));
    }
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };
    return map[status] || 'badge-info';
  };

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p>Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total order(s)</p>
        </div>
        {selectedOrders.length > 0 && (
          <button className="btn btn-danger" onClick={() => setBulkDeleteConfirm(true)}>
            Delete Selected ({selectedOrders.length})
          </button>
        )}
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search by order ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>{search || filter !== 'all' ? 'Try different filters.' : 'Orders will appear here.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.orderId} className={selectedOrders.includes(order.orderId) ? 'row-selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.orderId)}
                      onChange={() => toggleSelect(order.orderId)}
                    />
                  </td>
                  <td>
                    <button
                      className="order-id-link"
                      onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                    >
                      {order.orderId}
                    </button>
                  </td>
                  <td>{order.customerName || '—'}</td>
                  <td>{order.items.length} item(s)</td>
                  <td className="price-cell">{currency}{order.totalAmount.toFixed(2)}</td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-dot ${order.status}`}></span>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => statusMutation.mutate({ id: order.orderId, status: e.target.value })}
                        disabled={statusMutation.isPending}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => setExpandedOrder(order.orderId)}
                        title="View Details"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => setDeleteConfirm(order)}
                        title="Delete Order"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expanded Order Detail */}
      {expandedOrder && (
        <div className="modal-overlay" onClick={() => setExpandedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details — {expandedOrder}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpandedOrder(null)}>✕</button>
            </div>
            {(() => {
              const order = orders.find((o) => o.orderId === expandedOrder);
              if (!order) return null;
              return (
                <div className="order-detail">
                  <div className="detail-row"><span>Customer:</span><span>{order.customerName || '—'}</span></div>
                  <div className="detail-row"><span>Phone:</span><span>{order.customerPhone || '—'}</span></div>
                  <div className="detail-row"><span>Address:</span><span>{order.customerAddress}</span></div>
                  <div className="detail-row"><span>Status:</span><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></div>
                  <div className="detail-row"><span>Date:</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
                  <h3 className="items-title">Items</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{currency}{item.priceAtPurchase.toFixed(2)}</td>
                            <td className="price-cell">{currency}{(item.quantity * item.priceAtPurchase).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="order-totals">
                    <div className="detail-row"><span>Delivery Fee:</span><span>{currency}{order.deliveryFee.toFixed(2)}</span></div>
                    <div className="detail-row total-row"><span>Total:</span><span>{currency}{order.totalAmount.toFixed(2)}</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Order</h2></div>
            <p>Are you sure you want to delete order <strong>{deleteConfirm.orderId}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.orderId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setBulkDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Bulk Delete</h2></div>
            <p>Are you sure you want to delete <strong>{selectedOrders.length}</strong> order(s)? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setBulkDeleteConfirm(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => bulkDeleteMutation.mutate(selectedOrders)}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? 'Deleting…' : `Delete ${selectedOrders.length} Orders`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
