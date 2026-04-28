import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJsonWithAuth } from '../../utils/api';
import '../../styles/admin/settings.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Settings() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    fixedDeliveryFee: '',
    minOrderAmount: '',
    whatsappNumber: '',
    currencySymbol: '',
    isStoreOpen: true,
    promoBanner: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchJsonWithAuth(`${API}/api/settings`),
  });

  useEffect(() => {
    if (settings) {
      setForm({
        fixedDeliveryFee: settings.fixedDeliveryFee?.toString() || '0',
        minOrderAmount: settings.minOrderAmount?.toString() || '0',
        whatsappNumber: settings.whatsappNumber || '',
        currencySymbol: settings.currencySymbol || '$',
        isStoreOpen: settings.isStoreOpen ?? true,
        promoBanner: settings.promoBanner || '',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return fetchJsonWithAuth(`${API}/api/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast('Settings saved successfully');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      fixedDeliveryFee: parseFloat(form.fixedDeliveryFee) || 0,
      minOrderAmount: parseFloat(form.minOrderAmount) || 0,
      whatsappNumber: form.whatsappNumber,
      currencySymbol: form.currencySymbol,
      isStoreOpen: form.isStoreOpen,
      promoBanner: form.promoBanner,
    });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p>Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1>Store Settings</h1>
          <p>Configure your store preferences and display options.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2 className="section-title"><i className="fa-solid fa-dollar-sign"></i> Pricing</h2>
          <div className="settings-grid">
            <div className="input-group">
              <label htmlFor="currency">Currency Symbol</label>
              <input
                id="currency"
                className="input"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                maxLength={5}
              />
            </div>

            <div className="input-group">
              <label htmlFor="delivery-fee">Fixed Delivery Fee</label>
              <input
                id="delivery-fee"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.fixedDeliveryFee}
                onChange={(e) => setForm({ ...form, fixedDeliveryFee: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label htmlFor="min-order">Minimum Order Amount</label>
              <input
                id="min-order"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title"><i className="fa-solid fa-mobile-screen-button"></i> Contact & Display</h2>
          <div className="settings-grid">
            <div className="input-group">
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                id="whatsapp"
                className="input"
                placeholder="e.g. 2348012345678"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              />
              <span className="input-hint">Include country code without + or spaces</span>
            </div>

            <div className="input-group">
              <label htmlFor="promo">Promo Banner Message</label>
              <textarea
                id="promo"
                className="input settings-textarea"
                rows="3"
                placeholder="e.g. Free delivery on orders over $50!"
                value={form.promoBanner}
                onChange={(e) => setForm({ ...form, promoBanner: e.target.value })}
                maxLength={500}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title"><i className="fa-solid fa-store"></i> Store Status</h2>
          <div className="store-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.isStoreOpen}
                onChange={(e) => setForm({ ...form, isStoreOpen: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
            <div className="toggle-info">
              <span className="toggle-status">
                Store is {form.isStoreOpen ? 'Open' : 'Closed'}
              </span>
              <span className="toggle-desc">
                {form.isStoreOpen
                  ? 'Customers can place orders.'
                  : 'Customers cannot place orders while the store is closed.'}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <><span className="spinner"></span>Saving…</>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
