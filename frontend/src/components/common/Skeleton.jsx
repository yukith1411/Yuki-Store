import React from 'react';

const Skeleton = ({ height = '20px', width = '100%', borderRadius = '8px', style = {}, count = 1 }) => {
  const items = Array(count).fill(0);
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, width, borderRadius, ...style }}
        />
      ))}
    </>
  );
};

export default Skeleton;
