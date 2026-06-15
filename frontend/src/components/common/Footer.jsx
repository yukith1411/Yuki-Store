import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../css/footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed! Fresh deals coming your way 🌿');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo">🛒 YUKI_STORE</div>
            <p className="footer-tagline">Fresh groceries from local farms to your table. Quality you can taste, speed you can count on.</p>
            <div className="footer-social">
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="Facebook">💬</a>
              <a href="#" title="Twitter">🐦</a>
              <a href="#" title="YouTube">▶️</a>
            </div>
            <div className="footer-newsletter">
              <p>Get fresh deals in your inbox</p>
              <form className="footer-nl-form" onSubmit={handleSubscribe}>
                <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/shop?featured=true">Deals & Offers</Link></li>
              <li><Link to="/shop?newArrival=true">New Arrivals</Link></li>
              <li><Link to="/shop?trending=true">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><a href="#">Return Policy</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} YUKI_STORE. All rights reserved. Made with 💚</p>
          <div className="footer-payments">
            <span>UPI</span><span>Visa</span><span>Mastercard</span><span>RuPay</span><span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
