import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJsonWithAuth } from '../../utils/api';
import '../../styles/admin/analytics.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TABS = [
  { key: 'activity', label: 'Activity Logs' },
  { key: 'clicks', label: 'Click Insights' },
  { key: 'purchases', label: 'Purchase Insights' },
  { key: 'conversion', label: 'Conversion' },
];

function Analytics() {
  const [activeTab, setActiveTab] = useState('activity');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const buildDateParams = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    return params.toString() ? `?${params.toString()}` : '';
  };

  const { data: activityData, isLoading: loadingActivity } = useQuery({
    queryKey: ['activity-logs', dateFrom, dateTo],
    queryFn: () => fetchJsonWithAuth(`${API}/api/admin/analytics/activity-logs${buildDateParams()}`),
    enabled: activeTab === 'activity',
  });

  const { data: clickData, isLoading: loadingClicks } = useQuery({
    queryKey: ['click-insights', dateFrom, dateTo],
    queryFn: () => fetchJsonWithAuth(`${API}/api/admin/analytics/click-insights${buildDateParams()}`),
    enabled: activeTab === 'clicks',
  });

  const { data: purchaseData, isLoading: loadingPurchases } = useQuery({
    queryKey: ['purchase-insights', dateFrom, dateTo],
    queryFn: () => {
      const dateParams = buildDateParams();
      const statusParam = dateParams ? '&status=completed' : '?status=completed';
      return fetchJsonWithAuth(`${API}/api/admin/analytics/purchase-insights${dateParams}${statusParam}`);
    },
    enabled: activeTab === 'purchases',
  });

  const { data: conversionData, isLoading: loadingConversion } = useQuery({
    queryKey: ['conversion', dateFrom, dateTo],
    queryFn: () => fetchJsonWithAuth(`${API}/api/admin/analytics/conversion${buildDateParams()}`),
    enabled: activeTab === 'conversion',
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/settings`),
  });

  const currency = settings?.currencySymbol || '$';

  const isLoading = {
    activity: loadingActivity,
    clicks: loadingClicks,
    purchases: loadingPurchases,
    conversion: loadingConversion,
  }[activeTab];

  const getActionBadge = (action) => {
    if (action.includes('created') || action.includes('signup')) return 'badge-success';
    if (action.includes('deleted') || action.includes('cancelled')) return 'badge-danger';
    if (action.includes('updated') || action.includes('changed')) return 'badge-warning';
    if (action.includes('login') || action.includes('logout')) return 'badge-info';
    return 'badge-info';
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Track activity, clicks, purchases, and conversion rates.</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="input-group date-filter">
          <label htmlFor="date-from">From</label>
          <input
            id="date-from"
            type="date"
            className="input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="input-group date-filter">
          <label htmlFor="date-to">To</label>
          <input
            id="date-to"
            type="date"
            className="input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
            Clear Dates
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-screen">
          <div className="spinner spinner-lg"></div>
          <p>Loading data…</p>
        </div>
      ) : (
        <>
          {/* Activity Logs */}
          {activeTab === 'activity' && (
            <div>
              <p className="tab-count">{activityData?.total || 0} log(s)</p>
              {activityData?.logs?.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Performed By</th>
                        <th>Target</th>
                        <th>Details</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.logs.map((log) => (
                        <tr key={log._id}>
                          <td><span className={`badge ${getActionBadge(log.action)}`}>{log.action}</span></td>
                          <td className="performer-cell">{log.performedBy?.email || '—'}</td>
                          <td><span className="target-id">{log.targetId || '—'}</span></td>
                          <td className="details-cell">{log.details}</td>
                          <td className="date-cell">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No activity logs found</h3></div>
              )}
            </div>
          )}

          {/* Click Insights */}
          {activeTab === 'clicks' && (
            <div>
              <p className="tab-count">{clickData?.total || 0} product(s) tracked</p>
              {clickData?.insights?.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Click Count</th>
                        <th>Last Clicked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clickData.insights.map((item) => (
                        <tr key={item.productId}>
                          <td className="target-id">{item.productId}</td>
                          <td><span className="click-count">{item.clickCount}</span></td>
                          <td className="date-cell">{new Date(item.lastClicked).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No click data yet</h3></div>
              )}
            </div>
          )}

          {/* Purchase Insights */}
          {activeTab === 'purchases' && (
            <div>
              <p className="tab-count">{purchaseData?.total || 0} product(s) sold</p>
              {purchaseData?.insights?.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity Sold</th>
                        <th>Revenue</th>
                        <th>Orders</th>
                        <th>Last Ordered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseData.insights.map((item) => (
                        <tr key={item.productId}>
                          <td>
                            <div className="product-name">{item.productName}</div>
                            <div className="product-id">{item.productId}</div>
                          </td>
                          <td className="click-count">{item.totalQuantitySold}</td>
                          <td className="price-cell">{currency}{item.totalRevenue.toFixed(2)}</td>
                          <td>{item.orderCount}</td>
                          <td className="date-cell">{new Date(item.lastOrdered).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No purchase data yet</h3></div>
              )}
            </div>
          )}

          {/* Conversion */}
          {activeTab === 'conversion' && (
            <div>
              <p className="tab-count">{conversionData?.total || 0} product(s) analyzed</p>
              {conversionData?.insights?.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Clicks</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                        <th>Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversionData.insights.map((item) => (
                        <tr key={item.productId}>
                          <td>
                            <div className="product-name">{item.productName || '—'}</div>
                            <div className="product-id">{item.productId}</div>
                          </td>
                          <td className="click-count">{item.totalClicks}</td>
                          <td>{item.totalSales}</td>
                          <td className="price-cell">{currency}{item.totalRevenue.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              item.conversionRate === 'N/A' ? 'badge-info' :
                              parseFloat(item.conversionRate) > 10 ? 'badge-success' : 'badge-warning'
                            }`}>
                              {item.conversionRate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><h3>No conversion data yet</h3></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
