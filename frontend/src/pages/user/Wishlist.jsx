import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiInbox } from 'react-icons/fi';
import { WishlistContext } from '../../context/WishlistContext';
import ProductCard from '../../components/common/ProductCard';
import Skeleton from '../../components/common/Skeleton';
import '../../css/home.css'; // Uses grid styles from home catalog

const Wishlist = () => {
  const { wishlist, loading } = useContext(WishlistContext);

  if (loading && wishlist.length === 0) {
    return (
      <div className="container section">
        <Skeleton height="50px" style={{ marginBottom: '30px' }} />
        <div className="products-grid">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} height="400px" borderRadius="8px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>My Wishlist</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your saved items from across all departments.</p>

      {wishlist.length === 0 ? (
        <div className="empty-state" style={{ border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '60px 24px' }}>
          <FiInbox className="empty-state-icon" />
          <h2>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Browse through our catalog to add items you love to your wishlist.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
