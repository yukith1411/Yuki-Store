import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const CouponManage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minPurchase, setMinPurchase] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/coupons');
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      toast.error('Failed to load coupons database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('Percentage');
    setDiscountAmount('');
    setMinPurchase('0');
    setExpiryDate('');
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountAmount(c.discountAmount);
    setMinPurchase(c.minPurchase);
    // Format date string for input type="date" (YYYY-MM-DD)
    const rawDate = new Date(c.expiryDate);
    const dateFormatted = rawDate.toISOString().split('T')[0];
    setExpiryDate(dateFormatted);
    setActive(c.active);
    setModalOpen(true);
  };

  const handleDeleteCoupon = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this coupon?');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/coupons/${id}`);
      if (data.success) {
        toast.info('Coupon deleted.');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountAmount || !expiryDate) {
      toast.warn('All fields are required');
      return;
    }

    setSubmitting(true);
    const couponBody = {
      code,
      discountType,
      discountAmount: Number(discountAmount),
      minPurchase: Number(minPurchase),
      expiryDate,
      active
    };

    try {
      let res;
      if (editingCoupon) {
        res = await API.put(`/coupons/${editingCoupon._id}`, couponBody);
      } else {
        res = await API.post('/coupons', couponBody);
      }

      if (res.data.success) {
        toast.success(`Coupon ${editingCoupon ? 'updated' : 'added'} successfully!`);
        setModalOpen(false);
        fetchCoupons();
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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Discount Coupons</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Create Coupon
        </button>
      </div>

      {loading ? (
        <Skeleton height="300px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Promo Code</th>
                <th>Discount Value</th>
                <th>Min Purchase Required</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No discount coupons active.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td><strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{c.code}</strong></td>
                    <td>{c.discountType === 'Percentage' ? `${c.discountAmount}%` : `₹${c.discountAmount}`}</td>
                    <td>₹{c.minPurchase || 0}</td>
                    <td>{new Date(c.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>
                      <span className={`status-badge status-${c.active ? 'success' : 'danger'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--info)', marginRight: '10px' }}
                        onClick={() => openEditModal(c)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteCoupon(c._id)}
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
              <h3 style={{ fontWeight: 700 }}>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button className="nav-action-btn" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SUMMER50"
                    style={{ textTransform: 'uppercase' }}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="shop-sorting-select"
                    style={{ width: '100%', padding: '12px' }}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (INR)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={discountType === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Purchase Requirement (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1000"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>

                {editingCoupon && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="activeCheck"
                      className="filter-checkbox"
                      style={{ width: '20px', height: '20px' }}
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <label htmlFor="activeCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Coupon Active</label>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManage;
