import React, { useState } from 'react';

const ZoomImage = ({ src, alt, style = {} }) => {
  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: 'center center',
    transform: 'scale(1)'
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        cursor: 'zoom-in',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-secondary)',
        ...style
      }}
    >
      <img
        src={src}
        alt={alt}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.1s ease-out, transform-origin 0.1s ease-out',
          ...zoomStyle
        }}
      />
    </div>
  );
};

export default ZoomImage;
