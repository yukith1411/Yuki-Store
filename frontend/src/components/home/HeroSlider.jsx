import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/home.css';

const DEFAULT_SLIDES = [
  {
    title: 'Fresh Groceries,\nDelivered Fast!',
    subtitle: 'Order fresh fruits, vegetables, dairy and more — delivered to your door in hours.',
    bg: 'linear-gradient(135deg,#003d1f 0%,#0e9960 100%)',
    cta: 'Shop Now',
    link: '/shop',
    badge: 'Express Delivery in 2 Hours',
    highlight: 'Fast!',
  },
  {
    title: 'Up to 40% Off\nFresh Produce',
    subtitle: 'Seasonal fruits & vegetables at unbeatable prices. Limited time weekend offer.',
    bg: 'linear-gradient(135deg,#1a0a00 0%,#b45309 100%)',
    cta: 'Shop Offers',
    link: '/shop?featured=true',
    badge: '🔥 Weekend Sale',
    highlight: '40% Off',
  },
  {
    title: 'Farm to Table,\nEvery Day',
    subtitle: '100% certified organic produce sourced directly from 200+ local farms near you.',
    bg: 'linear-gradient(135deg,#062018 0%,#065f46 100%)',
    cta: 'Explore Organic',
    link: '/shop?category=fruits-vegetables',
    badge: '🌿 Certified Organic',
    highlight: 'Every Day',
  },
];

const HeroSlider = ({ banners = [] }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const slides = banners.length > 0
    ? banners.map(b => ({ title: b.title, subtitle: b.subtitle, bg: b.image ? `url(${b.image})` : DEFAULT_SLIDES[0].bg, cta: 'Shop Now', link: b.link || '/shop', badge: 'Fresh Deals' }))
    : DEFAULT_SLIDES;

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);

  return (
    <div className="hero-slider" style={{ minHeight: '480px' }}>
      {slides.map((slide, i) => (
        <div key={i} className={`hero-slide ${i === current ? 'active' : ''}`}>
          <div className="hero-slide-bg" style={{ background: slide.bg }} />
          <div className="container" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
            <div className="hero-slide-content">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                {slide.badge}
              </div>
              <h1 className="hero-title">
                {slide.title.split('\n').map((line, li) => (
                  <span key={li}>
                    {line.includes(slide.highlight)
                      ? line.split(slide.highlight).flatMap((part, pi, arr) =>
                          pi < arr.length - 1
                            ? [part, <em key={pi}>{slide.highlight}</em>]
                            : [part]
                        )
                      : line}
                    {li < slide.title.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="hero-sub">{slide.subtitle}</p>
              <div className="hero-cta">
                <button className="btn btn-secondary btn-lg" onClick={() => navigate(slide.link)}>
                  {slide.cta} →
                </button>
                <button className="hero-cta-outline" onClick={() => navigate('/shop')}>
                  Browse All
                </button>
              </div>
              <div className="hero-stats">
                <div><div className="hero-stat-num">12k+</div><div className="hero-stat-label">Happy Customers</div></div>
                <div><div className="hero-stat-num">5,000+</div><div className="hero-stat-label">Products</div></div>
                <div><div className="hero-stat-num">2 hrs</div><div className="hero-stat-label">Express Delivery</div></div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      {slides.length > 1 && <>
        <button className="slider-arrow slider-arrow-left" onClick={prev}>‹</button>
        <button className="slider-arrow slider-arrow-right" onClick={next}>›</button>
        <div className="slider-dots">
          {slides.map((_, i) => (
            <div key={i} className={`slider-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
      </>}
    </div>
  );
};

export default HeroSlider;
