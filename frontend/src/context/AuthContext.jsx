import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Fetch user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/profile');
          if (data.success) {
            setUser(data);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to load user profile', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (name, email, password, mobile) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password, mobile });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (name, mobile) => {
    try {
      const { data } = await API.put('/auth/profile', { name, mobile });
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data }));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.'
      };
    }
  };

  // Change Password
  const changeUserPassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await API.put('/auth/change-password', { currentPassword, newPassword });
      return { success: data.success, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed.'
      };
    }
  };

  // Add Address
  const addAddress = async (addressData) => {
    try {
      const { data } = await API.post('/auth/addresses', addressData);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add address.'
      };
    }
  };

  // Update Address
  const updateAddress = async (addressId, addressData) => {
    try {
      const { data } = await API.put(`/auth/addresses/${addressId}`, addressData);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update address.'
      };
    }
  };

  // Delete Address
  const deleteAddress = async (addressId) => {
    try {
      const { data } = await API.delete(`/auth/addresses/${addressId}`);
      if (data.success) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete address.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        changeUserPassword,
        addAddress,
        updateAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
