import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OfferBanner = ({ banner }) => {
  const navigate = useNavigate();
  const [secs, setSecs] = useState(8 * 3600 + 42 * 60 + 17);

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, '0');
  const h = pad(Math.floor(secs / 3600));
  const m = pad(Math.floor((secs % 3600) / 60));
  const s = pad(secs % 60);

  return (
    <section className="offer-banner-section">
      <div className="container">
        <div className="offer-banner">
          <div>
            <div className="offer-eyebrow">🔥 Limited Time Offer</div>
            <h2 className="offer-title">
              {banner?.title || <><span>Mega Sale</span> on Fresh<br />Fruits & Veggies!</>}
            </h2>
            <p className="offer-sub">{banner?.subtitle || 'Get up to 40% off on all fresh produce this weekend. Don\'t miss out!'}</p>
            <div className="offer-timer">
              <div className="timer-block"><div className="timer-num">{h}</div><div className="timer-label">Hours</div></div>
              <div className="timer-block"><div className="timer-num">{m}</div><div className="timer-label">Mins</div></div>
              <div className="timer-block"><div className="timer-num">{s}</div><div className="timer-label">Secs</div></div>
            </div>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate(banner?.link || '/shop')}>
              Shop the Sale →
            </button>
          </div>
          <div className="offer-right">
            <div className="offer-emoji">{banner?.emoji || '🍉'}</div>
            <div className="offer-tag">Up to 40% OFF</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferBanner;
