import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const BrandManage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      const { data } = await API.get('/brands');
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (err) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setName('');
    setDescription('');
    setLogoFile(null);
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setDescription(brand.description || '');
    setLogoFile(null);
    setActive(brand.active);
    setModalOpen(true);
  };

  const handleDeleteBrand = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this brand?');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/brands/${id}`);
      if (data.success) {
        toast.info('Brand deleted.');
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.warn('Brand name is required');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('active', active);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      let res;
      if (editingBrand) {
        res = await API.put(`/brands/${editingBrand._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/brands', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(`Brand ${editingBrand ? 'updated' : 'added'} successfully!`);
        setModalOpen(false);
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Brands</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Brand
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Brand Name</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No brands found.</td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand._id}>
                    <td>
                      <img src={brand.logo} alt={brand.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td><strong>{brand.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{brand.description || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${brand.active ? 'success' : 'danger'}`}>
                        {brand.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--info)', marginRight: '10px' }}
                        onClick={() => openEditModal(brand)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteBrand(brand._id)}
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
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3 style={{ fontWeight: 700 }}>{editingBrand ? 'Edit Brand' : 'Create Brand'}</h3>
              <button className="nav-action-btn" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand Logo (Cloudinary Upload)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                  />
                </div>
                {editingBrand && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="activeCheck"
                      className="filter-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <label htmlFor="activeCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Brand Active</label>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManage;
