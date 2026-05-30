'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [visible, setVisible] = useState(false)

  // Motion values for smooth hardware-accelerated tracking
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Spring physics config for organic, fluid cursor trail
  const springConfig = { damping: 40, stiffness: 450, mass: 0.4 }
  const springConfigOuter = { damping: 30, stiffness: 220, mass: 0.8 }

  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const cursorXSpringOuter = useSpring(cursorX, springConfigOuter)
  const cursorYSpringOuter = useSpring(cursorY, springConfigOuter)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const handleMouseLeave = () => setVisible(false)
    const handleMouseEnter = () => setVisible(true)

    const addHoverListeners = () => {
      const targets = document.querySelectorAll('button, a, select, input, textarea, [role="button"], .cp-chip, .cp-hud-logo')
      targets.forEach(el => {
        el.addEventListener('mouseenter', () => setHovered(true))
        el.addEventListener('mouseleave', () => setHovered(false))
      });
    }

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    // Initial listeners
    addHoverListeners()

    // Keep dynamic elements updated
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    const handleMouseDown = () => setClicked(true)
    const handleMouseUp = () => setClicked(false)

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      observer.disconnect()
    }
  }, [cursorX, cursorY, visible])

  if (!visible) return null

  return (
    <>
      {/* Central Neon Cyan Glow Core */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#00f3ff',
          boxShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
        animate={{
          scale: clicked ? 0.6 : hovered ? 1.4 : 1,
        }}
      />

      {/* Holographic Outer Tactical Ring (Fluid Spring Trail) */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorXSpringOuter,
          y: cursorYSpringOuter,
          translateX: '-50%',
          translateY: '-50%',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px dashed rgba(0, 243, 255, 0.6)',
          zIndex: 999998,
          pointerEvents: 'none',
        }}
        animate={{
          scale: clicked ? 0.7 : hovered ? 2.0 : 1,
          borderColor: clicked ? '#00f3ff' : hovered ? '#00f3ff' : 'rgba(0, 243, 255, 0.4)',
          rotate: hovered ? 180 : 0,
          boxShadow: hovered ? '0 0 15px rgba(0, 243, 255, 0.35)' : 'none',
        }}
        transition={{
          rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
          scale: { type: 'spring', stiffness: 300, damping: 20 },
        }}
      />

      {/* Outer Glow Shield Aura */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorXSpringOuter,
          y: cursorYSpringOuter,
          translateX: '-50%',
          translateY: '-50%',
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid rgba(0, 243, 255, 0.1)',
          zIndex: 999997,
          pointerEvents: 'none',
        }}
        animate={{
          scale: hovered ? 1.6 : 1,
          opacity: hovered ? 0.8 : 0.3,
        }}
      />
    </>
  )
}
