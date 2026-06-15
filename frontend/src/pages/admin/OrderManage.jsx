import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEdit2, FiX, FiCheckCircle } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status updates modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      toast.error('Failed to load transaction orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await API.put(`/orders/${selectedOrder._id}/status`, {
        orderStatus,
        paymentStatus
      });

      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Manage Customer Orders</h2>

      {loading ? (
        <Skeleton height="350px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Total Price</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th style={{ textAlign: 'right' }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No orders placed yet.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td><strong style={{ fontSize: '0.85rem' }}>{ord._id}</strong></td>
                    <td>
                      <strong>{ord.user?.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ord.user?.email}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {ord.products?.map((p, idx) => (
                        <div key={idx}>
                          {p.name} {p.size && `(${p.size})`} x{p.quantity}
                        </div>
                      ))}
                    </td>
                    <td><strong>₹{ord.total}</strong></td>
                    <td>
                      <span className={`status-badge status-${ord.paymentStatus === 'Completed' ? 'success' : ord.paymentStatus === 'Pending' ? 'warning' : 'danger'}`}>
                        {ord.paymentMethod} - {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${ord.orderStatus === 'Cancelled' ? 'danger' : ord.orderStatus === 'Delivered' ? 'success' : 'warning'}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nav-action-btn"
                        style={{ color: 'var(--primary)' }}
                        onClick={() => openStatusModal(ord)}
                        disabled={ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Delivered'}
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Status Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3 style={{ fontWeight: 700 }}>Update Order Status</h3>
              <button className="nav-action-btn" onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleStatusSubmit}>
              <div className="admin-modal-body">
                <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                  Modifying statuses for Order: <strong>{selectedOrder?._id}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Delivery Order Status</label>
                  <select
                    className="shop-sorting-select"
                    style={{ width: '100%', padding: '12px' }}
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment status</label>
                  <select
                    className="shop-sorting-select"
                    style={{ width: '100%', padding: '12px' }}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Save Order State'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManage;
