import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import HeroSlider from '../../components/home/HeroSlider';
import OfferBanner from '../../components/home/OfferBanner';
import Testimonials from '../../components/home/Testimonials';
import ProductCard from '../../components/common/ProductCard';
import Skeleton from '../../components/common/Skeleton';
import '../../css/home.css';

const CategoryCard = ({ icon, title, description, onClick }) => (
  <div className="dept-card" onClick={onClick}>
    <div className="dept-card-icon">{icon}</div>
    <h3 className="dept-card-title">{title}</h3>
    <p className="dept-card-desc">{description}</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [bannersRes, categoriesRes, brandsRes, featuredRes, newArrivalRes, trendingRes] = await Promise.all([
          API.get('/banners'),
          API.get('/categories'),
          API.get('/brands'),
          API.get('/products?featured=true&limit=4'),
          API.get('/products?newArrival=true&limit=4'),
          API.get('/products?trending=true&limit=4')
        ]);
        if (bannersRes.data.success) setBanners(bannersRes.data.banners);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories.filter(c => c.active));
        if (brandsRes.data.success) setBrands(brandsRes.data.brands.filter(b => b.active));
        if (featuredRes.data.success) setFeaturedProducts(featuredRes.data.products);
        if (newArrivalRes.data.success) setNewArrivalProducts(newArrivalRes.data.products);
        if (trendingRes.data.success) setTrendingProducts(trendingRes.data.products);
      } catch (error) {
        console.error('Failed to load home page content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const heroBanners = banners.filter(b => b.type === 'hero');
  const offerBanners = banners.filter(b => b.type === 'offer');

  const groceryCategories = [
    { icon: '🍎', title: 'Fruits & Veg', description: 'Farm fresh daily produce', slug: 'fruits-vegetables' },
    { icon: '🥛', title: 'Dairy & Eggs', description: 'Milk, butter, cheese & eggs', slug: 'dairy-eggs' },
    { icon: '🍞', title: 'Bakery', description: 'Fresh bread, cakes & pastries', slug: 'bakery-bread' },
    { icon: '☕', title: 'Beverages', description: 'Tea, coffee, juices & drinks', slug: 'beverages' },
    { icon: '🍿', title: 'Snacks', description: 'Chips, biscuits & munchies', slug: 'snacks' },
    { icon: '🍗', title: 'Meat & Fish', description: 'Fresh chicken, fish & mutton', slug: 'meat-seafood' },
    { icon: '🌾', title: 'Staples', description: 'Rice, dal, oil & spices', slug: 'staples-grains' },
    { icon: '🧊', title: 'Frozen', description: 'Frozen meals & ice creams', slug: 'frozen-foods' },
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Hero */}
      {loading ? <Skeleton height="520px" borderRadius="0px" /> : <HeroSlider banners={heroBanners} />}

      {/* Delivery Promise Strip */}
      <div className="promise-strip">
        <div className="container">
          <div className="promise-items">
            {[
              { icon: '⚡', text: 'Express Delivery in 2 Hours' },
              { icon: '🌿', text: '100% Fresh & Organic Options' },
              { icon: '↩️', text: 'Easy Returns within 24 Hours' },
              { icon: '🔒', text: 'Secure & Safe Payments' },
            ].map(item => (
              <div key={item.text} className="promise-item">
                <span className="promise-icon">{item.icon}</span>
                <span className="promise-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Everything fresh, right at your fingertips</p>
          <div className="dept-grid">
            {groceryCategories.map(cat => (
              <CategoryCard key={cat.slug} icon={cat.icon} title={cat.title} description={cat.description} onClick={() => navigate(`/shop?category=${cat.slug}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section style={{ background: 'var(--bg-secondary)', padding: '40px 0' }}>
        <div className="container">
          <h3 style={{ textAlign: 'center', fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Trusted Brands We Carry
          </h3>
          <div className="brands-grid">
            {loading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} width="100px" height="36px" />) :
              brands.map(brand => (
                <div key={brand._id} className="brand-chip" onClick={() => navigate(`/shop?brand=${brand.slug}`)}>
                  {brand.name}
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Featured Categories</h2>
          <p className="section-subtitle">Top picks curated for you this season</p>
          <div className="categories-grid">
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height="260px" />) :
              categories.slice(0, 4).map(cat => (
                <div key={cat._id} className="category-card" onClick={() => navigate(`/shop?category=${cat.slug}`)}>
                  <img src={cat.image} alt={cat.name} className="category-card-img" />
                  <div className="category-card-overlay">
                    <span className="category-card-name">{cat.name}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">🔥 Best Sellers</h2>
          <p className="section-subtitle">Most loved products by our customers</p>
          <div className="products-grid">
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height="360px" />) :
              trendingProducts.map(prod => <ProductCard key={prod._id} product={prod} />)
            }
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      {!loading && offerBanners.length > 0 && <OfferBanner banner={offerBanners[0]} />}

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🌱 New Arrivals</h2>
          <p className="section-subtitle">Fresh additions just landed in our store</p>
          <div className="products-grid">
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height="360px" />) :
              newArrivalProducts.map(prod => <ProductCard key={prod._id} product={prod} />)
            }
          </div>
        </div>
      </section>

      {/* Staff Picks */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">⭐ Staff Picks</h2>
          <p className="section-subtitle">Handpicked by our team for quality and freshness</p>
          <div className="products-grid">
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height="360px" />) :
              featuredProducts.map(prod => <ProductCard key={prod._id} product={prod} />)
            }
          </div>
        </div>
      </section>

      {/* Why YUKI */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why YUKI_STORE?</h2>
          <div className="why-grid">
            {[
              { icon: '🚚', title: 'Free Delivery', desc: 'Free delivery on orders above ₹299' },
              { icon: '🌿', title: 'Always Fresh', desc: 'Sourced daily from certified farms' },
              { icon: '🔒', title: 'Secure Payments', desc: '100% safe & encrypted checkout' },
              { icon: '🎧', title: '24/7 Support', desc: 'We\'re always here to help you' },
            ].map(item => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
    </div>
  );
};

export default Home;
