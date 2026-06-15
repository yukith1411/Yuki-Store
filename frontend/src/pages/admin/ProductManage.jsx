import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const ProductManage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState(''); // Comma separated string e.g. "Red, Blue"
  const [imageFiles, setImageFiles] = useState([]);
  
  // Promo checks
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [trending, setTrending] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Size list presets
  const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'UK-7', 'UK-8', 'UK-9', 'UK-10'];

  const fetchDropdowns = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        API.get('/categories'),
        API.get('/brands')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories.filter(c => c.active));
      if (brandRes.data.success) setBrands(brandRes.data.brands.filter(b => b.active));
    } catch (err) {
      toast.error('Failed to load filter metadata');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?limit=100'); // Load bulk list for admin
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      toast.error('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchDropdowns();
      await fetchProducts();
    };
    loadAll();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setSelectedBrand(brands[0]?._id || '');
    setSelectedCategory(categories[0]?._id || '');
    setStock('10');
    setSizes(['M', 'L']);
    setColors('Black, Blue');
    setImageFiles([]);
    setFeatured(false);
    setNewArrival(true);
    setTrending(false);
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setDiscountPrice(prod.discountPrice || '');
    setSelectedBrand(prod.brand?._id || prod.brand || '');
    setSelectedCategory(prod.category?._id || prod.category || '');
    setStock(prod.stock);
    setSizes(prod.sizes || []);
    setColors(prod.colors?.join(', ') || '');
    setImageFiles([]);
    setFeatured(prod.featured || false);
    setNewArrival(prod.newArrival || false);
    setTrending(prod.trending || false);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/products/${id}`);
      if (data.success) {
        toast.info('Product deleted.');
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSizeCheckbox = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !selectedCategory || !selectedBrand) {
      toast.warn('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('discountPrice', discountPrice || 0);
    formData.append('brand', selectedBrand);
    formData.append('category', selectedCategory);
    formData.append('stock', stock);
    formData.append('featured', featured);
    formData.append('newArrival', newArrival);
    formData.append('trending', trending);

    // Map sizes & colors arrays
    formData.append('sizes', JSON.stringify(sizes));
    const parsedColors = colors.split(',').map((c) => c.trim()).filter((c) => c !== '');
    formData.append('colors', JSON.stringify(parsedColors));

    // Append images
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }
    }

    try {
      let res;
      if (editingProduct) {
        // For updates, we can retain existing images by default
        formData.append('existingImages', JSON.stringify(editingProduct.images));
        res = await API.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
        setModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Products</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <Skeleton height="350px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Apparel Title</th>
                <th>Price / Discount</th>
                <th>Stock</th>
                <th>Brand</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No products in database.</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <img src={prod.images && prod.images[0]} alt={prod.name} style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td>
                      <strong>{prod.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {prod.featured && <span style={{ marginRight: '6px', color: 'var(--info)' }}>★ Featured</span>}
                        {prod.trending && <span style={{ color: 'var(--warning)' }}>✦ Trending</span>}
                      </div>
                    </td>
                    <td>
                      <strong>₹{prod.discountPrice > 0 ? prod.discountPrice : prod.price}</strong>
                      {prod.discountPrice > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{prod.price}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${prod.stock > 10 ? 'success' : prod.stock > 0 ? 'warning' : 'danger'}`}>
                        {prod.stock} Left
                      </span>
                    </td>
                    <td>{prod.brand?.name || 'Zara'}</td>
                    <td>{prod.category?.name || 'Men'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--info)', marginRight: '10px' }}
                        onClick={() => openEditModal(prod)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteProduct(prod._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '700px' }}>
            <div className="admin-modal-header">
              <h3 style={{ fontWeight: 700 }}>{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
              <button className="nav-action-btn" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Apparel Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Discount Price (Optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category</label>
                    <select
                      className="shop-sorting-select"
                      style={{ width: '100%', padding: '12px' }}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Brand</label>
                    <select
                      className="shop-sorting-select"
                      style={{ width: '100%', padding: '12px' }}
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Apparel Sizes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {sizePresets.map((sz) => (
                        <label key={sz} className="filter-checkbox-label" style={{ backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px' }}>
                          <input
                            type="checkbox"
                            className="filter-checkbox"
                            checked={sizes.includes(sz)}
                            onChange={() => handleSizeCheckbox(sz)}
                          />
                          {sz}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Colors (Comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Red, Blue, Black"
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Upload Images (Select files)</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(e.target.files)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                      Feature on Home Banner Slider
                    </label>
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={newArrival}
                        onChange={(e) => setNewArrival(e.target.checked)}
                      />
                      Mark as New Arrival
                    </label>
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={trending}
                        onChange={(e) => setTrending(e.target.checked)}
                      />
                      Mark as Trending Collection
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManage;
