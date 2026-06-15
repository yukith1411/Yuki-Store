import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const BannerManage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState('hero');
  const [imageFile, setImageFile] = useState(null);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      const { data } = await API.get('/banners/all');
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (err) {
      toast.error('Failed to load promotional banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setLink('');
    setType('hero');
    setImageFile(null);
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setLink(b.link || '');
    setType(b.type);
    setImageFile(null);
    setActive(b.active);
    setModalOpen(true);
  };

  const handleDeleteBanner = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this promotional banner?');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/banners/${id}`);
      if (data.success) {
        toast.info('Banner removed.');
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.warn('Banner title is required');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('link', link);
    formData.append('type', type);
    formData.append('active', active);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (editingBanner) {
        res = await API.put(`/banners/${editingBanner._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!imageFile) {
          toast.warn('Please upload a banner graphic');
          setSubmitting(false);
          return;
        }
        res = await API.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(`Banner ${editingBanner ? 'updated' : 'added'} successfully!`);
        setModalOpen(false);
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Banners & Graphics</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Create Banner
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Banner Graphic</th>
                <th>Title / Subtitle</th>
                <th>Placement Link</th>
                <th>Banner Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No banners configured.</td>
                </tr>
              ) : (
                banners.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <img src={b.image} alt={b.title} style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td>
                      <strong>{b.title}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.subtitle || 'N/A'}</span>
                    </td>
                    <td><code style={{ fontSize: '0.8rem' }}>{b.link || '/shop'}</code></td>
                    <td>
                      <span className={`status-badge status-${b.type === 'hero' ? 'info' : 'warning'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        {b.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.active ? 'success' : 'danger'}`}>
                        {b.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--info)', marginRight: '10px' }}
                        onClick={() => openEditModal(b)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteBanner(b._id)}
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
              <h3 style={{ fontWeight: 700 }}>{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
              <button className="nav-action-btn" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Banner Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Navigation URL (Redirect Link)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. /shop?category=women"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Placement Category</label>
                  <select
                    className="shop-sorting-select"
                    style={{ width: '100%', padding: '12px' }}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="hero">Home Hero slider</option>
                    <option value="offer">Marketing Offer Ribbon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image (Cloudinary Upload)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>

                {editingBanner && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="activeCheck"
                      className="filter-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <label htmlFor="activeCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Banner Active</label>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManage;
