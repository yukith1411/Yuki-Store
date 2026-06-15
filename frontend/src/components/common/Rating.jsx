import React from 'react';

const Rating = ({ value = 0, size = 'md', showValue = false }) => {
  const fontSize = size === 'sm' ? '0.78rem' : size === 'lg' ? '1.2rem' : '1rem';
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(value)) stars.push('★');
    else if (i - value < 1 && i - value > 0) stars.push('⯨');
    else stars.push('☆');
  }
  return (
    <span style={{ color: '#f59e0b', fontSize, letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {stars.map((s, i) => <span key={i}>{s}</span>)}
      {showValue && <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginLeft: '4px' }}>{value.toFixed(1)}</span>}
    </span>
  );
};

export default Rating;
