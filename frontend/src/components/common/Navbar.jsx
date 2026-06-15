import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import '../../css/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { wishlistCount } = useContext(WishlistContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserDropdown(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); }
  };

  const categories = [
    { label: '🍎 Fruits & Veg', slug: 'fruits-vegetables' },
    { label: '🥛 Dairy & Eggs', slug: 'dairy-eggs' },
    { label: '🍞 Bakery', slug: 'bakery-bread' },
    { label: '☕ Beverages', slug: 'beverages' },
    { label: '🍿 Snacks', slug: 'snacks' },
    { label: '🍗 Meat & Fish', slug: 'meat-seafood' },
    { label: '🌾 Staples', slug: 'staples-grains' },
    { label: '🧊 Frozen', slug: 'frozen-foods' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-top">
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">YUKI<span className="logo-accent">_STORE</span></span>
          </Link>

          {/* Search Bar */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for fruits, vegetables, dairy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">🔍</button>
          </form>

          {/* Right Actions: Wishlist → Cart → Login/User */}
          <div className="navbar-actions">
            <Link to="/wishlist" className="navbar-icon-btn" title="Wishlist" style={{ position: 'relative' }}>
              <span>❤️</span>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="navbar-icon-btn navbar-cart-btn" style={{ position: 'relative' }}>
              <span>🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button className="navbar-icon-btn" onClick={() => setUserDropdown(!userDropdown)}>
                  <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                  <span className="user-name-text">{user.name?.split(' ')[0]}</span>
                </button>
                {userDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span>{user.name}</span>
                      <small>{user.email}</small>
                    </div>
                    <Link to="/profile" className="dropdown-item">👤 My Profile</Link>
                    <Link to="/orders" className="dropdown-item">📦 My Orders</Link>
                    <Link to="/wishlist" className="dropdown-item">❤️ Wishlist</Link>
                    {user.role === 'admin' && <Link to="/admin/dashboard" className="dropdown-item">⚙️ Admin Panel</Link>}
                    <button onClick={() => { logout(); navigate('/'); }} className="dropdown-item dropdown-logout">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary navbar-login-btn">Login</Link>
            )}

            <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Nav Bar */}
      <div className="navbar-categories">
        <div className="container">
          <nav className="category-nav">
            <Link to="/shop" className="cat-nav-link cat-nav-all">All Products</Link>
            {categories.map(cat => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="cat-nav-link">{cat.label}</Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
          <div className="mobile-links">
            {categories.map(cat => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="mobile-link">{cat.label}</Link>
            ))}
            <Link to="/cart" className="mobile-link">🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>
            <Link to="/wishlist" className="mobile-link">❤️ Wishlist</Link>
            {user ? (
              <>
                <Link to="/profile" className="mobile-link">👤 Profile</Link>
                <Link to="/orders" className="mobile-link">📦 Orders</Link>
                {user.role === 'admin' && <Link to="/admin/dashboard" className="mobile-link">⚙️ Admin</Link>}
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} className="mobile-link mobile-logout">🚪 Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link">Login</Link>
                <Link to="/register" className="mobile-link">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
