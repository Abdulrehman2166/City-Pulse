import React from 'react';

/**
 * HUDOverlay – renders the persistent tactical HUD elements that appear on every page.
 * It includes:
 *   • Scanline overlay (moving scan line)
 *   • Radar pulse animation
 *   • Rotating tactical ring
 *   • Blinking emergency indicator
 *   • Reactive signal bar
 *   • Optional GridOverlay for background texture (can be toggled via prop)
 */
export const HUDOverlay: React.FC<{ showGrid?: boolean }> = ({ showGrid = true }) => {
  return (
    <>
      {/* Scanline overlay – fixed, top‑most element */}
      <div className="scanline-overlay" />

      {/* Radar pulse – centered */}
      <div className="radar-pulse" />

      {/* Rotating tactical ring – bottom‑left corner */}
      <div className="rotating-ring" />

      {/* Blinking emergency indicator – top‑right corner */}
      <div className="emergency-indicator" />

      {/* Reactive signal bar – bottom‑right corner */}
      <div className="reactive-signal" />

      {/* Optional grid overlay for subtle texture */}
      {showGrid && <div className="grid-overlay" />}
    </>
  );
};

export default HUDOverlay;
