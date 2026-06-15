import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import Rating from './Rating';
import '../../css/productCard.css';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

  if (!product) return null;

  const hasDiscount = product.discountPrice > 0;
  const price = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const isFav = isInWishlist(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please login to use wishlist'); return; }
    const res = await toggleWishlist(product._id);
    if (res?.action === 'added') toast.success('Added to wishlist ❤️');
    else if (res?.action === 'removed') toast.info('Removed from wishlist');
    else if (res?.message) toast.error(res.message);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please login to add to cart'); return; }
    if (product.stock <= 0) { toast.error('Out of stock'); return; }
    const res = await addToCart(product._id, 1, product.sizes?.[0] || '', product.colors?.[0] || '');
    if (res?.success) toast.success('Added to cart 🛒');
    else toast.error(res?.message || 'Failed to add');
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div className="product-card-image-wrapper">
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
          {/* Badges */}
          <div className="product-badge-group">
            {discountPct > 0 && <span className="product-badge product-badge-discount">−{discountPct}%</span>}
            {product.featured && <span className="product-badge product-badge-featured">Staff Pick</span>}
            {product.trending && <span className="product-badge product-badge-trending">🔥 Hot</span>}
            {product.newArrival && <span className="product-badge product-badge-new">New</span>}
          </div>
          {/* Wishlist */}
          <button
            className={`product-wishlist-btn ${isFav ? 'active' : ''}`}
            onClick={handleWishlist}
            title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isFav ? '♥' : '♡'}
          </button>
        </div>
      </Link>

      <div className="product-card-content">
        {product.brand && <div className="product-card-brand">{product.brand?.name || product.brand}</div>}
        <Link to={`/product/${product.slug}`}>
          <div className="product-card-title">{product.name}</div>
        </Link>
        <div className="product-card-rating">
          <Rating value={product.rating || 0} size="sm" />
          <span>({product.numReviews || 0})</span>
        </div>
        <div className="product-card-price-row">
          <span className="product-card-price">₹{price}</span>
          {hasDiscount && <span className="product-card-old-price">₹{product.price}</span>}
          {discountPct > 0 && <span className="product-card-discount-pct">{discountPct}% off</span>}
        </div>
      </div>

      <div className="product-card-footer">
        {product.stock > 0 ? (
          <button className="btn-add-cart" onClick={handleAddToCart}>+ Add to Cart</button>
        ) : (
          <button className="btn-add-cart" disabled>Out of Stock</button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
