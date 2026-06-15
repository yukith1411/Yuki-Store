import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import WishlistProvider from './context/WishlistProvider';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common route guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// User Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetails from './pages/user/ProductDetails';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Wishlist from './pages/user/Wishlist';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import NotFound from './pages/user/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManage from './pages/admin/CategoryManage';
import BrandManage from './pages/admin/BrandManage';
import ProductManage from './pages/admin/ProductManage';
import OrderManage from './pages/admin/OrderManage';
import UserManage from './pages/admin/UserManage';
import CouponManage from './pages/admin/CouponManage';
import BannerManage from './pages/admin/BannerManage';
import ReviewsManage from './pages/admin/ReviewsManage';
import AdminSettings from './pages/admin/AdminSettings';

import './css/global.css';

// Let's import CartProvider from its file context/CartContext
import { CartProvider as CustomCartProvider } from './context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCartProvider>
          <WishlistProvider>
            
            <Routes>
              {/* User storefront routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected member routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Portal (Layout + secure guards) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="categories" element={<CategoryManage />} />
                <Route path="brands" element={<BrandManage />} />
                <Route path="products" element={<ProductManage />} />
                <Route path="orders" element={<OrderManage />} />
                <Route path="users" element={<UserManage />} />
                <Route path="coupons" element={<CouponManage />} />
                <Route path="banners" element={<BannerManage />} />
                <Route path="reviews" element={<ReviewsManage />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>

            <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

          </WishlistProvider>
        </CustomCartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
