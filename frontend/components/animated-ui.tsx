'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export const AnimatedCard = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
)

export const AnimatedSection = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.section>
)

export const AnimatedButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
)

export const GlowingButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.04, boxShadow: '0 18px 40px rgba(200, 90, 55, 0.25)' }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    className={`transition-all ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export const AnimatedGradientBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      animate={{
        background: [
          'linear-gradient(135deg, #F7F9FC 0%, #EEF1F5 50%, #FFFFFF 100%)',
          'linear-gradient(135deg, #FFFFFF 0%, color-mix(in srgb, #4DA3FF 6%, #F7F9FC) 40%, color-mix(in srgb, #7C5CFF 4%, #EEF1F5) 70%, #F7F9FC 100%)',
          'linear-gradient(135deg, #F7F9FC 0%, #EEF1F5 50%, #FFFFFF 100%)',
        ]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      className="w-full h-full"
    />
  </div>
)

export const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.8 }}
    className="inline-flex flex-wrap"
  >
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + i * 0.02, duration: 0.5 }}
        className="inline-block"
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </motion.span>
)

export const AnimatedBox3D = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ rotateX: 0, rotateY: 0 }}
    animate={{ rotateX: [0, 5, -5, 0], rotateY: [0, 5, -5, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    className="w-full"
  >
    {children}
  </motion.div>
)

export const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
          className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full blur-sm"
        />
      ))}
    </div>
  )
}

export const ShimmerText = ({ text, className = '' }: { text: string; className?: string }) => (
  <motion.div
    className={`relative ${className}`}
    initial={{ backgroundPosition: '200% center' }}
    animate={{ backgroundPosition: '-200% center' }}
    transition={{ duration: 3, repeat: Infinity }}
    style={{
      backgroundImage: 'linear-gradient(90deg, rgba(255,197,154,0.08) 0%, rgba(255,197,154,0.28) 50%, rgba(255,197,154,0.08) 100%)',
      backgroundSize: '200% 100%',
    }}
  >
    <span className="bg-linear-to-r from-[#B67A53] via-[#E0B58C] to-[#B67A53] bg-clip-text text-transparent">
      {text}
    </span>
  </motion.div>
)
