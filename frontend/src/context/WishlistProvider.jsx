import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { WishlistContext } from './WishlistContext';
import API from '../services/api';

const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const { data } = await API.get('/wishlist');
        if (data.success) setWishlist(data.wishlist);
      } catch (error) {
        console.error('Error fetching wishlist', error);
      } finally {
        setLoading(false);
      }
    } else {
      setWishlist([]);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return { success: false, message: 'Please login to add to wishlist.' };
    try {
      const { data } = await API.post('/wishlist', { productId });
      if (data.success) { setWishlist(data.wishlist); return { success: true }; }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add to wishlist.' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.delete(`/wishlist/${productId}`);
      if (data.success) setWishlist(data.wishlist);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const toggleWishlist = async (productId) => {
    const isFav = wishlist.some(item => item._id === productId);
    if (isFav) {
      await removeFromWishlist(productId);
      return { action: 'removed' };
    } else {
      const res = await addToWishlist(productId);
      if (res?.success) return { action: 'added' };
      return res;
    }
  };

  const isInWishlist = (productId) => wishlist.some((item) => item._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
