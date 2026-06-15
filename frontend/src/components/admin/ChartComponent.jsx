import React from 'react';

const ChartComponent = () => {
  // Curated monthly earnings mockup data
  const monthlySales = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 62000 },
    { month: 'Mar', amount: 55000 },
    { month: 'Apr', amount: 80000 },
    { month: 'May', amount: 95000 },
    { month: 'Jun', amount: 110000 }
  ];

  const maxAmount = Math.max(...monthlySales.map(s => s.amount));
  const chartHeight = 160;
  const chartWidth = 500;

  return (
    <div style={{
      backgroundColor: 'var(--bg-tertiary)',
      border: '1px solid var(--border-light)',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Revenue Overview (Last 6 Months)</h3>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: `${chartHeight}px`, paddingTop: '20px' }}>
        {monthlySales.map((sale, idx) => {
          const barHeight = (sale.amount / maxAmount) * 120; // max bar height 120px
          return (
            <div key={idx} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>₹{sale.amount / 1000}k</span>
              <div style={{
                height: `${barHeight}px`,
                width: '100%',
                maxWidth: '40px',
                backgroundColor: 'var(--primary)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.8s ease'
              }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{sale.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartComponent;
