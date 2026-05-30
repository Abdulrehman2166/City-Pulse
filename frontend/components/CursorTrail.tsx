'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CursorTrail() {
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number; color: string; createdAt: number }>>([])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const trailIdCounter = useRef(0)
  
  const colors = ['#c8553d', '#4a8c6f', '#c9893a', '#7b6fa8', '#5272a0']
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newId = trailIdCounter.current++
      
      // Add new trail point
      setTrails(prev => [
        ...prev.slice(-20), // Keep last 20 trails
        { 
          id: newId, 
          x: e.clientX, 
          y: e.clientY, 
          color: colors[newId % colors.length], 
          createdAt: Date.now() 
        }
      ])
      
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trails.map((trail, index) => {
          const size = 12 - index * 0.5
          const opacity = 1 - index * 0.05
          return (
            <motion.div
              key={trail.id}
              initial={{ 
                x: trail.x - size / 2, 
                y: trail.y - size / 2, 
                scale: 0, 
                opacity: 1 
              }}
              animate={{ 
                scale: 1,
                opacity: opacity * 0.6
              }}
              exit={{ 
                scale: 0, 
                opacity: 0, 
                transition: { duration: 0.3 } 
              }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${trail.color}, transparent)`,
                boxShadow: `0 0 ${size * 2}px ${trail.color}, 0 0 ${size * 4}px ${trail.color}40`,
                pointerEvents: 'none',
              }}
            />
          )
        })}
      </AnimatePresence>
      
      {/* Main cursor glow */}
      <motion.div
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(156,183,255,0.4), transparent)',
          boxShadow: '0 0 40px rgba(156,183,255,0.5), 0 0 80px rgba(200,168,255,0.3)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: lastMousePos.current.x,
          y: lastMousePos.current.y,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          mass: 0.5,
        }}
      />
      
      {/* Secondary cursor glow */}
      <motion.div
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,85,61,0.6), transparent)',
          boxShadow: '0 0 30px rgba(200,85,61,0.6)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: lastMousePos.current.x,
          y: lastMousePos.current.y,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 15,
          mass: 0.3,
        }}
      />
    </div>
  )
}
