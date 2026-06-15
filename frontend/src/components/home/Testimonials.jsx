import React from 'react';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Regular Customer, Chennai', rating: 5, text: 'The freshness of every product I\'ve ordered is incredible. Broccoli arrived crisp, strawberries were perfect. YUKI_STORE is now my go-to grocery app!' },
  { name: 'Rahul Mehta', role: 'Verified Buyer, Madurai', rating: 5, text: 'Delivery in under 90 minutes! The packaging is eco-friendly and everything was neatly sorted. Excellent service all around.' },
  { name: 'Anita Krishnan', role: 'Nutritionist, Coimbatore', rating: 5, text: 'As a nutritionist, I recommend YUKI_STORE to all my clients. The organic range is genuinely certified and reasonably priced.' },
];

const Stars = ({ n }) => (
  <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </div>
);

const Testimonials = () => (
  <section className="section" style={{ background: 'var(--bg-secondary)' }}>
    <div className="container">
      <span className="section-eyebrow">Customer Love</span>
      <h2 className="section-title">What Our <span>Customers Say</span></h2>
      <p className="section-subtitle">Over 12,000 happy families trust YUKI_STORE for their daily groceries.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '24px' }}>
        {TESTIMONIALS.map((t) => (
          <div key={t.name} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '28px', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <Stars n={t.rating} />
            <p style={{ fontSize: '.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '14px 0 20px', fontStyle: 'italic' }}>"{t.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#34d399)', color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{t.name}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--text-secondary)' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
