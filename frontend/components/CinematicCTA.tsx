import React, { useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { GridOverlay } from '@/components/GridOverlay'; // assuming exists, otherwise import from appropriate path
import FloatingParticles from '@/components/FloatingParticles';

type CinematicCTAProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

const CinematicCTA: React.FC<CinematicCTAProps> = ({
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1 }
      )
        .to('.cp-cta-primary', {
          scale: 1.05,
          boxShadow: '0 0 30px rgba(200,85,61,0.8)',
          duration: 0.6,
          yoyo: true,
          repeat: -1,
        }, '<')
        .to(
          '.cp-cta-primary',
          { backgroundColor: 'rgba(255,69,0,0.9)', duration: 0.8, yoyo: true, repeat: -1 },
          '<'
        )
        .to('.cp-cta-glow', { opacity: 0.6, duration: 1.5, yoyo: true, repeat: -1 }, '<');

      // Intensify particles within CTA
      const particles = document.querySelectorAll('.cp-cta-section .cp-particle');
      particles.forEach((p) => {
        gsap.to(p, {
          opacity: 0.6,
          scale: 1.5,
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cp-cta-section" ref={ctaRef} aria-label="Cinematic call to action">
      <GridOverlay intensity={2} />
      <Suspense fallback={null}>
        <FloatingParticles />
      </Suspense>
      <div className="cp-cta-glow" />
      <div className="cp-cta-inner">
        <div className="cp-eyebrow cp-reveal" style={{ justifyContent: 'center' }}>
          System Ready
        </div>
        <h2 className="cp-cta-title cp-reveal">{title}</h2>
        <p className="cp-cta-sub cp-reveal">{subtitle}</p>
        <div className="cp-cta-actions cp-reveal">
          <button className="cp-cta-primary large" onClick={onPrimaryClick}>
            <span className="cp-cta-icon">◈</span>
            {primaryLabel}
          </button>
          <button className="cp-cta-outline" onClick={onSecondaryClick}>
            {secondaryLabel}
          </button>
        </div>
        {/* Optional decorative element */}
        {/* <RadarPulse /> can be added if desired */}
      </div>
    </section>
  );
};

export default CinematicCTA;
