import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiFileText, FiXCircle, FiShoppingBag, FiPrinter, FiX } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoice modal
  const [activeInvoice, setActiveInvoice] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/myorders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
      toast.error('Could not load orders history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    try {
      const { data } = await API.put(`/orders/${orderId}/cancel`);
      if (data.success) {
        toast.info('Order cancelled successfully.');
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container section">
        <Skeleton height="50px" style={{ marginBottom: '30px' }} />
        <Skeleton height="150px" style={{ marginBottom: '20px' }} />
        <Skeleton height="150px" />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>My Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Review details, download invoices, or cancel pending requests.</p>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '60px 24px' }}>
          <FiShoppingBag className="empty-state-icon" />
          <h2>No Orders Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Looks like you haven't placed any orders with us yet.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Header */}
              <div className="order-card-header">
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Order ID</span>
                  <strong style={{ fontSize: '0.95rem' }}>{order._id}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Placed On</span>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Grand Total</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>₹{order.total}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Order Status</span>
                  <span className={`status-badge status-${order.orderStatus === 'Cancelled' ? 'danger' : order.orderStatus === 'Delivered' ? 'success' : 'warning'}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="order-card-body">
                <div>
                  {order.products.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="cart-item-attr">
                        {item.name} {item.size && <span>({item.size})</span>} {item.color && <span style={{ marginLeft: '6px' }}>({item.color})</span>}
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '12px' }}>x{item.quantity}</span>
                      </div>
                      <strong style={{ marginLeft: 'auto' }}>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                {/* Meta details */}
                <div className="order-meta-info">
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Payment Method</span>
                    <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Payment Status</span>
                    <strong>{order.paymentStatus}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Ship To</span>
                    <strong style={{ fontSize: '0.85rem' }}>
                      {order.address.street}, {order.address.city}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      onClick={() => setActiveInvoice(order)}
                    >
                      <FiFileText /> Invoice
                    </button>

                    {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        <FiXCircle /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div className="invoice-overlay" onClick={() => setActiveInvoice(null)}>
          <div className="invoice-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }} className="invoice-print-btn-row">
              <button
                className="nav-action-btn"
                style={{ fontSize: '1.5rem', marginBottom: '20px' }}
                onClick={() => setActiveInvoice(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="invoice-header">
              <div>
                <div className="invoice-brand">GRAND BAZAAR</div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                  Department Store
                </p>
              </div>
              <div className="invoice-meta">
                <h2>INVOICE</h2>
                <p>Invoice #: {activeInvoice._id.slice(-8).toUpperCase()}</p>
                <p>Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="invoice-bill-to">
              <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Billed To</h3>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
              <p>{activeInvoice.address.street}</p>
              <p>{activeInvoice.address.city}, {activeInvoice.address.state} - {activeInvoice.address.zipCode}</p>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Specs</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {activeInvoice.products.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {item.size && `Size: ${item.size}`}{item.color && `, Color: ${item.color}`}
                    </td>
                    <td>₹{item.price}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-summary">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                <span>Subtotal:</span>
                <strong>₹{activeInvoice.subtotal}</strong>
              </div>
              {activeInvoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', color: 'var(--success)' }}>
                  <span>Discount:</span>
                  <strong>- ₹{activeInvoice.discount}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                <span>Delivery:</span>
                <strong>{activeInvoice.subtotal > 3000 ? 'FREE' : '₹150'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '1.1rem', fontWeight: 800, borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '10px' }}>
                <span>Grand Total:</span>
                <span>₹{activeInvoice.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }} className="invoice-print-btn-row">
              <button className="btn btn-primary" onClick={handlePrint} style={{ flexGrow: 1 }}>
                <FiPrinter /> Print Invoice
              </button>
              <button className="btn btn-outline" onClick={() => setActiveInvoice(null)} style={{ flexGrow: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
