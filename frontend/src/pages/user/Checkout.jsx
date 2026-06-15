import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import API from '../../services/api';
import '../../css/checkout.css';

const Checkout = () => {
  const { user, addAddress } = useContext(AuthContext);
  const { cart, getSubtotal, getDiscount, getTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Address selection
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.info('Your cart is empty. Please add items first.');
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { street, city, state, zipCode } = newAddress;
    if (!street || !city || !state || !zipCode) {
      toast.warn('Please fill in all address details');
      return;
    }

    const res = await addAddress(newAddress);
    if (res.success) {
      toast.success('Address saved successfully!');
      setShowAddAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India' });
      // Select the newly added address (last in the list)
      if (user?.addresses) {
        setSelectedAddressIndex(user.addresses.length);
      }
    } else {
      toast.error(res.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.addresses || user.addresses.length === 0) {
      toast.warn('Please add a shipping address to proceed.');
      return;
    }

    const activeAddress = user.addresses[selectedAddressIndex];
    if (!activeAddress) {
      toast.warn('Please select a shipping address.');
      return;
    }

    setPlacingOrder(true);

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const deliveryFee = subtotal > 3000 ? 0 : 150;
    const total = getTotal() + deliveryFee;

    // Map cart items to order products
    const orderProducts = cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price
    }));

    const orderData = {
      products: orderProducts,
      address: {
        street: activeAddress.street,
        city: activeAddress.city,
        state: activeAddress.state,
        zipCode: activeAddress.zipCode,
        country: activeAddress.country
      },
      paymentMethod,
      subtotal,
      discount,
      total
    };

    // If Razorpay, trigger Mock checkout process
    if (paymentMethod === 'Razorpay') {
      const mockPayApproved = window.confirm(
        `[RAZORPAY INTEGRATION READY]\n\nDo you want to authorize the online payment of ₹${total} via Credit/Debit card or UPI?`
      );

      if (!mockPayApproved) {
        toast.info('Payment authorization cancelled.');
        setPlacingOrder(false);
        return;
      }

      // Populate mock payment details
      orderData.razorpayOrderId = 'order_mock_' + Math.random().toString(36).slice(-8);
      orderData.razorpayPaymentId = 'pay_mock_' + Math.random().toString(36).slice(-8);
      orderData.razorpaySignature = 'sig_mock_' + Math.random().toString(36).slice(-12);
    }

    try {
      const { data } = await API.post('/orders', orderData);
      if (data.success) {
        toast.success('🎉 Order Placed Successfully!');
        // Clear local cart
        await clearCart();
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryFee = subtotal > 3000 ? 0 : 150;
  const grandTotal = getTotal() + deliveryFee;

  return (
    <div className="container section">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Checkout</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Verify your details and complete purchase.</p>

      <div className="checkout-grid">
        {/* Left Column: Delivery & Payment */}
        <div>
          {/* Shipping Address */}
          <div className="checkout-section-box">
            <h2 className="checkout-box-title">
              <FiMapPin /> 1. Shipping Address
            </h2>

            {/* Address cards list */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="checkout-address-grid">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id}
                    className={`checkout-address-card ${selectedAddressIndex === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressIndex(idx)}
                  >
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>Address Option #{idx + 1}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    {selectedAddressIndex === idx && <FiCheckCircle className="address-check-icon" />}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
                No saved shipping addresses found. Please add an address below.
              </div>
            )}

            {/* Toggle Address Form */}
            {!showAddAddressForm ? (
              <button
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setShowAddAddressForm(true)}
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>New Address Details</h3>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Flat/House No., Street name"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-input"
                      disabled
                      value={newAddress.country}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => setShowAddAddressForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="checkout-section-box">
            <h2 className="checkout-box-title">
              <FiCreditCard /> 2. Payment Option
            </h2>
            <div className="payment-methods-list">
              <div
                className={`payment-method-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <input
                  type="radio"
                  className="payment-radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <span>Cash On Delivery (COD)</span>
              </div>

              <div
                className={`payment-method-card ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <input
                  type="radio"
                  className="payment-radio"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                />
                <span>Online Payment (Razorpay Integration Ready)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order items breakdown & totals */}
        <div>
          <div className="cart-summary-box">
            <h2 className="cart-summary-title">Order Items</h2>

            <div className="checkout-items-list">
              {cart.map((item, idx) => (
                <div key={idx} className="checkout-item-row">
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.product.name}
                    <span className="checkout-item-qty">x{item.quantity}</span>
                  </span>
                  <strong>
                    ₹{item.quantity * (item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="cart-summary-row" style={{ marginTop: '16px' }}>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>

            {discount > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                <span>Discount</span>
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

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '24px' }}
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
