import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);

  // Fetch cart from database if authenticated
  const fetchCart = async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const { data } = await API.get('/cart');
        if (data.success) {
          setCart(data.cart);
        }
      } catch (error) {
        console.error('Error fetching cart', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
    setCoupon(null); // Reset coupon when auth state changes
  }, [isAuthenticated]);

  // Add to cart
  const addToCart = async (productId, quantity, size, color) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to cart.' };
    }
    setLoading(true);
    try {
      const { data } = await API.post('/cart', { productId, quantity, size, color });
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity, size, color) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.put('/cart', { productId, quantity, size, color });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Failed to update cart item', error);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId, size, color) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.post('/cart/remove', { productId, size, color });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Failed to remove item from cart', error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.delete('/cart');
      if (data.success) {
        setCart([]);
        setCoupon(null);
      }
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

  // Apply Coupon
  const applyCoupon = async (code) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to apply coupon.' };
    }
    try {
      const sub = getSubtotal();
      const { data } = await API.post('/coupons/validate', { code, subtotal: sub });
      if (data.success) {
        setCoupon(data.coupon);
        return { success: true, message: data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply coupon.'
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculate pricing numbers
  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const itemPrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + itemPrice * item.quantity;
    }, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    return coupon.discountVal;
  };

  const getTotal = () => {
    const sub = getSubtotal();
    const disc = getDiscount();
    return Math.max(0, sub - disc);
  };

  const getCartCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        coupon,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getDiscount,
        getTotal,
        getCartCount,
        cartCount: cart.reduce((acc, item) => acc + item.quantity, 0),
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
