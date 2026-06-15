import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiLayout, FiGrid, FiAward, FiBox, FiUsers, FiShoppingBag, FiPercent, FiImage, FiMessageSquare, FiSettings } from 'react-icons/fi';
import '../../css/admin.css';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Dashboard',   path: '/admin/dashboard',  icon: <FiLayout /> },
    { name: 'Departments', path: '/admin/categories', icon: <FiGrid /> },
    { name: 'Brands',      path: '/admin/brands',     icon: <FiAward /> },
    { name: 'Products',    path: '/admin/products',   icon: <FiBox /> },
    { name: 'Orders',      path: '/admin/orders',     icon: <FiShoppingBag /> },
    { name: 'Customers',   path: '/admin/users',      icon: <FiUsers /> },
    { name: 'Coupons',     path: '/admin/coupons',    icon: <FiPercent /> },
    { name: 'Banners',     path: '/admin/banners',    icon: <FiImage /> },
    { name: 'Reviews',     path: '/admin/reviews',    icon: <FiMessageSquare /> },
    { name: 'Settings',    path: '/admin/settings',   icon: <FiSettings /> },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Header — both texts white */}
      <div className="admin-sidebar-header">
        <div>
          <div className="admin-sidebar-brand">GRAND BAZAAR</div>
          <div className="admin-sidebar-badge">Admin Portal</div>
        </div>
      </div>

      <nav className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
