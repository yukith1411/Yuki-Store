import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiPercent } from 'react-icons/fi';
import { CartContext } from '../../context/CartContext';
import Skeleton from '../../components/common/Skeleton';
import '../../css/cart.css';

const Cart = () => {
  const {
    cart,
    loading,
    coupon,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getTotal
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleQtyChange = (productId, newQty, size, color, stock) => {
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    if (newQty > stock) {
      toast.warn(`Only ${stock} items left in stock.`);
      return;
    }
    updateCartItem(productId, newQty, size, color);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;

    setApplying(true);
    const res = await applyCoupon(couponCode);
    setApplying(false);

    if (res.success) {
      toast.success(res.message);
      setCouponCode('');
    } else {
      toast.error(res.message);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = subtotal > 3000 || subtotal === 0 ? 0 : 150;
  const grandTotal = getTotal() + deliveryFee;

  if (loading && cart.length === 0) {
    return (
      <div className="container section">
        <Skeleton height="50px" style={{ marginBottom: '30px' }} />
        <div className="cart-grid">
          <Skeleton height="350px" />
          <Skeleton height="250px" />
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Shopping Cart</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Review your selections before checking out.</p>

      {cart.length === 0 ? (
        <div className="empty-state" style={{ border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '60px 24px' }}>
          <FiShoppingBag className="empty-state-icon" />
          <h2>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-list">
            {cart.map((item, index) => {
              const { product, quantity, size, color } = item;
              const hasDiscount = product.discountPrice > 0;
              const price = hasDiscount ? product.discountPrice : product.price;

              return (
                <div key={index} className="cart-item-card">
                  <img src={product.images && product.images[0]} alt={product.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="cart-item-name">{product.name}</h3>
                    </Link>

                    {/* Attributes */}
                    <div className="cart-item-attrs">
                      {size && <span className="cart-item-attr">Size: <strong>{size}</strong></span>}
                      {color && <span className="cart-item-attr">Color: <strong>{color}</strong></span>}
                    </div>

                    {/* Pricing */}
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">₹{price}</span>
                      {hasDiscount && (
                        <span className="cart-item-old-price">₹{product.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="qty-counter" style={{ margin: '0 20px' }}>
                    <button
                      className="qty-btn"
                      style={{ width: '32px', height: '32px', fontSize: '1rem' }}
                      onClick={() => handleQtyChange(product._id, quantity - 1, size, color, product.stock)}
                    >
                      -
                    </button>
                    <span className="qty-val" style={{ width: '32px' }}>{quantity}</span>
                    <button
                      className="qty-btn"
                      style={{ width: '32px', height: '32px', fontSize: '1rem' }}
                      onClick={() => handleQtyChange(product._id, quantity + 1, size, color, product.stock)}
                    >
                      +
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    className="nav-action-btn"
                    style={{ color: 'var(--danger)', fontSize: '1.2rem' }}
                    onClick={() => removeFromCart(product._id, size, color)}
                    aria-label="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pricing summary panel */}
          <div className="cart-summary-box">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>

            {discount > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount</span>
                <strong>- ₹{discount}</strong>
              </div>
            )}

            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <strong>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</strong>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>

            {/* Apply coupon */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
              <h3 className="selector-label" style={{ fontSize: '0.85rem' }}>Apply Promo Coupon</h3>
              {coupon ? (
                <div className="applied-coupon-tag">
                  <span>
                    <FiPercent style={{ marginRight: '6px' }} />
                    Applied: <strong>{coupon.code}</strong>
                  </span>
                  <button className="remove-coupon-btn" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form className="cart-coupon-row" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    className="form-input"
                    style={{ padding: '8px 12px', borderRadius: '4px', textTransform: 'uppercase' }}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem' }}
                    disabled={applying}
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
