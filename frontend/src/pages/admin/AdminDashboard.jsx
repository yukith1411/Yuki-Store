import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBox, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import API from '../../services/api';
import ChartComponent from '../../components/admin/ChartComponent';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          API.get('/users'),
          API.get('/products?limit=1000'), // load all for counting
          API.get('/orders')
        ]);

        const usersList = usersRes.data.users || [];
        const productsList = productsRes.data.products || [];
        const ordersList = ordersRes.data.orders || [];

        // Calculate revenue from Delivered or Paid orders
        const revenueTotal = ordersList.reduce((acc, order) => {
          if (order.paymentStatus === 'Completed' || order.orderStatus === 'Delivered') {
            return acc + order.total;
          }
          return acc;
        }, 0);

        setStats({
          usersCount: usersList.length,
          productsCount: productsList.length,
          ordersCount: ordersList.length,
          revenue: revenueTotal
        });

        // Set recent 5 orders
        setRecentOrders(ordersList.slice(0, 5));

      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-stats-grid">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} height="120px" />)}
        </div>
        <Skeleton height="200px" style={{ marginBottom: '30px' }} />
        <Skeleton height="300px" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Overview Dashboard</h2>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Users</span>
            <div className="admin-stat-number">{stats.usersCount}</div>
          </div>
          <FiUsers className="admin-stat-icon" />
        </div>

        <div className="admin-stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Catalog Products</span>
            <div className="admin-stat-number">{stats.productsCount}</div>
          </div>
          <FiBox className="admin-stat-icon" />
        </div>

        <div className="admin-stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Orders</span>
            <div className="admin-stat-number">{stats.ordersCount}</div>
          </div>
          <FiShoppingBag className="admin-stat-icon" />
        </div>

        <div className="admin-stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Sales Earnings</span>
            <div className="admin-stat-number" style={{ color: 'var(--success)' }}>₹{stats.revenue}</div>
          </div>
          <FiTrendingUp className="admin-stat-icon" style={{ color: 'var(--success)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', margin: '40px 0' }}>
        {/* Recent Orders List */}
        <div className="admin-table-wrapper" style={{ margin: 0 }}>
          <div className="admin-table-actions">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Transactions</h3>
            <Link to="/admin/orders" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              View All Orders
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong>{ord.user?.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ord.user?.email}</span>
                    </td>
                    <td>{ord.paymentMethod} ({ord.paymentStatus})</td>
                    <td>
                      <span className={`status-badge status-${ord.orderStatus === 'Cancelled' ? 'danger' : ord.orderStatus === 'Delivered' ? 'success' : 'warning'}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td>₹{ord.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sales Chart */}
        <ChartComponent />
      </div>
    </div>
  );
};

export default AdminDashboard;
