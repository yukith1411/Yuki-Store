import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import '../css/admin.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar on the left */}
      <AdminSidebar />

      {/* Main content pane on the right */}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Grand Bazaar — Management Suite</h1>
          <div className="admin-topbar-user">
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              Logged in: <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
            </span>
            <Link to="/" className="nav-action-btn" title="View Storefront">
              <FiHome />
            </Link>
            <button className="nav-action-btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
