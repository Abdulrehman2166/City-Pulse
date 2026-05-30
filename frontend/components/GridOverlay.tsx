import React from 'react';

type GridOverlayProps = {
  intensity?: number;
};

export const GridOverlay: React.FC<GridOverlayProps> = ({ intensity = 1 }) => {
  return (
    <div 
      className="grid-overlay" 
      style={{ opacity: intensity * 0.5 }} 
      aria-hidden="true" 
    />
  );
};

export default GridOverlay;
