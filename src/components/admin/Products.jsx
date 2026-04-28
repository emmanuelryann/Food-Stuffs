import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../../styles/admin/products.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const IMAGEKIT_URL = import.meta.env.VITE_IMAGEKIT_URL || 'https://ik.imagekit.io/your_id';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC || '';

const fetchWithAuth = async (url, options = {}) => {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

function Products() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    countInStock: '', isActive: true,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchWithAuth(`${API}/api/products`),
  });

  const uploadToImageKit = async (file) => {
    // Step 1: Get auth signature from backend
    const sigRes = await fetch(
      `${API}/api/product/upload-signature?fileSize=${file.size}&fileType=${file.type}`,
      { credentials: 'include' }
    );
    if (!sigRes.ok) throw new Error('Failed to get upload signature');
    const { signature, expire, token } = await sigRes.json();

    // Step 2: Upload to ImageKit
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
    formData.append('signature', signature);
    formData.append('expire', expire);
    formData.append('token', token);
    formData.append('fileName', file.name);
    formData.append('folder', '/food-stuffs/products');

    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('Image upload failed');
    const uploadData = await uploadRes.json();
    return { url: uploadData.url, fileId: uploadData.fileId };
  };

  const createMutation = useMutation({
    mutationFn: async (productData) => {
      return fetchWithAuth(`${API}/api/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
      showToast('Product created successfully');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return fetchWithAuth(`${API}/api/product/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
      showToast('Product updated successfully');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return fetchWithAuth(`${API}/api/product/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteConfirm(null);
      showToast('Product deleted successfully');
    },
    onError: (err) => showToast(err.message, 'error'),
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', category: '', countInStock: '', isActive: true });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      countInStock: product.countInStock.toString(),
      isActive: product.isActive,
    });
    setImageFile(null);
    setImagePreview(product.image?.url || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageData = editingProduct?.image || undefined;

      if (imageFile) {
        imageData = await uploadToImageKit(imageFile);
      }

      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        countInStock: parseInt(form.countInStock),
        isActive: form.isActive,
        ...(imageData && { image: imageData }),
      };

      if (editingProduct) {
        updateMutation.mutate({ id: editingProduct.productId, data: productData });
      } else {
        createMutation.mutate(productData);
      }
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending || uploading;

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p>Loading products…</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} product(s) in store</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>{search ? 'Try a different search term.' : 'Click "Add Product" to get started.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.productId}>
                  <td>
                    <div className="product-thumb">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.name} />
                      ) : (
                        <span className="no-image">📷</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-id">ID: {product.productId}</div>
                  </td>
                  <td>{product.category}</td>
                  <td className="price-cell">${product.price.toFixed(2)}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(product)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                <div className="input-group">
                  <label htmlFor="prod-name">Product Name</label>
                  <input
                    id="prod-name"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="prod-category">Category</label>
                  <input
                    id="prod-category"
                    className="input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="prod-price">Price</label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="prod-stock">Stock Count</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    className="input"
                    value={form.countInStock}
                    onChange={(e) => setForm({ ...form, countInStock: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group full-width">
                  <label htmlFor="prod-desc">Description</label>
                  <textarea
                    id="prod-desc"
                    className="input product-textarea"
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="input-group full-width">
                  <label htmlFor="prod-image">Product Image</label>
                  <input
                    id="prod-image"
                    type="file"
                    accept="image/*"
                    className="input file-input"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Product is active</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="spinner"></span>
                      {uploading ? 'Uploading…' : 'Saving…'}
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Product</h2>
            </div>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.productId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
