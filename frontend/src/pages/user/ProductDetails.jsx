import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiHeart, FiCheck, FiChevronRight } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import API from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { AuthContext } from '../../context/AuthContext';
import ZoomImage from '../../components/common/ZoomImage';
import Rating from '../../components/common/Rating';
import Skeleton from '../../components/common/Skeleton';
import '../../css/productDetails.css';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Purchase Choices
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [displayPrice, setDisplayPrice] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const { data } = await API.get(`/products/${slug}`);
      if (data.success) {
        setProduct(data.product);
        setReviews(data.product.reviews || []);
        
        // Auto-select first size and color if available
        if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
        if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);

        // Set initial display price
        const basePrice = data.product.discountPrice > 0 ? data.product.discountPrice : data.product.price;
        setDisplayPrice(basePrice);
      }
    } catch (err) {
      console.error('Error loading product details', err);
      toast.error('Product not found.');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProductDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="container section">
        <div className="details-grid">
          <Skeleton height="500px" borderRadius="8px" />
          <div>
            <Skeleton height="40px" width="80%" style={{ marginBottom: '20px' }} />
            <Skeleton height="25px" width="30%" style={{ marginBottom: '10px' }} />
            <Skeleton height="35px" width="40%" style={{ marginBottom: '20px' }} />
            <Skeleton height="150px" style={{ marginBottom: '20px' }} />
            <Skeleton height="50px" width="50%" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.discountPrice > 0;
  const basePrice = hasDiscount ? product.discountPrice : product.price;
  const baseOriginalPrice = product.price;
  const isFavorite = isInWishlist(product._id);

  // Size → price multiplier — handles any format: "500g","1kg","1 Kg","1KG","500 ml" etc.
  const getSizeMultiplier = (size) => {
    if (!size) return 1;
    const s = size.toLowerCase().replace(/\s+/g, '');
    const match = s.match(/^([\d.]+)(kg|g|l|ml|ltr|litre|liter)?$/);
    if (!match) return 1; // S/M/L/XL — no price change
    const num = parseFloat(match[1]);
    const unit = match[2] || 'g';
    let inGrams;
    if (unit === 'kg' || unit === 'l' || unit === 'ltr' || unit === 'litre' || unit === 'liter') {
      inGrams = num * 1000;
    } else {
      inGrams = num;
    }
    const BASE_GRAMS = 500; // product's base price is for 500g
    return Math.round((inGrams / BASE_GRAMS) * 100) / 100;
  };

  // Called when user clicks a size button
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const multiplier = getSizeMultiplier(size);
    const newPrice = Math.round(basePrice * multiplier);
    console.log('[YUKI] size:', size, '| multiplier:', multiplier, '| basePrice:', basePrice, '| newPrice:', newPrice);
    setDisplayPrice(newPrice);
  };

  // Final price to show (use displayPrice if set, else basePrice)
  const currentPrice = displayPrice ?? basePrice;
  const currentOriginalPrice = Math.round(baseOriginalPrice * (getSizeMultiplier(selectedSize) || 1));

  // Add to Cart
  const handleAddToCart = async (showToast = true) => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.warn('Please select a size');
      return false;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.warn('Please select a color');
      return false;
    }

    const res = await addToCart(product._id, quantity, selectedSize, selectedColor);
    if (res.success) {
      if (showToast) toast.success('Added to Shopping Cart!');
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    const added = await handleAddToCart(false);
    if (added) {
      navigate('/cart');
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      toast.warn('Please enter a feedback comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await API.post('/reviews', {
        productId: product._id,
        rating,
        comment
      });

      if (data.success) {
        toast.success('Review published successfully!');
        setComment('');
        setRating(5);
        // Reload details to get recalculated rating count/average
        fetchProductDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        <span>Home</span> <FiChevronRight />
        <span>Shop</span> <FiChevronRight />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="details-grid">
        {/* Images Left Pane */}
        <div className="images-container">
          <div className="main-image-wrapper">
            <ZoomImage
              src={product.images[activeImage]}
              alt={product.name}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="thumbnails-row">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail-box ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`thumbnail-${idx}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Right Pane */}
        <div className="info-container">
          <span className="info-brand">{product.brand?.name}</span>
          <h1 className="info-title">{product.name}</h1>

          <div className="info-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Rating value={product.ratings?.average || 0} />
              <strong style={{ fontSize: '0.95rem' }}>{product.ratings?.average || 0}</strong>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>
              ({reviews.length} reviews)
            </span>
            <div className={`info-stock ${product.stock > 0 ? 'in' : 'out'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </div>
          </div>

          <div className="info-price-row">
            {hasDiscount ? (
              <>
                <span className="info-price">₹{currentPrice}</span>
                <span className="info-old-price">₹{currentOriginalPrice}</span>
                <span className="info-discount">
                  ({Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF)
                </span>
              </>
            ) : (
              <span className="info-price">₹{currentPrice}</span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            {product.description}
          </p>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h3 className="selector-label">Select Size</h3>
              <div className="size-filter-grid">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    className={`size-filter-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h3 className="selector-label">Select Color</h3>
              <div className="color-filter-grid">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    className={`size-filter-btn ${selectedColor === col ? 'active' : ''}`}
                    style={{ minWidth: '60px' }}
                    onClick={() => setSelectedColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginTop: '10px' }}>
            <h3 className="selector-label">Quantity</h3>
            <div className="qty-counter">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="qty-val">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="actions-row">
            <button
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '16px 28px' }}
              onClick={() => handleAddToCart(true)}
              disabled={product.stock <= 0}
            >
              <FiShoppingCart /> Add to Cart
            </button>

            <button
              className="btn btn-secondary"
              style={{ flexGrow: 1, padding: '16px 28px' }}
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>

            <button
              className={`wishlist-circle-btn ${isFavorite ? 'active' : ''}`}
              onClick={async () => {
                const res = await toggleWishlist(product._id);
                if (res.action === 'added') toast.success('Added to Wishlist!');
                else if (res.action === 'removed') toast.info('Removed from Wishlist');
              }}
              aria-label="Toggle Favorite"
            >
              {isFavorite ? <FaHeart /> : <FiHeart />}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title" style={{ textAlign: 'left', fontSize: '1.75rem' }}>Customer Feedback</h2>
        <div className="reviews-grid">
          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div style={{ padding: '40px 24px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No reviews yet for this product. Be the first one to review!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="review-bubble">
                  <div className="review-bubble-header">
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                        {rev.name || rev.user?.name}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <Rating value={rev.rating} />
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Block */}
          <div className="review-form-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <span className="form-label">Rating</span>
                  <div className="review-stars-select">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <span
                        key={starIdx}
                        className="review-star-btn"
                        onClick={() => setRating(starIdx)}
                        onMouseEnter={() => setHoverRating(starIdx)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {(hoverRating || rating) >= starIdx ? (
                          <FaStar />
                        ) : (
                          <FaStar style={{ color: 'var(--border-color)' }} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  You must be logged in to leave a review feedback.
                </p>
                <button
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
