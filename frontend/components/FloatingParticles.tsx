// FloatingParticles component
import React from 'react';

export default function FloatingParticles() {
  // Use deterministic values based on index to avoid hydration mismatch
  const getParticleStyle = (i: number) => {
    const seed = (i * 12321) % 1000;
    return {
      left: `${(seed / 1000) * 100}%`,
      top: `${((seed * 2) / 1000) * 100}%`,
      animationDelay: `${(seed / 1000) * 8}s`,
      animationDuration: `${6 + (seed / 1000) * 6}s`,
      width: `${1 + (seed / 1000) * 2}px`,
      height: `${1 + (seed / 1000) * 2}px`,
      opacity: 0.2 + (seed / 1000) * 0.5,
    };
  };

  return (
    <div className="cp-particles" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="cp-particle" style={getParticleStyle(i)} />
      ))}
    </div>
  );
}
